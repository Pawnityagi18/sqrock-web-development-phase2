import express from 'express';
import Contract from '../models/Contract.js';
import User from '../models/User.js';
import razorpay from '../config/razorpay.js';
import { protect } from '../middleware/authMiddleware.js';
import { createNotification } from './notificationRoutes.js';

const PLATFORM_FEE_PERCENT = 10; // WorkPulse's cut on each released milestone

const router = express.Router();

// GET /api/contracts - Get all contracts relevant to logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const contracts = await Contract.find({
      $or: [{ client: req.user._id }, { freelancer: req.user._id }]
    })
      .populate('client', 'name email avatar')
      .populate('freelancer', 'name email avatar title rating')
      .populate('project', 'title category budget')
      .sort({ createdAt: -1 });

    res.json({ success: true, contracts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/contracts/:id - Get specific contract
router.get('/:id', protect, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('client', 'name email avatar')
      .populate('freelancer', 'name email avatar title rating')
      .populate('project', 'title category budget description');

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    // Ensure user is client or freelancer on this contract
    if (
      contract.client._id.toString() !== req.user._id.toString() &&
      contract.freelancer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// NOTE: The old POST /:id/milestones/:milestoneId/fund endpoint has been removed.
// It used to mark a milestone 'funded' directly with no payment check, which meant
// a client could fund escrow without ever paying. Real funding now goes through
// POST /api/payments/contracts/:id/milestones/:milestoneId/checkout (Razorpay Order +
// Checkout), confirmed via webhook or POST /api/payments/verify.

// POST /api/contracts/:id/milestones/:milestoneId/submit - Freelancer submits work for milestone
router.post('/:id/milestones/:milestoneId/submit', protect, async (req, res) => {
  try {
    const { submissionNotes } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    if (contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only assigned freelancer can submit work' });
    }

    const milestone = contract.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    if (milestone.status !== 'funded') {
      return res.status(400).json({ success: false, message: 'Milestone must be funded before submitting work' });
    }

    milestone.status = 'submitted';
    milestone.submissionNotes = submissionNotes || 'Work delivered for client review';
    await contract.save();

    await createNotification(
      contract.client,
      'milestone_submitted',
      `Work submitted for milestone "${milestone.title}" — review and release when ready.`,
      '/dashboard?tab=contracts'
    );

    res.json({ success: true, message: 'Work submitted for review', contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/contracts/:id/milestones/:milestoneId/release - Client releases escrow payment
router.post('/:id/milestones/:milestoneId/release', protect, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only client can release payment' });
    }

    const milestone = contract.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    if (!['funded', 'submitted'].includes(milestone.status)) {
      return res.status(400).json({ success: false, message: 'Milestone cannot be released in current state' });
    }

    const freelancer = await User.findById(contract.freelancer);
    if (!freelancer?.razorpayAccountId || !freelancer.razorpayOnboardingComplete) {
      return res.status(400).json({ success: false, message: 'Freelancer has not finished setting up payouts yet.' });
    }
    if (!milestone.razorpayPaymentId) {
      return res.status(400).json({ success: false, message: 'No captured payment found for this milestone.' });
    }

    const platformFee = Math.round(milestone.amount * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
    const netAmount = Math.round((milestone.amount - platformFee) * 100) / 100;

    // Route: Create Transfers from Payments — moves funds from the already-captured
    // payment to the freelancer's Linked Account. on_hold: 0 releases immediately.
    const transferResponse = await razorpay.payments.transfer(milestone.razorpayPaymentId, {
      transfers: [{
        account: freelancer.razorpayAccountId,
        amount: Math.round(netAmount * 100), // paise
        currency: 'INR',
        on_hold: 0,
        notes: {
          contractId: contract._id.toString(),
          milestoneId: milestone._id.toString()
        }
      }]
    });

    milestone.status = 'released';
    milestone.releasedAt = new Date();
    milestone.platformFee = platformFee;
    milestone.razorpayTransferId = transferResponse.items?.[0]?.id || null;

    // Check if all milestones released
    const allReleased = contract.milestones.every(m => m.status === 'released');
    if (allReleased) {
      contract.status = 'completed';
    }

    await contract.save();

    await createNotification(
      contract.freelancer,
      'milestone_released',
      `Payment of ₹${netAmount} released for milestone "${milestone.title}".`,
      '/dashboard?tab=contracts'
    );

    res.json({ success: true, message: 'Payment released to freelancer', contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/contracts/:id/dispute — either party flags a contract for admin review
router.post('/:id/dispute', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    const userId = req.user._id.toString();
    if (contract.client.toString() !== userId && contract.freelancer.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You are not part of this contract' });
    }
    if (contract.status === 'completed' || contract.status === 'cancelled') {
      return res.status(400).json({ success: false, message: `Cannot dispute a ${contract.status} contract.` });
    }

    contract.status = 'disputed';
    contract.disputeReason = reason || 'No reason provided';
    contract.disputeRaisedBy = req.user._id;
    await contract.save();

    // Notify the other party
    const otherParty = contract.client.toString() === userId ? contract.freelancer : contract.client;
    await createNotification(
      otherParty,
      'contract_disputed',
      `A dispute was raised on contract "${contract.title}". Our team will review it.`,
      '/dashboard?tab=contracts'
    );

    res.json({ success: true, message: 'Dispute raised. Our team will review this contract.', contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

import express from 'express';
import Contract from '../models/Contract.js';
import { protect } from '../middleware/authMiddleware.js';

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

// POST /api/contracts/:id/milestones/:milestoneId/fund - Client funds milestone (Escrow)
router.post('/:id/milestones/:milestoneId/fund', protect, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only client can fund milestone' });
    }

    const milestone = contract.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    if (milestone.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Milestone is already ${milestone.status}` });
    }

    milestone.status = 'funded';
    milestone.fundedAt = new Date();
    await contract.save();

    res.json({ success: true, message: 'Milestone funded into Escrow', contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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

    milestone.status = 'released';
    milestone.releasedAt = new Date();

    // Check if all milestones released
    const allReleased = contract.milestones.every(m => m.status === 'released');
    if (allReleased) {
      contract.status = 'completed';
    }

    await contract.save();

    res.json({ success: true, message: 'Payment released to freelancer', contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

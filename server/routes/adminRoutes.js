import express from 'express';
import User from '../models/User.js';
import Contract from '../models/Contract.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { createNotification } from './notificationRoutes.js';

const router = express.Router();

// All routes here require an authenticated admin
router.use(protect, requireRole('admin'));

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/disputes — contracts currently flagged as disputed
router.get('/disputes', async (req, res) => {
  try {
    const disputes = await Contract.find({ status: 'disputed' })
      .populate('client', 'name email')
      .populate('freelancer', 'name email')
      .populate('project', 'title')
      .populate('disputeRaisedBy', 'name email')
      .sort({ updatedAt: -1 });
    res.json({ success: true, disputes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/disputes/:contractId/resolve
// resolution: 'refund_client' | 'pay_freelancer' | 'reactivate' — refunds/payouts still
// require manual action in the Stripe dashboard for now; this records the decision and
// updates contract status. See README note on why automatic reversal isn't wired here.
router.post('/disputes/:contractId/resolve', async (req, res) => {
  try {
    const { resolution, notes } = req.body;
    if (!resolution) return res.status(400).json({ success: false, message: 'A resolution decision is required.' });

    const contract = await Contract.findById(req.params.contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });
    if (contract.status !== 'disputed') {
      return res.status(400).json({ success: false, message: 'This contract is not currently disputed.' });
    }

    contract.status = resolution === 'reactivate' ? 'active' : 'completed';
    contract.disputeResolution = `${resolution}${notes ? `: ${notes}` : ''}`;
    await contract.save();

    await createNotification(contract.client, 'contract_disputed', `Dispute on "${contract.title}" was resolved by our team.`, '/dashboard?tab=contracts');
    await createNotification(contract.freelancer, 'contract_disputed', `Dispute on "${contract.title}" was resolved by our team.`, '/dashboard?tab=contracts');

    res.json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

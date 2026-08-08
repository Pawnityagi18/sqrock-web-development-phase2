import express from 'express';
import Proposal from '../models/Proposal.js';
import Project from '../models/Project.js';

const router = express.Router();

// GET /api/proposals
router.get('/', async (req, res) => {
  try {
    const proposals = await Proposal.find().sort({ createdAt: -1 });
    res.json({ success: true, proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/proposals
router.post('/', async (req, res) => {
  try {
    const newProposal = await Proposal.create(req.body);
    // Increment project proposals count
    if (req.body.projectId) {
      await Project.findByIdAndUpdate(req.body.projectId, { $inc: { proposalsCount: 1 } });
    }
    res.json({ success: true, proposal: newProposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/proposals/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const proposal = await Proposal.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

import express from 'express';
import Proposal from '../models/Proposal.js';
import Project from '../models/Project.js';
import Contract from '../models/Contract.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { createNotification } from './notificationRoutes.js';

const router = express.Router();

// GET /api/proposals
router.get('/', protect, async (req, res) => {
  try {
    const { projectId } = req.query;
    let query = {};

    if (projectId) {
      query.project = projectId;
    } else if (req.user.role === 'freelancer') {
      query.freelancer = req.user._id;
    }

    const proposals = await Proposal.find(query)
      .populate('project', 'title category budget status client')
      .populate('freelancer', 'name email avatar title rating jobSuccessRate')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: proposals.length, proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/proposals - Freelancer submits proposal
router.post('/', protect, requireRole('freelancer'), async (req, res) => {
  try {
    const { projectId, coverLetter, bidAmount, estimatedDays } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const existingProposal = await Proposal.findOne({ project: projectId, freelancer: req.user._id });
    if (existingProposal) {
      return res.status(400).json({ success: false, message: 'You have already submitted a proposal for this project' });
    }

    const proposal = await Proposal.create({
      project: projectId,
      freelancer: req.user._id,
      coverLetter,
      bidAmount,
      estimatedDays,
      status: 'Pending'
    });

    // Increment proposals count on project
    await Project.findByIdAndUpdate(projectId, { $inc: { proposalsCount: 1 } });

    const populated = await Proposal.findById(proposal._id)
      .populate('project', 'title category budget status')
      .populate('freelancer', 'name email avatar title rating');

    await createNotification(
      project.client,
      'proposal_received',
      `${populated.freelancer.name} submitted a proposal on "${project.title}"`,
      '/dashboard?tab=posted-jobs'
    );

    res.status(201).json({ success: true, proposal: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/proposals/:id/accept - Client accepts proposal & creates Contract
router.post('/:id/accept', protect, requireRole('client'), async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('project');
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    if (proposal.project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only project owner can accept proposal' });
    }

    proposal.status = 'Accepted';
    await proposal.save();

    // Mark project as In Progress
    await Project.findByIdAndUpdate(proposal.project._id, { status: 'In Progress' });

    // Create Contract automatically with initial milestone
    const contract = await Contract.create({
      project: proposal.project._id,
      client: req.user._id,
      freelancer: proposal.freelancer,
      proposal: proposal._id,
      title: proposal.project.title,
      totalAmount: proposal.bidAmount,
      status: 'active',
      milestones: [{
        title: 'Initial Project Deliverable & Final Completion',
        amount: proposal.bidAmount,
        status: 'pending'
      }]
    });

    // Notify freelancer
    await createNotification(
      proposal.freelancer,
      'proposal_accepted',
      `Your proposal on "${proposal.project.title}" was accepted! A contract has been created.`,
      '/dashboard?tab=contracts'
    );

    res.json({ success: true, message: 'Proposal accepted and contract initialized', proposal, contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

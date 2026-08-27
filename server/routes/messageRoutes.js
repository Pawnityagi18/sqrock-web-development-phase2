import express from 'express';
import Message from '../models/Message.js';
import Contract from '../models/Contract.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/messages/:contractId - Get all chat messages for contract
router.get('/:contractId', protect, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    if (
      contract.client.toString() !== req.user._id.toString() &&
      contract.freelancer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized for this workroom' });
    }

    const messages = await Message.find({ contract: req.params.contractId })
      .populate('sender', 'name avatar role')
      .populate('recipient', 'name avatar role')
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/messages/:contractId - Send message in workroom
router.post('/:contractId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    const contract = await Contract.findById(req.params.contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    const isClient = contract.client.toString() === req.user._id.toString();
    const isFreelancer = contract.freelancer.toString() === req.user._id.toString();

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, message: 'Not authorized for this workroom' });
    }

    const recipient = isClient ? contract.freelancer : contract.client;

    const message = await Message.create({
      contract: contract._id,
      sender: req.user._id,
      recipient,
      content: content.trim()
    });

    const populatedMsg = await Message.findById(message._id)
      .populate('sender', 'name avatar role')
      .populate('recipient', 'name avatar role');

    res.json({ success: true, message: populatedMsg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

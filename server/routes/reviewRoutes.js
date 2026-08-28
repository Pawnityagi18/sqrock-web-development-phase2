import express from 'express';
import Review from '../models/Review.js';
import Contract from '../models/Contract.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

async function recalculateRating(userId) {
  const reviews = await Review.find({ reviewee: userId });
  if (reviews.length === 0) return;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await User.findByIdAndUpdate(userId, {
    rating: Math.round(avg * 10) / 10,
    reviewsCount: reviews.length
  });
}

// POST /api/reviews — leave a review for the other party on a completed contract
router.post('/', protect, async (req, res) => {
  try {
    const { contractId, rating, comment } = req.body;
    if (!contractId || !rating) {
      return res.status(400).json({ success: false, message: 'contractId and rating are required.' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });

    const userId = req.user._id.toString();
    const isClient = contract.client.toString() === userId;
    const isFreelancer = contract.freelancer.toString() === userId;
    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, message: 'You are not part of this contract.' });
    }
    if (contract.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'You can only review a completed contract.' });
    }

    const revieweeId = isClient ? contract.freelancer : contract.client;

    const review = await Review.create({
      contract: contract._id,
      project: contract.project,
      reviewer: userId,
      reviewee: revieweeId,
      rating,
      comment
    });

    await recalculateRating(revieweeId);

    res.status(201).json({ success: true, review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You already reviewed this contract.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reviews/user/:userId — public list of reviews received by a user
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reviews/contract/:contractId — check whether the current user already reviewed this contract
router.get('/contract/:contractId', protect, async (req, res) => {
  try {
    const existing = await Review.findOne({ contract: req.params.contractId, reviewer: req.user._id });
    res.json({ success: true, alreadyReviewed: Boolean(existing) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

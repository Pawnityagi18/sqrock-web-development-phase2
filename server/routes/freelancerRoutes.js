import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET /api/freelancers
router.get('/', async (req, res) => {
  try {
    const freelancers = await User.find({ role: 'freelancer' });
    res.json({ success: true, freelancers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

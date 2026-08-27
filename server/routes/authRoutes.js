import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect, JWT_SECRET } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      user: userObj,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'freelancer',
      avatar: role === 'client' 
        ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80'
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      user: userObj,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

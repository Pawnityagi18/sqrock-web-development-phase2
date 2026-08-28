import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure the uploads directory exists (won't exist on a fresh clone/deploy)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${req.user._id}-${Date.now()}${ext}`;
    cb(null, safeName);
  }
});

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, WEBP, and GIF images are allowed.'));
    }
    cb(null, true);
  }
});

const router = express.Router();

// POST /api/uploads/avatar — uploads a new avatar image and updates the user's profile
router.post('/avatar', protect, (req, res) => {
  upload.single('avatar')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    try {
      const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
      const fileUrl = `${backendUrl}/uploads/${req.file.filename}`;
      const user = await User.findByIdAndUpdate(req.user._id, { avatar: fileUrl }, { new: true });
      res.json({ success: true, avatar: fileUrl, user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
});

export default router;

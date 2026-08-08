import express from 'express';
import Project from '../models/Project.js';

const router = express.Router();

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    const newProject = await Project.create(req.body);
    res.json({ success: true, project: newProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/projects/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

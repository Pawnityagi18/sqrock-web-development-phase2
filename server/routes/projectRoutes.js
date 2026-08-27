import express from 'express';
import Project from '../models/Project.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const { category, search, client } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (client) {
      query.client = client;
    }

    const projects = await Project.find(query)
      .populate('client', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('client', 'name email avatar');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/projects (Client protection required)
router.post('/', protect, requireRole('client'), async (req, res) => {
  try {
    const { title, description, category, budget, skills, duration } = req.body;

    const project = await Project.create({
      title,
      description,
      category,
      budget,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      duration: duration || '1-3 months',
      client: req.user._id,
      status: 'Open'
    });

    const populated = await Project.findById(project._id).populate('client', 'name email avatar');
    res.status(201).json({ success: true, project: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

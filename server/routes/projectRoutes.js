import mongoose from 'mongoose';
import express from 'express';
import Project from '../models/Project.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const { category, search, skills, minBudget, maxBudget, budgetMin, budgetMax, projectType, experience, location, remote, datePosted, urgency, sort = 'newest', page = 1, limit = 12, client } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (search?.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { skills: { $in: [new RegExp(term, 'i')] } },
        { category: { $regex: term, $options: 'i' } },
        { categoryName: { $regex: term, $options: 'i' } }
      ];
    }
    const skillList = String(skills || '').split(',').map(s => s.trim()).filter(Boolean);
    if (skillList.length) query.skills = { $all: skillList.map(skill => new RegExp(`^${skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i')) };
    const low = Number(minBudget ?? budgetMin);
    const high = Number(maxBudget ?? budgetMax);
    if (Number.isFinite(low) || Number.isFinite(high)) {
      query.budget = {};
      if (Number.isFinite(low)) query.budget.$gte = low;
      if (Number.isFinite(high)) query.budget.$lte = high;
    }
    if (projectType && ['Fixed', 'Hourly'].includes(projectType)) query.budgetType = projectType;
    if (experience) query.experience = experience;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (remote === 'true') query.isRemote = true;
    if (urgency && urgency !== 'all') query.urgency = urgency;
    if (datePosted && datePosted !== 'all') {
      const days = { day: 1, week: 7, month: 30 }[datePosted];
      if (days) query.createdAt = { $gte: new Date(Date.now() - days * 86400000) };
    }
    if (client) {
      query.client = client;
    }

   const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
const pageSize = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 12));
const sortMap = {
  'budget-high': { budget: -1 },
  'budget-low': { budget: 1 },
  proposals: { proposalsCount: -1 },
  oldest: { createdAt: 1 },
  newest: { createdAt: -1 },
  latest: { createdAt: -1 }
};

console.log('🔍 Mongoose readyState:', mongoose.connection.readyState);
console.log('🔍 Mongoose host:', mongoose.connection.host);
console.log('🔍 Mongoose DB:', mongoose.connection.name);

const [projects, total] = await Promise.all([
  Project.find(query)
    .populate('client', 'name email avatar')
      .sort(sortMap[sort] || sortMap.newest)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize), Project.countDocuments(query)]);

    res.json({ success: true, count: projects.length, total, page: pageNumber, pages: Math.ceil(total / pageSize), projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clients may only change or remove their own projects. Projects with a contract
// stay immutable so the agreed scope cannot be changed after hiring.
router.patch('/:id', protect, requireRole('client'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.client.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Only the project owner can edit this project' });
    if (project.status !== 'Open') return res.status(400).json({ success: false, message: 'Only open projects can be edited' });
    const allowed = ['title', 'description', 'category', 'categoryId', 'categoryName', 'budget', 'budgetType', 'duration', 'deadline', 'daysLeft', 'urgency', 'skills', 'deliverables'];
    for (const key of allowed) if (req.body[key] !== undefined) project[key] = req.body[key];
    await project.save();
    res.json({ success: true, project: await project.populate('client', 'name email avatar') });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.delete('/:id', protect, requireRole('client'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.client.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Only the project owner can delete this project' });
    if (project.status !== 'Open') return res.status(400).json({ success: false, message: 'Only open projects can be deleted' });
    await project.deleteOne();
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
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
    const {
      title, description, category, categoryName, budget, skills, duration,
      budgetType, deadline, daysLeft, urgency, deliverables
    } = req.body;

    if (!title || !description || !category || !Number.isFinite(Number(budget)) || Number(budget) <= 0) {
      return res.status(400).json({ success: false, message: 'Title, description, category, and a valid budget are required' });
    }

    const project = await Project.create({
      title,
      description,
      category,
      categoryId: category,
      categoryName: categoryName || category,
      budget,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      duration: duration || '1-3 months',
      budgetType: budgetType === 'Hourly' ? 'Hourly' : 'Fixed',
      deadline,
      daysLeft,
      urgency: ['Featured', 'Urgent', 'Hot', 'Standard'].includes(urgency) ? urgency : 'Standard',
      deliverables: Array.isArray(deliverables) ? deliverables : [],
      client: req.user._id,
      clientName: req.user.name,
      clientAvatar: req.user.avatar,
      verifiedClient: true,
      status: 'Open'
    });

    const populated = await Project.findById(project._id).populate('client', 'name email avatar');
    res.status(201).json({ success: true, project: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

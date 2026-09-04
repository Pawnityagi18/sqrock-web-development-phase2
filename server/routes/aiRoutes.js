import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Keys remain server-only. This uses the OpenAI-compatible Responses API via
// native fetch, so no browser bundle or client-side key is involved.
router.post('/project-description', protect, requireRole('client'), async (req, res) => {
  const { title, category, skills = [], budget, notes = '' } = req.body;
  if (!title?.trim() || !category?.trim()) return res.status(400).json({ success: false, message: 'Title and category are required.' });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ success: false, message: 'AI is not configured. Set OPENAI_API_KEY on the server.' });
  try {
    const prompt = `Write a concise, professional freelance project description (120-180 words). Include scope, 3-5 practical deliverables, and candidate expectations. Do not invent requirements or promise outcomes. Title: ${title}. Category: ${category}. Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}. Budget: ${budget || 'not specified'}. Client notes: ${notes}`;
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', input: prompt, max_output_tokens: 350 })
    });
    const data = await response.json();
    if (!response.ok) return res.status(502).json({ success: false, message: data?.error?.message || 'AI generation failed.' });
    const description = data.output_text || data.output?.flatMap(item => item.content || []).find(item => item.type === 'output_text')?.text;
    if (!description) return res.status(502).json({ success: false, message: 'AI returned no description.' });
    res.json({ success: true, description: description.trim() });
  } catch (error) { res.status(502).json({ success: false, message: 'AI service is unavailable.' }); }
});

export default router;

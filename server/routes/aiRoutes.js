import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/project-description', protect, requireRole('client'), async (req, res) => {
  const { title, category, skills = [], budget, notes = '' } = req.body;

  if (!title?.trim() || !category?.trim()) {
    return res.status(400).json({ success: false, message: 'Title and category are required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ success: false, message: 'AI is not configured. Set GEMINI_API_KEY in .env' });
  }

  try {
    const formattedSkills = Array.isArray(skills) ? skills.join(', ') : skills;

    const prompt = `You are an expert technical project manager drafting a professional freelance job posting.

Write a clean, detailed, and professional project description for:
- Project Title: ${title}
- Category: ${category}
- Required Skills: ${formattedSkills}
- Budget: ${budget || 'Negotiable'}
- Client Notes: ${notes || 'None'}

Formatting Rules:
- STRICTLY DO NOT USE any asterisks (* or **). No markdown bold and no asterisk bullets.
- Use clean uppercase headings for sections (e.g. PROJECT OVERVIEW:, PROPOSED SOLUTION:, TECH STACK:, KEY DELIVERABLES:, CANDIDATE REQUIREMENTS:).
- Use clean numbered lists (1., 2., 3.) or simple hyphens (- ) for bullet points.

Structure to follow:
PROJECT OVERVIEW & PROBLEM STATEMENT:
Describe the real-world problem and why this project is needed.

PROPOSED SOLUTION & CORE FEATURES:
Outline the key features and user workflow.

RECOMMENDED TECH STACK:
Explain how ${formattedSkills || 'the selected technologies'} will be utilized.

KEY DELIVERABLES:
List 4-5 concrete deliverables.

CANDIDATE REQUIREMENTS:
List required experience and qualifications.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 1200,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({ success: false, message: data?.error?.message || 'Gemini generation failed.' });
    }

    let description = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!description) {
      return res.status(502).json({ success: false, message: 'AI returned no description.' });
    }

    // Saare asterisks (*) aur (**) ko automatically remove karne ke liye
    description = description.replace(/\*{1,3}/g, '').trim();

    res.json({ success: true, description });
  } catch (error) {
    console.error('AI Route Error:', error);
    res.status(502).json({ success: false, message: 'AI service is unavailable.' });
  }
});

export default router;
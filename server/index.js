import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';
import freelancerRoutes from './routes/freelancerRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'WorkPulse Full-Stack Express Server active.' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/messages', messageRoutes);

app.listen(PORT, () => {
  console.log(`🚀 WorkPulse Full-Stack Server running at http://localhost:${PORT}`);
});

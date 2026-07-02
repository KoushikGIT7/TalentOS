import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import jobRoutes from './routes/job.routes.js';
import applicationRoutes from './routes/application.routes.js';
import profileRoutes from './routes/profile.routes.js';
import aiRoutes from './routes/ai.routes.js';

// Load env vars first — must be before anything reads process.env
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Security & Logging Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Body Parsing
app.use(express.json({ limit: '10kb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TalentOS API is running 🚀' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler for unmatched API routes
app.use('/api/*path', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  console.error(`[ERROR] ${err.message}`);
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

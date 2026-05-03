import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

import { env } from './config/env';
import { defaultLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { ensureUploadDir } from './services/upload.service';

import authRoutes from './routes/auth.routes';
import trackRoutes from './routes/track.routes';
import shipmentRoutes from './routes/shipment.routes';
import calculatorRoutes from './routes/calculator.routes';
import userRoutes from './routes/user.routes';
import businessRoutes from './routes/business.routes';
import adminRoutes from './routes/admin.routes';
import blogRoutes from './routes/blog.routes';
import counterRoutes from './routes/counter.routes';
import reportsRoutes from './routes/reports.routes';
import { getPublicCms } from './controllers/admin.controller';

const app = express();

// ─── Security & parsing ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Rate limiting ────────────────────────────────────────────────────────────
app.use('/api', defaultLimiter);

// ─── Static files (uploads) ───────────────────────────────────────────────────
const uploadDir = ensureUploadDir();
app.use('/uploads', express.static(uploadDir));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── API routes ───────────────────────────────────────────────────────────────
const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/track`, trackRoutes);
app.use(`${API}/shipments`, shipmentRoutes);
app.use(`${API}/calculator`, calculatorRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/business`, businessRoutes);
app.use(`${API}/admin`, adminRoutes);
app.use(`${API}/blog`, blogRoutes);
app.use(`${API}/counter`, counterRoutes);
app.use(`${API}/reports`, reportsRoutes);
app.get(`${API}/cms`, getPublicCms);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;

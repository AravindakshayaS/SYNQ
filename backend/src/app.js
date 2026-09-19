import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { authenticate, errorHandler, HttpError } from './middleware.js';
import { authRoutes } from './routes/auth.js';
import { adminRoutes } from './routes/admin.js';
import { taskRoutes, journalRoutes, scheduleRoutes } from './routes/productivity.js';
import { generatePlan } from './services/planner.js';

export function createApp(config) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.TRUST_PROXY_HOPS);
  app.use((req, res, next) => { req.id = randomUUID(); res.set('X-Request-Id', req.id); next(); });
  app.use(helmet());
  app.use(cors({ origin: config.CLIENT_URL, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }));
  app.use(express.json({ limit: '128kb' }));
  app.get('/api/health', (req, res) => {
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'unavailable' });
  });
  app.use('/api', rateLimit({ windowMs: 60000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }));
  app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.use('/api/auth', authRoutes(config));
  app.use('/api', authenticate(config));
  app.use('/api/tasks', taskRoutes());
  app.use('/api/journals', journalRoutes());
  app.post('/api/schedules/generate', rateLimit({
    windowMs: 3600000, limit: 10, keyGenerator: req => String(req.user._id),
    standardHeaders: 'draft-8', legacyHeaders: false,
  }), async (req, res) => {
    const { input } = z.object({ input: z.string().trim().min(1).max(5000) }).strict().parse(req.body);
    res.json({ data: { blocks: await generatePlan(input, config), saved: false } });
  });
  app.use('/api/schedules', scheduleRoutes());
  app.use('/api/admin', adminRoutes());
  app.use((req, res, next) => next(new HttpError(404, 'Route not found')));
  app.use(errorHandler);
  return app;
}

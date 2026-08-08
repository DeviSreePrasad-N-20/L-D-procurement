import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';
import itemsRoutes from './routes/items.routes.js';
import forecastsRoutes from './routes/forecasts.routes.js';
import usersRoutes from './routes/users.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import auditLogsRoutes from './routes/auditLogs.routes.js';
import operationsRoutes from './routes/operations.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

  // Versioned API surface
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/items', itemsRoutes);
  app.use('/api/v1', forecastsRoutes); // exposes /api/v1/items/:itemId/forecasts[...]
  app.use('/api/v1/users', usersRoutes);
  app.use('/api/v1/notifications', notificationsRoutes);
  app.use('/api/v1/audit-logs', auditLogsRoutes);
  app.use('/api/v1/operations', operationsRoutes);
  app.use('/api/v1/ai', aiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/index.js';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initSocket } from './socket/index.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import opportunityRoutes from './routes/opportunities.js';
import messageRoutes from './routes/messages.js';
import fileRoutes from './routes/files.js';
import logger from './utils/logger.js';

const app = express();
const server = createServer(app);

// Security headers
app.use(helmet({
  contentSecurityPolicy: config.parentAppOrigin ? {
    directives: {
      defaultSrc: ["'self'"],
      frameAncestors: ["'self'", config.parentAppOrigin],
    },
  } : undefined,
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));

// Trust proxy (behind ALB/ingress in EKS)
app.set('trust proxy', 1);

// API routes
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/files', fileRoutes);

// Error handler
app.use(errorHandler);

// Init Socket.io
initSocket(server);

// Start
async function start() {
  await connectDB();

  if (config.seedOnStart) {
    const { seed } = await import('./seed/seedData.js');
    await seed();
  }

  server.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
  });
}

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

// Graceful shutdown
async function gracefulShutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully`);

  server.close(() => {
    logger.info('HTTP server closed');
  });

  const mongoose = (await import('mongoose')).default;
  await mongoose.connection.close();
  logger.info('Database connection closed');

  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

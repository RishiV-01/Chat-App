import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { seed } from './seed/seedData.js';
import { initSocket } from './socket/index.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import opportunityRoutes from './routes/opportunities.js';
import messageRoutes from './routes/messages.js';
import fileRoutes from './routes/files.js';
import logger from './utils/logger.js';

// =============================================================================
// PRODUCTION: Security middleware imports (uncomment when going to production)
// =============================================================================
// Prerequisites:
//   npm install helmet express-rate-limit
//
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);

// =============================================================================
// POC: Simple CORS (current)
// =============================================================================
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());

// =============================================================================
// PRODUCTION: Security hardening (uncomment & replace the CORS line above)
// =============================================================================
// // Helmet adds security headers (X-Frame-Options, CSP, HSTS, etc.)
// app.use(helmet());
//
// // CORS with multiple allowed origins (parent app domain + ChatApp domain)
// app.use(cors({
//   origin: config.security.corsOrigins,
//   credentials: true,
//   methods: ['GET', 'POST', 'PATCH', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
// }));
//
// app.use(express.json({ limit: '1mb' }));  // Limit request body size
//
// // Rate limiting — protects against brute force and abuse
// const apiLimiter = rateLimit({
//   windowMs: config.security.rateLimitWindowMs,
//   max: config.security.rateLimitMaxRequests,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: { error: 'Too many requests, please try again later' },
// });
// app.use('/api/', apiLimiter);
//
// // Trust proxy — required when behind a load balancer (EKS ingress / ALB)
// app.set('trust proxy', 1);

// =============================================================================
// POC: Serve uploaded files from local disk (current)
// =============================================================================
app.use('/uploads', express.static(path.resolve(config.uploadDir)));

// =============================================================================
// PRODUCTION: Remove the static file serving above.
// Files are served via the parent app's file API (see routes/files.js).
// =============================================================================

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

// =============================================================================
// PRODUCTION: Socket.io with Redis adapter for multi-pod support (EKS)
// =============================================================================
// When running multiple backend pods, Socket.io needs a shared adapter
// so events broadcast on one pod reach clients connected to other pods.
//
// Prerequisites:
//   npm install @socket.io/redis-adapter
//
// import { createAdapter } from '@socket.io/redis-adapter';
// import { createClient } from 'redis';
//
// async function setupSocketRedisAdapter(io) {
//   const pubClient = createClient({
//     url: `redis${config.redis.tls ? 's' : ''}://${config.redis.host}:${config.redis.port}`,
//   });
//   const subClient = pubClient.duplicate();
//
//   await Promise.all([pubClient.connect(), subClient.connect()]);
//   io.adapter(createAdapter(pubClient, subClient));
//   logger.info('Socket.io Redis adapter connected');
// }

// Start
async function start() {
  await connectDB();

  // PRODUCTION: Setup Redis adapter for Socket.io (uncomment)
  // const { getIO } = await import('./socket/index.js');
  // await setupSocketRedisAdapter(getIO());

  if (config.seedOnStart) {
    await seed();
  }

  // =============================================================================
  // PRODUCTION: Remove seed logic entirely — never seed production databases
  // =============================================================================

  server.listen(config.port, () => {
    logger.info(`Server running on http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

// =============================================================================
// PRODUCTION: Graceful shutdown (uncomment for EKS/container environments)
// =============================================================================
// EKS sends SIGTERM before killing a pod. Handle it to close connections cleanly.
//
// async function gracefulShutdown(signal) {
//   logger.info(`${signal} received. Starting graceful shutdown...`);
//
//   // Stop accepting new connections
//   server.close(() => {
//     logger.info('HTTP server closed');
//   });
//
//   // Close database connection
//   const mongoose = (await import('mongoose')).default;
//   await mongoose.connection.close();
//   logger.info('Database connection closed');
//
//   // Close Redis connections (if using Redis presence service)
//   // const { presenceService } = await import('./services/presenceService.js');
//   // await presenceService.shutdown();
//   // logger.info('Redis connections closed');
//
//   process.exit(0);
// }
//
// process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// process.on('SIGINT', () => gracefulShutdown('SIGINT'));

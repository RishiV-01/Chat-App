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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);

// Middleware
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.resolve(config.uploadDir)));

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
    await seed();
  }

  server.listen(config.port, () => {
    logger.info(`Server running on http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

import mongoose from 'mongoose';
import config from './index.js';
import logger from '../utils/logger.js';

export async function connectDB() {
  if (!config.mongoUri) {
    logger.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  try {
    await mongoose.connect(config.mongoUri);
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

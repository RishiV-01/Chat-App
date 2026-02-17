import dotenv from 'dotenv';
dotenv.config();

export default {
  port: parseInt(process.env.PORT, 10) || 3001,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/opportunitychat',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 52428800,
  seedOnStart: process.env.SEED_ON_START === 'true',
  jwtSecret: process.env.JWT_SECRET || 'poc-secret-key-not-for-production',
};

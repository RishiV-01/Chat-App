import dotenv from 'dotenv';
dotenv.config();

export default {
  port: parseInt(process.env.PORT, 10) || 3001,
  mongoUri: process.env.MONGODB_URI,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 104857600, // 100MB
  jwtSecret: process.env.JWT_SECRET || 'change-this-in-production',
  seedOnStart: process.env.SEED_ON_START === 'true',
  logLevel: process.env.LOG_LEVEL || 'info',

  // E3 Files API (required for file uploads)
  e3FilesApiBase: process.env.E3_FILES_API_BASE,

  // E3 Auth API (optional — enables parent app token exchange)
  authApiBase: process.env.AUTH_API_BASE,
  authApiAppName: process.env.AUTH_API_APP_NAME || 'e3_messaging',

  // Parent App (optional — enables iframe embedding with postMessage)
  parentAppOrigin: process.env.PARENT_APP_ORIGIN,
};

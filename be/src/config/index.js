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

  // ===================================================================
  // PRODUCTION CONFIG — Uncomment when integrating with parent app
  // See docs/Production-Migration-Guide.md for step-by-step instructions
  // ===================================================================

  // --- AWS Cognito (Parent App Token Verification) ---
  // The parent app authenticates users via Cognito and passes the JWT.
  // ChatApp only needs to VERIFY the Cognito token, not issue its own.
  // cognito: {
  //   userPoolId: process.env.COGNITO_USER_POOL_ID,         // e.g., 'us-east-1_xxxxxxxx'
  //   region: process.env.COGNITO_REGION || 'us-east-1',
  //   appClientId: process.env.COGNITO_APP_CLIENT_ID,       // Parent app's Cognito client ID
  //   issuer: `https://cognito-idp.${process.env.COGNITO_REGION || 'us-east-1'}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
  // },

  // --- AWS DocumentDB (replaces MongoDB Atlas) ---
  // DocumentDB is MongoDB-compatible but requires TLS and specific connection options.
  // documentDb: {
  //   uri: process.env.DOCUMENTDB_URI,                      // e.g., 'mongodb://username:password@docdb-cluster.region.docdb.amazonaws.com:27017/chat_app_db'
  //   tlsCAFile: process.env.DOCUMENTDB_TLS_CA_FILE || '/app/certs/global-bundle.pem',  // AWS RDS combined CA bundle
  //   dbName: process.env.DOCUMENTDB_DB_NAME || 'chat_app_db',
  // },

  // --- AWS ElastiCache Redis (replaces in-memory presence) ---
  // redis: {
  //   host: process.env.REDIS_HOST,                         // e.g., 'chatapp-redis.xxxxx.cache.amazonaws.com'
  //   port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  //   tls: process.env.REDIS_TLS === 'true',                // ElastiCache in-transit encryption
  //   keyPrefix: 'chatapp:',                                // Namespace keys to avoid collisions
  // },

  // --- Parent App File API (replaces local Multer uploads) ---
  // The parent app exposes a file API for upload/download.
  // ChatApp proxies file operations through it.
  // parentApp: {
  //   baseUrl: process.env.PARENT_APP_BASE_URL,             // e.g., 'https://parent-app.internal.company.com'
  //   fileApiPath: process.env.PARENT_APP_FILE_API_PATH || '/api/v1/files',
  //   apiKey: process.env.PARENT_APP_API_KEY,               // Service-to-service auth key
  // },

  // --- Production Security ---
  // security: {
  //   rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,  // 15 minutes
  //   rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  //   corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [],       // Multiple allowed origins
  // },
};

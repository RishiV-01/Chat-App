import mongoose from 'mongoose';
import config from './index.js';
import logger from '../utils/logger.js';

// =============================================================================
// POC: MongoDB Atlas connection (current)
// =============================================================================
export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

// =============================================================================
// PRODUCTION: AWS DocumentDB connection (uncomment & replace the above)
// =============================================================================
// DocumentDB is wire-protocol compatible with MongoDB 4.0/5.0 but has
// key differences:
//   - Requires TLS (use the global-bundle.pem from AWS)
//   - Does not support all MongoDB features (e.g., no $graphLookup,
//     change streams need explicit enabling, retryWrites not supported)
//   - The connection string uses the cluster endpoint
//
// Prerequisites:
//   1. Download the AWS RDS CA bundle:
//      wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
//   2. Place it at the path specified in config.documentDb.tlsCAFile
//      (mount it into the EKS pod via ConfigMap or Secrets)
//   3. Set DOCUMENTDB_URI in environment variables
//   4. Ensure the EKS pod has network access to the DocumentDB cluster
//      (same VPC + security group allows inbound on port 27017)
//
// import fs from 'fs';
//
// export async function connectDB() {
//   try {
//     const tlsCAFile = config.documentDb.tlsCAFile;
//
//     if (!fs.existsSync(tlsCAFile)) {
//       throw new Error(
//         `DocumentDB TLS CA file not found at: ${tlsCAFile}. ` +
//         'Download from https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem'
//       );
//     }
//
//     await mongoose.connect(config.documentDb.uri, {
//       tls: true,
//       tlsCAFile: tlsCAFile,
//       retryWrites: false,            // DocumentDB does not support retryWrites
//       directConnection: false,       // Use replica set routing
//       dbName: config.documentDb.dbName,
//     });
//
//     logger.info('DocumentDB connected successfully');
//   } catch (error) {
//     logger.error('DocumentDB connection failed:', error.message);
//     process.exit(1);
//   }
// }

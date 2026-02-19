import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';
import config from '../config/index.js';

// =============================================================================
// POC: Multer disk storage for local file uploads (current)
// =============================================================================
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const storage = multer.diskStorage({
  destination: config.uploadDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  },
});

// =============================================================================
// PRODUCTION: Multer memory storage (temp buffer before forwarding to parent API)
// =============================================================================
// When using the parent app's file API, we still use Multer but with memory
// storage (the file goes to a buffer, then we forward it to the parent API).
// This avoids writing temp files to the EKS pod's ephemeral storage.
//
// Alternatively, if the parent app provides pre-signed S3 upload URLs,
// the frontend can upload directly to S3 (see fileApi.js in frontend).
//
// const memoryStorage = multer.memoryStorage();
//
// export const upload = multer({
//   storage: memoryStorage,
//   limits: { fileSize: config.maxFileSize },
//   fileFilter: (_req, file, cb) => {
//     if (ALLOWED_TYPES.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error(`File type ${file.mimetype} not allowed`), false);
//     }
//   },
// });

import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import config from '../config/index.js';

const router = Router();

// =============================================================================
// POC: Local filesystem file handling (current)
// =============================================================================

// POST /api/files/upload - Upload a file
router.post('/upload', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const opportunityId = req.body.opportunityId;
    if (!opportunityId) {
      return res.status(400).json({ error: 'opportunityId is required' });
    }

    // Move file to opportunity-specific directory
    const oppDir = path.resolve(config.uploadDir, opportunityId);
    if (!fs.existsSync(oppDir)) {
      fs.mkdirSync(oppDir, { recursive: true });
    }

    const newPath = path.join(oppDir, req.file.filename);
    fs.renameSync(req.file.path, newPath);

    const fileData = {
      originalName: req.file.originalname,
      storagePath: `${opportunityId}/${req.file.filename}`,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${opportunityId}/${req.file.filename}`,
    };

    res.status(201).json({ file: fileData });
  } catch (error) {
    next(error);
  }
});

// GET /api/files/:oppId/:filename - Download file
router.get('/:oppId/:filename', authenticate, (req, res, next) => {
  try {
    const filePath = path.resolve(config.uploadDir, req.params.oppId, req.params.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath);
  } catch (error) {
    next(error);
  }
});

// GET /api/files/:oppId/:filename/preview - Preview file inline
router.get('/:oppId/:filename/preview', authenticate, (req, res, next) => {
  try {
    const filePath = path.resolve(config.uploadDir, req.params.oppId, req.params.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// PRODUCTION: Parent App File API Proxy (uncomment & replace the above routes)
// =============================================================================
// The parent app already has a file management system (S3-backed).
// ChatApp proxies file operations through the parent app's file API.
//
// Prerequisites:
//   1. npm install node-fetch   (or use native fetch in Node 18+)
//   2. Set PARENT_APP_BASE_URL in env vars
//   3. Set PARENT_APP_FILE_API_PATH in env vars (default: /api/v1/files)
//   4. Set PARENT_APP_API_KEY in env vars (service-to-service auth)
//   5. Remove the local `upload` middleware import (Multer no longer needed)
//   6. Remove the `express.static('/uploads', ...)` line in server.js
//
// import { Readable } from 'stream';
//
// // Helper: Forward request to parent app's file API
// async function parentFileRequest(method, path, options = {}) {
//   const url = `${config.parentApp.baseUrl}${config.parentApp.fileApiPath}${path}`;
//   const headers = {
//     'X-API-Key': config.parentApp.apiKey,
//     ...options.headers,
//   };
//
//   const response = await fetch(url, {
//     method,
//     headers,
//     body: options.body,
//   });
//
//   if (!response.ok) {
//     const error = await response.json().catch(() => ({ message: response.statusText }));
//     const err = new Error(error.message || 'Parent app file API error');
//     err.status = response.status;
//     throw err;
//   }
//
//   return response;
// }
//
// // POST /api/files/upload - Proxy upload to parent app
// router.post('/upload', authenticate, upload.single('file'), async (req, res, next) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file provided' });
//     }
//
//     const opportunityId = req.body.opportunityId;
//     if (!opportunityId) {
//       return res.status(400).json({ error: 'opportunityId is required' });
//     }
//
//     // Build multipart form data for parent app
//     const FormData = (await import('form-data')).default;
//     const form = new FormData();
//     form.append('file', fs.createReadStream(req.file.path), {
//       filename: req.file.originalname,
//       contentType: req.file.mimetype,
//     });
//     form.append('folder', `chatapp/${opportunityId}`);
//     form.append('metadata', JSON.stringify({
//       source: 'chatapp',
//       opportunityId,
//       uploadedBy: req.user._id.toString(),
//     }));
//
//     const response = await parentFileRequest('POST', '/upload', {
//       headers: form.getHeaders(),
//       body: form,
//     });
//
//     const result = await response.json();
//
//     // Clean up local temp file
//     fs.unlinkSync(req.file.path);
//
//     // Map parent app response to ChatApp file format
//     const fileData = {
//       originalName: req.file.originalname,
//       storagePath: result.fileId || result.key,   // Parent app's file identifier
//       mimeType: req.file.mimetype,
//       size: req.file.size,
//       url: result.url || result.downloadUrl,       // Pre-signed URL from parent app
//     };
//
//     res.status(201).json({ file: fileData });
//   } catch (error) {
//     // Clean up temp file on error
//     if (req.file?.path && fs.existsSync(req.file.path)) {
//       fs.unlinkSync(req.file.path);
//     }
//     next(error);
//   }
// });
//
// // GET /api/files/:oppId/:fileId - Proxy download from parent app
// router.get('/:oppId/:fileId', authenticate, async (req, res, next) => {
//   try {
//     const response = await parentFileRequest('GET', `/${req.params.fileId}/download`);
//
//     // Stream the file to the client
//     res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
//     res.setHeader('Content-Disposition', response.headers.get('content-disposition') || 'attachment');
//
//     const body = Readable.fromWeb(response.body);
//     body.pipe(res);
//   } catch (error) {
//     next(error);
//   }
// });
//
// // GET /api/files/:oppId/:fileId/preview - Proxy preview from parent app
// router.get('/:oppId/:fileId/preview', authenticate, async (req, res, next) => {
//   try {
//     const response = await parentFileRequest('GET', `/${req.params.fileId}/preview`);
//
//     res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
//     res.setHeader('Content-Disposition', 'inline');
//
//     const body = Readable.fromWeb(response.body);
//     body.pipe(res);
//   } catch (error) {
//     next(error);
//   }
// });

export default router;

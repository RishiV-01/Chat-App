import { Router } from 'express';
import path from 'path';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const router = Router();

// POST /api/files/upload — Upload file via E3 Files API
// Receives file in memory via Multer, converts to base64,
// and proxies to E3 Files API (import_file/).
router.post('/upload', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (!config.e3FilesApiBase) {
      return res.status(501).json({ error: 'E3 Files API is not configured (E3_FILES_API_BASE)' });
    }

    const opportunityId = req.body.opportunityId;
    if (!opportunityId) {
      return res.status(400).json({ error: 'opportunityId is required' });
    }

    const ext = path.extname(req.file.originalname).replace('.', '');
    const fileBase64 = req.file.buffer.toString('base64');

    // Proxy upload to E3 Files API
    const e3Response = await fetch(`${config.e3FilesApiBase}import_file/`, {
      method: 'POST',
      headers: {
        'Authorization': req.headers.authorization,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        opportunity_id: opportunityId,
        file: fileBase64,
        file_description: req.file.originalname,
        file_ext: ext,
      }),
      signal: AbortSignal.timeout(120000), // 2 min timeout for large files
    });

    if (!e3Response.ok) {
      const errorBody = await e3Response.text().catch(() => '');
      logger.error('E3 Files API error:', e3Response.status, errorBody);
      return res.status(e3Response.status).json({
        error: 'File upload to E3 API failed',
        details: errorBody,
      });
    }

    const e3Data = await e3Response.json();

    const fileData = {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: e3Data.url || e3Data.file_url || e3Data.download_url || null,
      e3Response: e3Data,
    };

    res.status(201).json({ file: fileData });
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'E3 Files API request timed out' });
    }
    if (error.cause?.code === 'ECONNREFUSED' || error.cause?.code === 'ENOTFOUND' || error.message === 'fetch failed') {
      logger.error('E3 Files API unreachable:', error.cause?.message || error.message);
      return res.status(502).json({ error: 'E3 Files API is unreachable', details: error.cause?.message || error.message });
    }
    next(error);
  }
});

export default router;

import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import config from '../config/index.js';

const router = Router();

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

export default router;

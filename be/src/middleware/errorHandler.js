import logger from '../utils/logger.js';

export function errorHandler(err, req, res, _next) {
  logger.error(`${req.method} ${req.path}:`, err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation Error', details: err.message });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large', maxSize: '50MB' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
}

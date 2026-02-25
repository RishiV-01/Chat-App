import { Router } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

// POST /api/auth/login — Internal JWT login (for standalone testing)
router.post('/login', async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: '24h' },
    );

    res.json({ token, user });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me — Get current user from token
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/token-exchange — Exchange parent app token for internal JWT
// Activated when AUTH_API_BASE environment variable is configured.
// Calls the E3 Auth API (authorize_user/) to validate the parent token,
// extracts user info from the response, and issues an internal JWT.
router.post('/token-exchange', async (req, res, next) => {
  if (!config.authApiBase) {
    return res.status(501).json({ error: 'Auth API integration is not configured (AUTH_API_BASE)' });
  }

  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'token is required' });
    }

    // Call E3 Auth API to validate the token and authorize messaging access
    const authResponse = await fetch(`${config.authApiBase}authorize_user/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'App': config.authApiAppName,
      },
      body: JSON.stringify({
        url: '/api/messaging',
        method: 'GET',
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!authResponse.ok) {
      logger.warn('Auth API validation failed:', authResponse.status);
      return res.status(401).json({ error: 'Token validation failed' });
    }

    const authData = await authResponse.json();

    // Find or create user from Auth API response
    const ssoId = authData.user_id || authData.id || authData.sub;
    const email = authData.email || '';
    const name = authData.name || authData.username || 'User';
    const role = authData.role || 'broker';

    let user = await User.findOne({ ssoId });
    if (!user) {
      user = await User.create({ ssoId, email, name, role });
    }

    // Issue internal JWT
    const internalToken = jwt.sign(
      { userId: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: '24h' },
    );

    res.json({ token: internalToken, user });
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Auth API request timed out' });
    }
    next(error);
  }
});

export default router;

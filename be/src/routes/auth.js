import { Router } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login - Mock login by user ID
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

// GET /api/auth/me - Get current user from token
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;

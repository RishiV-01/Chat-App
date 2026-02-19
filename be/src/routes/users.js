import { Router } from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// =============================================================================
// POC: Public user listing (current — used by the mock login page)
// =============================================================================
// GET /api/users - List all users (for POC login page)
router.get('/', async (_req, res, next) => {
  try {
    const users = await User.find().select('-__v').sort({ role: 1, name: 1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// PRODUCTION: Secure the user listing (uncomment & replace the above route)
// =============================================================================
// In production, the user list must be authenticated. The public route is
// only needed for the POC mock login page which will be removed.
//
// GET /api/users - List all users (authenticated)
// router.get('/', authenticate, async (req, res, next) => {
//   try {
//     const users = await User.find().select('-__v -cognitoSub').sort({ role: 1, name: 1 });
//     res.json({ users });
//   } catch (error) {
//     next(error);
//   }
// });

// GET /api/users/me - Current user
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// GET /api/users/:id - User by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;

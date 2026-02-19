import { Router } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// =============================================================================
// POC: Mock login by user ID (current — no real authentication)
// =============================================================================
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

// =============================================================================
// PRODUCTION: Cognito Token Exchange (uncomment & replace the mock /login above)
// =============================================================================
// The parent app authenticates the user via Cognito and then calls this endpoint
// to exchange/validate the Cognito token for a ChatApp session.
//
// Flow:
//   1. Parent app authenticates user -> gets Cognito tokens
//   2. Parent app opens ChatApp iframe/tab with the Cognito token
//   3. ChatApp frontend calls /api/auth/token-exchange with the token
//   4. ChatApp backend verifies token, finds/creates user, returns profile
//
// IMPORTANT: Remove the mock /login route and the GET /users public route
//            when switching to production auth.
//
// POST /api/auth/token-exchange
// router.post('/token-exchange', async (req, res, next) => {
//   try {
//     const { cognitoToken } = req.body;
//
//     if (!cognitoToken) {
//       return res.status(400).json({ error: 'cognitoToken is required' });
//     }
//
//     // Dynamically import jwks-rsa (avoid loading in POC mode)
//     const jwksRsa = (await import('jwks-rsa')).default;
//     const jwksClient = jwksRsa({
//       jwksUri: `https://cognito-idp.${config.cognito.region}.amazonaws.com/${config.cognito.userPoolId}/.well-known/jwks.json`,
//       cache: true,
//     });
//
//     const decoded = await new Promise((resolve, reject) => {
//       jwt.verify(
//         cognitoToken,
//         (header, cb) => {
//           jwksClient.getSigningKey(header.kid, (err, key) => {
//             if (err) return cb(err);
//             cb(null, key.getPublicKey());
//           });
//         },
//         {
//           issuer: config.cognito.issuer,
//           algorithms: ['RS256'],
//         },
//         (err, decoded) => (err ? reject(err) : resolve(decoded)),
//       );
//     });
//
//     // Find or auto-provision the user
//     let user = await User.findOne({ cognitoSub: decoded.sub });
//
//     if (!user) {
//       user = await User.create({
//         cognitoSub: decoded.sub,
//         ssoId: decoded.sub,
//         email: decoded.email || '',
//         name: decoded.name || decoded['cognito:username'] || decoded.email || 'New User',
//         role: decoded['custom:role'] || 'broker',
//       });
//     }
//
//     // Return the Cognito token as-is (all ChatApp endpoints verify via Cognito JWKS)
//     res.json({
//       token: cognitoToken,
//       user,
//     });
//   } catch (error) {
//     if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
//       return res.status(401).json({ error: 'Invalid or expired Cognito token' });
//     }
//     next(error);
//   }
// });

export default router;

import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';

// =============================================================================
// POC: JWT verification using local secret (current)
// =============================================================================
export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

// =============================================================================
// PRODUCTION: AWS Cognito Token Verification (uncomment & replace the above)
// =============================================================================
// The parent app authenticates the user via Cognito and provides a JWT.
// ChatApp verifies that token against the Cognito User Pool's JWKS (public keys).
//
// Prerequisites:
//   1. npm install jwks-rsa                    (for fetching Cognito JWKS)
//   2. Set COGNITO_USER_POOL_ID in env vars
//   3. Set COGNITO_REGION in env vars
//   4. Set COGNITO_APP_CLIENT_ID in env vars
//   5. Add `cognitoSub` field to User model (see User.js for production schema)
//
// import jwksRsa from 'jwks-rsa';
//
// // JWKS client caches public keys in memory (default TTL: 10 hours)
// const jwksClient = jwksRsa({
//   jwksUri: `https://cognito-idp.${config.cognito.region}.amazonaws.com/${config.cognito.userPoolId}/.well-known/jwks.json`,
//   cache: true,
//   rateLimit: true,
//   jwksRequestsPerMinute: 10,
// });
//
// function getSigningKey(header, callback) {
//   jwksClient.getSigningKey(header.kid, (err, key) => {
//     if (err) return callback(err);
//     callback(null, key.getPublicKey());
//   });
// }
//
// export async function authenticate(req, res, next) {
//   try {
//     const header = req.headers.authorization;
//     if (!header || !header.startsWith('Bearer ')) {
//       return res.status(401).json({ error: 'No token provided' });
//     }
//
//     const token = header.split(' ')[1];
//
//     // Verify the Cognito JWT using JWKS public keys
//     const decoded = await new Promise((resolve, reject) => {
//       jwt.verify(
//         token,
//         getSigningKey,
//         {
//           issuer: config.cognito.issuer,
//           audience: config.cognito.appClientId,
//           algorithms: ['RS256'],
//         },
//         (err, decoded) => (err ? reject(err) : resolve(decoded)),
//       );
//     });
//
//     // Look up user by Cognito 'sub' claim
//     let user = await User.findOne({ cognitoSub: decoded.sub });
//
//     if (!user) {
//       // Option A: Auto-provision user from Cognito claims
//       // user = await User.create({
//       //   cognitoSub: decoded.sub,
//       //   ssoId: decoded.sub,
//       //   email: decoded.email || '',
//       //   name: decoded.name || decoded['cognito:username'] || 'New User',
//       //   role: decoded['custom:role'] || 'broker',
//       // });
//
//       // Option B: Reject — user must be pre-provisioned
//       return res.status(401).json({ error: 'User not provisioned in ChatApp' });
//     }
//
//     req.user = user;
//     req.cognitoToken = decoded;  // Full decoded token for downstream use
//     next();
//   } catch (error) {
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ error: 'Token expired — re-authenticate via parent app' });
//     }
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({ error: 'Invalid Cognito token' });
//     }
//     next(error);
//   }
// }

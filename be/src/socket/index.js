import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import { presenceService } from '../services/presenceService.js';
import { handleConnection, handleDisconnect } from './handlers/connection.js';
import { handleSendMessage, handleMarkRead } from './handlers/messaging.js';
import { handleTypingStart, handleTypingStop } from './handlers/typing.js';
import { handleJoinOpportunity, handleLeaveOpportunity } from './handlers/presence.js';
import logger from '../utils/logger.js';

let io;

export function getIO() {
  return io;
}

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // ==========================================================================
    // PRODUCTION: Socket.io scaling options (uncomment for EKS multi-pod)
    // ==========================================================================
    // pingTimeout: 60000,      // How long to wait for pong before disconnect
    // pingInterval: 25000,     // How often to ping clients
    // maxHttpBufferSize: 1e6,  // 1MB max message size
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);

    // =========================================================================
    // POC: Socket authentication using local JWT secret (current)
    // =========================================================================
    socket.on('authenticate', async (data) => {
      try {
        const decoded = jwt.verify(data.token, config.jwtSecret);
        const user = await User.findById(decoded.userId);

        if (!user) {
          socket.emit('error', { code: 'AUTH_FAILED', message: 'User not found' });
          return;
        }

        socket.userId = user._id.toString();
        socket.user = user;

        handleConnection(io, socket, user);
        socket.emit('authenticated', { user });
      } catch (err) {
        socket.emit('error', { code: 'AUTH_FAILED', message: 'Invalid token' });
      }
    });

    // =========================================================================
    // PRODUCTION: Socket authentication using Cognito JWKS (uncomment & replace)
    // =========================================================================
    // Uses the same Cognito token the parent app provides.
    //
    // Prerequisites: same as middleware/auth.js (npm install jwks-rsa)
    //
    // import jwksRsa from 'jwks-rsa';
    //
    // const jwksClient = jwksRsa({
    //   jwksUri: `https://cognito-idp.${config.cognito.region}.amazonaws.com/${config.cognito.userPoolId}/.well-known/jwks.json`,
    //   cache: true,
    //   rateLimit: true,
    // });
    //
    // socket.on('authenticate', async (data) => {
    //   try {
    //     const decoded = await new Promise((resolve, reject) => {
    //       jwt.verify(
    //         data.token,
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
    //     const user = await User.findOne({ cognitoSub: decoded.sub });
    //     if (!user) {
    //       socket.emit('error', { code: 'AUTH_FAILED', message: 'User not provisioned' });
    //       return;
    //     }
    //
    //     socket.userId = user._id.toString();
    //     socket.user = user;
    //
    //     handleConnection(io, socket, user);
    //     socket.emit('authenticated', { user });
    //   } catch (err) {
    //     socket.emit('error', { code: 'AUTH_FAILED', message: 'Invalid Cognito token' });
    //   }
    // });

    // Messaging
    socket.on('send_message', (data) => {
      if (!socket.userId) return;
      handleSendMessage(io, socket, data);
    });

    socket.on('mark_read', (data) => {
      if (!socket.userId) return;
      handleMarkRead(io, socket, data);
    });

    // Typing
    socket.on('typing_start', (data) => {
      if (!socket.userId) return;
      handleTypingStart(io, socket, data);
    });

    socket.on('typing_stop', (data) => {
      if (!socket.userId) return;
      handleTypingStop(io, socket, data);
    });

    // Room management
    socket.on('join_opportunity', (data) => {
      if (!socket.userId) return;
      handleJoinOpportunity(io, socket, data);
    });

    socket.on('leave_opportunity', (data) => {
      if (!socket.userId) return;
      handleLeaveOpportunity(io, socket, data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (!socket.userId) return;
      handleDisconnect(io, socket);
    });
  });

  logger.info('Socket.io initialized');
  return io;
}

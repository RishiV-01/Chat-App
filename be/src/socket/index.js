import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
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
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6,
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);

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

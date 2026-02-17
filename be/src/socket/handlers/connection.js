import User from '../../models/User.js';
import Opportunity from '../../models/Opportunity.js';
import { presenceService } from '../../services/presenceService.js';
import logger from '../../utils/logger.js';

export async function handleConnection(io, socket, user) {
  const userId = user._id.toString();

  presenceService.addSocket(userId, socket.id);

  // Update user online status in DB
  await User.findByIdAndUpdate(userId, { isOnline: true });

  // Join personal room for direct notifications
  socket.join(`user:${userId}`);

  // Auto-join all opportunity rooms the user belongs to
  const opportunities = await Opportunity.find({ 'participants.userId': userId });
  for (const opp of opportunities) {
    const room = `opportunity:${opp._id}`;
    socket.join(room);

    // Notify others in the room
    socket.to(room).emit('presence_update', {
      userId,
      isOnline: true,
      name: user.name,
    });
  }

  logger.info(`User ${user.name} (${userId}) connected`);
}

export async function handleDisconnect(io, socket) {
  const { userId, isLastSocket } = presenceService.removeSocket(socket.id);
  if (!userId) return;

  if (isLastSocket) {
    const lastSeen = new Date();
    await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });

    // Notify all rooms the user was in
    const opportunities = await Opportunity.find({ 'participants.userId': userId });
    for (const opp of opportunities) {
      io.to(`opportunity:${opp._id}`).emit('presence_update', {
        userId,
        isOnline: false,
        lastSeen,
      });
    }

    logger.info(`User ${userId} went offline`);
  }
}

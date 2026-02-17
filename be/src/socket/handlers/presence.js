import Opportunity from '../../models/Opportunity.js';
import { presenceService } from '../../services/presenceService.js';
import logger from '../../utils/logger.js';

export async function handleJoinOpportunity(io, socket, data) {
  try {
    const { opportunityId } = data;
    const opportunity = await Opportunity.findById(opportunityId);

    if (!opportunity || !opportunity.isParticipant(socket.userId)) {
      socket.emit('error', { code: 'FORBIDDEN', message: 'Cannot join this opportunity' });
      return;
    }

    const room = `opportunity:${opportunityId}`;
    socket.join(room);

    // Notify others
    socket.to(room).emit('presence_update', {
      userId: socket.userId,
      isOnline: true,
      name: socket.user?.name,
    });

    // Send current online users in this opportunity to the joining user
    const participants = opportunity.participants.map((p) => p.userId.toString());
    const onlineParticipants = participants.filter((pid) => presenceService.isOnline(pid));
    const typingUsers = presenceService.getTypingUsers(opportunityId);

    socket.emit('room_state', {
      opportunityId,
      onlineUsers: onlineParticipants,
      typingUsers,
    });

    logger.debug(`User ${socket.userId} joined opportunity ${opportunityId}`);
  } catch (error) {
    logger.error('Join opportunity error:', error.message);
  }
}

export function handleLeaveOpportunity(io, socket, data) {
  const { opportunityId } = data;
  const room = `opportunity:${opportunityId}`;

  presenceService.clearTyping(opportunityId, socket.userId);
  socket.leave(room);

  socket.to(room).emit('presence_update', {
    userId: socket.userId,
    isOnline: presenceService.isOnline(socket.userId),
  });

  logger.debug(`User ${socket.userId} left opportunity ${opportunityId}`);
}

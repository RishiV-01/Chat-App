import { presenceService } from '../../services/presenceService.js';

export function handleTypingStart(io, socket, data) {
  const { opportunityId } = data;
  presenceService.setTyping(opportunityId, socket.userId);

  socket.to(`opportunity:${opportunityId}`).emit('user_typing', {
    opportunityId,
    userId: socket.userId,
    name: socket.user?.name,
  });
}

export function handleTypingStop(io, socket, data) {
  const { opportunityId } = data;
  presenceService.clearTyping(opportunityId, socket.userId);

  socket.to(`opportunity:${opportunityId}`).emit('user_stopped_typing', {
    opportunityId,
    userId: socket.userId,
  });
}

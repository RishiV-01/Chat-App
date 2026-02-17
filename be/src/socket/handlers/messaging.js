import Message from '../../models/Message.js';
import Opportunity from '../../models/Opportunity.js';
import { presenceService } from '../../services/presenceService.js';
import logger from '../../utils/logger.js';

export async function handleSendMessage(io, socket, data) {
  try {
    const { opportunityId, content, type = 'text', file } = data;

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      socket.emit('error', { code: 'NOT_FOUND', message: 'Opportunity not found' });
      return;
    }
    if (!opportunity.isParticipant(socket.userId)) {
      socket.emit('error', { code: 'FORBIDDEN', message: 'Not a participant' });
      return;
    }
    if (opportunity.isReadOnly()) {
      socket.emit('error', { code: 'READ_ONLY', message: 'Opportunity is read-only' });
      return;
    }

    const message = await Message.create({
      opportunityId,
      senderId: socket.userId,
      type,
      content,
      file: file || undefined,
    });

    const populated = await Message.findById(message._id)
      .populate('senderId', 'name email role')
      .lean();

    // Broadcast to the opportunity room (including sender for confirmation)
    io.to(`opportunity:${opportunityId}`).emit('new_message', populated);

    // Mark as delivered for online participants
    const participants = opportunity.participants.map((p) => p.userId.toString());
    const deliveredTo = [];

    for (const pid of participants) {
      if (pid === socket.userId) continue;
      if (presenceService.isOnline(pid)) {
        deliveredTo.push({ userId: pid, timestamp: new Date() });
      }
    }

    if (deliveredTo.length > 0) {
      await Message.findByIdAndUpdate(message._id, {
        $push: { 'status.delivered': { $each: deliveredTo } },
      });

      io.to(`opportunity:${opportunityId}`).emit('message_delivered', {
        messageId: message._id,
        deliveredTo,
      });
    }

    // Send notification to participants not in this room
    for (const pid of participants) {
      if (pid === socket.userId) continue;
      io.to(`user:${pid}`).emit('unread_update', {
        opportunityId,
        messageId: message._id,
      });
    }

    logger.debug(`Message sent in ${opportunityId} by ${socket.userId}`);
  } catch (error) {
    logger.error('Send message error:', error.message);
    socket.emit('error', { code: 'SEND_FAILED', message: error.message });
  }
}

export async function handleMarkRead(io, socket, data) {
  try {
    const { opportunityId, messageId } = data;
    const userId = socket.userId;

    // Mark all unread messages up to messageId as read
    const cutoffMsg = await Message.findById(messageId);
    if (!cutoffMsg) return;

    const result = await Message.updateMany(
      {
        opportunityId,
        createdAt: { $lte: cutoffMsg.createdAt },
        senderId: { $ne: userId },
        'status.read.userId': { $ne: userId },
      },
      {
        $push: {
          'status.read': { userId, timestamp: new Date() },
        },
      },
    );

    if (result.modifiedCount > 0) {
      io.to(`opportunity:${opportunityId}`).emit('message_read', {
        opportunityId,
        userId,
        upToMessageId: messageId,
        timestamp: new Date(),
      });
    }
  } catch (error) {
    logger.error('Mark read error:', error.message);
  }
}

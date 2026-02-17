// In-memory presence tracking for POC (replaces Redis)
class PresenceService {
  constructor() {
    // userId -> Set<socketId>
    this.onlineUsers = new Map();
    // socketId -> userId
    this.userSockets = new Map();
    // opportunityId -> Map<userId, timeoutId>
    this.typingUsers = new Map();
  }

  addSocket(userId, socketId) {
    if (!this.onlineUsers.has(userId)) {
      this.onlineUsers.set(userId, new Set());
    }
    this.onlineUsers.get(userId).add(socketId);
    this.userSockets.set(socketId, userId);
  }

  removeSocket(socketId) {
    const userId = this.userSockets.get(socketId);
    if (!userId) return { userId: null, isLastSocket: false };

    this.userSockets.delete(socketId);
    const sockets = this.onlineUsers.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.onlineUsers.delete(userId);
        return { userId, isLastSocket: true };
      }
    }
    return { userId, isLastSocket: false };
  }

  isOnline(userId) {
    return this.onlineUsers.has(userId) && this.onlineUsers.get(userId).size > 0;
  }

  getOnlineUserIds() {
    return Array.from(this.onlineUsers.keys());
  }

  getSocketsForUser(userId) {
    return this.onlineUsers.get(userId) || new Set();
  }

  setTyping(opportunityId, userId) {
    if (!this.typingUsers.has(opportunityId)) {
      this.typingUsers.set(opportunityId, new Map());
    }
    const oppTyping = this.typingUsers.get(opportunityId);

    // Clear existing timeout
    if (oppTyping.has(userId)) {
      clearTimeout(oppTyping.get(userId));
    }

    // Auto-clear after 5 seconds
    const timeout = setTimeout(() => {
      oppTyping.delete(userId);
      if (oppTyping.size === 0) this.typingUsers.delete(opportunityId);
    }, 5000);

    oppTyping.set(userId, timeout);
  }

  clearTyping(opportunityId, userId) {
    const oppTyping = this.typingUsers.get(opportunityId);
    if (!oppTyping) return;

    if (oppTyping.has(userId)) {
      clearTimeout(oppTyping.get(userId));
      oppTyping.delete(userId);
    }
    if (oppTyping.size === 0) this.typingUsers.delete(opportunityId);
  }

  getTypingUsers(opportunityId) {
    const oppTyping = this.typingUsers.get(opportunityId);
    if (!oppTyping) return [];
    return Array.from(oppTyping.keys());
  }
}

export const presenceService = new PresenceService();

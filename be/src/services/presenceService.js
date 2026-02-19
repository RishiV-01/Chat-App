// =============================================================================
// POC: In-memory presence tracking (current — single-server only)
// =============================================================================
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

// =============================================================================
// PRODUCTION: Redis-backed Presence Service (uncomment & replace the above)
// =============================================================================
// Uses AWS ElastiCache (Redis) for distributed presence tracking.
// This allows multiple backend pods (EKS) to share presence state.
//
// Prerequisites:
//   1. npm install ioredis
//   2. Set REDIS_HOST and REDIS_PORT in environment variables
//   3. Set REDIS_TLS=true if using ElastiCache in-transit encryption
//   4. Ensure EKS pods have network access to the ElastiCache cluster
//      (same VPC + security group allows inbound on port 6379)
//
// import Redis from 'ioredis';
// import config from '../config/index.js';
// import logger from '../utils/logger.js';
//
// class RedisPresenceService {
//   constructor() {
//     const redisOptions = {
//       host: config.redis.host,
//       port: config.redis.port,
//       keyPrefix: config.redis.keyPrefix,
//       retryStrategy: (times) => Math.min(times * 200, 5000),
//       maxRetriesPerRequest: 3,
//     };
//
//     if (config.redis.tls) {
//       redisOptions.tls = {};  // ElastiCache TLS
//     }
//
//     this.redis = new Redis(redisOptions);
//
//     this.redis.on('connect', () => logger.info('Redis connected for presence'));
//     this.redis.on('error', (err) => logger.error('Redis presence error:', err.message));
//
//     // Local typing timeouts (typing indicators are short-lived, local is fine)
//     this.typingTimeouts = new Map();
//   }
//
//   // --- Online/Offline Tracking (Redis-backed) ---
//
//   async addSocket(userId, socketId) {
//     // Add socketId to user's socket set, set 60s TTL (heartbeat refreshes)
//     await this.redis.sadd(`presence:user:${userId}:sockets`, socketId);
//     await this.redis.expire(`presence:user:${userId}:sockets`, 60);
//     // Map socket -> user for fast lookup on disconnect
//     await this.redis.set(`presence:socket:${socketId}`, userId, 'EX', 60);
//     // Add to global online set
//     await this.redis.sadd('presence:online', userId);
//   }
//
//   async removeSocket(socketId) {
//     const userId = await this.redis.get(`presence:socket:${socketId}`);
//     if (!userId) return { userId: null, isLastSocket: false };
//
//     await this.redis.del(`presence:socket:${socketId}`);
//     await this.redis.srem(`presence:user:${userId}:sockets`, socketId);
//
//     const remainingSockets = await this.redis.scard(`presence:user:${userId}:sockets`);
//     if (remainingSockets === 0) {
//       await this.redis.srem('presence:online', userId);
//       await this.redis.del(`presence:user:${userId}:sockets`);
//       return { userId, isLastSocket: true };
//     }
//
//     return { userId, isLastSocket: false };
//   }
//
//   async isOnline(userId) {
//     return (await this.redis.sismember('presence:online', userId)) === 1;
//   }
//
//   async getOnlineUserIds() {
//     return await this.redis.smembers('presence:online');
//   }
//
//   // --- Typing Indicators (local — short-lived, doesn't need Redis) ---
//
//   setTyping(opportunityId, userId) {
//     const key = `${opportunityId}:${userId}`;
//     if (this.typingTimeouts.has(key)) {
//       clearTimeout(this.typingTimeouts.get(key));
//     }
//     const timeout = setTimeout(() => {
//       this.typingTimeouts.delete(key);
//     }, 5000);
//     this.typingTimeouts.set(key, timeout);
//   }
//
//   clearTyping(opportunityId, userId) {
//     const key = `${opportunityId}:${userId}`;
//     if (this.typingTimeouts.has(key)) {
//       clearTimeout(this.typingTimeouts.get(key));
//       this.typingTimeouts.delete(key);
//     }
//   }
//
//   getTypingUsers(opportunityId) {
//     const result = [];
//     for (const key of this.typingTimeouts.keys()) {
//       if (key.startsWith(`${opportunityId}:`)) {
//         result.push(key.split(':')[1]);
//       }
//     }
//     return result;
//   }
//
//   // --- Heartbeat (call periodically to prevent stale presence) ---
//   async refreshPresence(userId, socketId) {
//     await this.redis.expire(`presence:user:${userId}:sockets`, 60);
//     await this.redis.expire(`presence:socket:${socketId}`, 60);
//   }
//
//   // --- Cleanup (call on graceful shutdown) ---
//   async shutdown() {
//     await this.redis.quit();
//   }
// }
//
// export const presenceService = new RedisPresenceService();

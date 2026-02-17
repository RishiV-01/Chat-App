import { create } from 'zustand';

const usePresenceStore = create((set, get) => ({
  onlineUsers: new Set(),
  typingUsers: {},    // { [oppId]: Set<userId> }
  lastSeen: {},       // { [userId]: Date }

  setOnline: (userId) => {
    const state = get();
    const updated = new Set(state.onlineUsers);
    updated.add(userId);
    set({ onlineUsers: updated });
  },

  setOffline: (userId, lastSeenDate) => {
    const state = get();
    const updated = new Set(state.onlineUsers);
    updated.delete(userId);
    set({
      onlineUsers: updated,
      lastSeen: { ...state.lastSeen, [userId]: lastSeenDate },
    });
  },

  setOnlineUsers: (userIds) => {
    set({ onlineUsers: new Set(userIds) });
  },

  setTyping: (opportunityId, userId) => {
    const state = get();
    const oppTyping = new Set(state.typingUsers[opportunityId] || []);
    oppTyping.add(userId);
    set({ typingUsers: { ...state.typingUsers, [opportunityId]: oppTyping } });
  },

  clearTyping: (opportunityId, userId) => {
    const state = get();
    const oppTyping = new Set(state.typingUsers[opportunityId] || []);
    oppTyping.delete(userId);
    set({ typingUsers: { ...state.typingUsers, [opportunityId]: oppTyping } });
  },

  isUserOnline: (userId) => {
    return get().onlineUsers.has(userId);
  },

  getTypingUsersForOpportunity: (opportunityId) => {
    const state = get();
    return Array.from(state.typingUsers[opportunityId] || []);
  },
}));

export default usePresenceStore;

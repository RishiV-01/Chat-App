import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/constants';
import useChatStore from '../store/chatStore';
import usePresenceStore from '../store/presenceStore';

let socket = null;

export function connectSocket(token) {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    socket.emit('authenticate', { token });
  });

  socket.on('authenticated', (data) => {
    console.log('Socket authenticated:', data.user.name);
  });

  socket.on('new_message', (message) => {
    useChatStore.getState().addMessage(message);
  });

  socket.on('message_delivered', (data) => {
    useChatStore.getState().updateMessageStatus(data);
  });

  socket.on('message_read', (data) => {
    useChatStore.getState().updateMessageStatus(data);
  });

  socket.on('user_typing', ({ opportunityId, userId }) => {
    usePresenceStore.getState().setTyping(opportunityId, userId);
  });

  socket.on('user_stopped_typing', ({ opportunityId, userId }) => {
    usePresenceStore.getState().clearTyping(opportunityId, userId);
  });

  socket.on('presence_update', ({ userId, isOnline, lastSeen }) => {
    if (isOnline) {
      usePresenceStore.getState().setOnline(userId);
    } else {
      usePresenceStore.getState().setOffline(userId, lastSeen);
    }
  });

  socket.on('room_state', ({ onlineUsers }) => {
    usePresenceStore.getState().setOnlineUsers(onlineUsers);
  });

  socket.on('unread_update', ({ opportunityId }) => {
    // Trigger a refetch of opportunity list for unread counts
    const state = useChatStore.getState();
    if (opportunityId !== state.activeOpportunityId) {
      state.fetchOpportunities();
    }
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}

export function emitEvent(event, data) {
  if (socket?.connected) {
    socket.emit(event, data);
  }
}

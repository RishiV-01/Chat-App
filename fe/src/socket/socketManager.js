import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/constants';
import useChatStore from '../store/chatStore';
import usePresenceStore from '../store/presenceStore';

let socket = null;
let isConnecting = false;

export function connectSocket(token) {
  // If already connected, return existing socket
  if (socket?.connected) return socket;
  
  // If connection is in progress, return existing socket
  if (isConnecting && socket) return socket;
  
  // If there's a disconnected socket, clean it up first
  if (socket && !socket.connected) {
    socket.removeAllListeners();
    socket.close();
    socket = null;
  }

  isConnecting = true;

  socket = io(SOCKET_URL, {
    auth: {
      token: token
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
    timeout: 10000,
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    isConnecting = false;
    socket.emit('authenticate', { token });
  });

  socket.on('authenticated', (data) => {
    console.log('Socket authenticated:', data.user.name);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
    isConnecting = false;
  });

  socket.on('new_message', (message) => {
    useChatStore.getState().addMessage(message);
  });

  socket.on('message_delivered', (data) => {
    useChatStore.getState().updateDeliveryStatus(data);
  });

  socket.on('message_read', (data) => {
    useChatStore.getState().updateReadStatus(data);
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

  socket.on('room_state', ({ onlineUsers, typingUsers }) => {
    usePresenceStore.getState().setOnlineUsers(onlineUsers);
    if (typingUsers?.length > 0) {
      const presenceState = usePresenceStore.getState();
      typingUsers.forEach((uid) => {
        presenceState.setTyping(useChatStore.getState().activeOpportunityId, uid);
      });
    }
  });

  socket.on('unread_update', ({ opportunityId }) => {
    const state = useChatStore.getState();
    if (opportunityId !== state.activeOpportunityId) {
      state.fetchOpportunities();
    }
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    isConnecting = false;
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    isConnecting = false;
    socket.removeAllListeners();
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

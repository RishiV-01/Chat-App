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
    // ==========================================================================
    // PRODUCTION: Additional socket options for production stability (uncomment)
    // ==========================================================================
    // transports: ['websocket'],       // Skip long-polling, use WebSocket directly
    // upgrade: false,                  // Don't upgrade from polling to WS
    // timeout: 20000,                  // Connection timeout
    // forceNew: true,                  // Don't reuse stale connections
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    // The token here is the Cognito JWT in production (same flow, just a different token)
    socket.emit('authenticate', { token });
  });

  socket.on('authenticated', (data) => {
    console.log('Socket authenticated:', data.user.name);
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
    // Trigger a refetch of opportunity list for unread counts
    const state = useChatStore.getState();
    if (opportunityId !== state.activeOpportunityId) {
      state.fetchOpportunities();
    }
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);

    // ==========================================================================
    // PRODUCTION: Handle auth failures — redirect to parent app (uncomment)
    // ==========================================================================
    // if (err.code === 'AUTH_FAILED') {
    //   localStorage.removeItem('token');
    //   import('../config/constants').then(({ PARENT_APP_URL }) => {
    //     window.location.href = PARENT_APP_URL;
    //   });
    // }
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

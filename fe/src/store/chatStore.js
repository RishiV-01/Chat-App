import { create } from 'zustand';
import { getOpportunities } from '../api/opportunityApi';
import { getMessages } from '../api/messageApi';

const useChatStore = create((set, get) => ({
  opportunities: [],
  activeOpportunityId: null,
  messages: {},       // { [oppId]: Message[] }
  hasMore: {},        // { [oppId]: boolean }
  loading: false,
  messagesLoading: false,

  fetchOpportunities: async () => {
    set({ loading: true });
    try {
      const { data } = await getOpportunities();
      set({ opportunities: data.opportunities, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error('Failed to fetch opportunities:', error);
    }
  },

  setActiveOpportunity: (id) => {
    set({ activeOpportunityId: id });
    // Fetch messages if not cached
    const state = get();
    if (!state.messages[id]) {
      state.fetchMessagesForOpportunity(id);
    }
  },

  fetchMessagesForOpportunity: async (oppId, before) => {
    set({ messagesLoading: true });
    try {
      const params = { limit: 50 };
      if (before) params.before = before;

      const { data } = await getMessages(oppId, params);
      const state = get();
      const existing = before ? (state.messages[oppId] || []) : [];

      set({
        messages: {
          ...state.messages,
          [oppId]: before
            ? [...data.messages, ...existing]
            : data.messages,
        },
        hasMore: { ...state.hasMore, [oppId]: data.hasMore },
        messagesLoading: false,
      });
    } catch (error) {
      set({ messagesLoading: false });
      console.error('Failed to fetch messages:', error);
    }
  },

  addMessage: (message) => {
    const state = get();
    const oppId = message.opportunityId;
    const existing = state.messages[oppId] || [];

    // Avoid duplicates
    if (existing.some((m) => m._id === message._id)) return;

    set({
      messages: {
        ...state.messages,
        [oppId]: [...existing, message],
      },
    });

    // Update opportunity list order and unread count
    const opps = [...state.opportunities];
    const idx = opps.findIndex((o) => o._id === oppId);
    if (idx > -1) {
      opps[idx] = {
        ...opps[idx],
        lastMessage: message,
        unreadCount: oppId !== state.activeOpportunityId
          ? (opps[idx].unreadCount || 0) + 1
          : opps[idx].unreadCount,
      };
      // Move to top
      const [opp] = opps.splice(idx, 1);
      opps.unshift(opp);
      set({ opportunities: opps });
    }
  },

  // Handle message_delivered: { messageId, deliveredTo: [{ userId, timestamp }] }
  updateDeliveryStatus: (data) => {
    const state = get();
    const { messageId, deliveredTo } = data;
    const messages = { ...state.messages };
    let updated = false;

    for (const oppId in messages) {
      const idx = messages[oppId].findIndex((m) => m._id === messageId);
      if (idx !== -1) {
        const msg = { ...messages[oppId][idx] };
        const existing = msg.status?.delivered || [];
        msg.status = {
          ...msg.status,
          delivered: [...existing, ...deliveredTo],
        };
        messages[oppId] = [...messages[oppId]];
        messages[oppId][idx] = msg;
        updated = true;
        break;
      }
    }

    if (updated) set({ messages });
  },

  // Handle message_read: { opportunityId, userId, upToMessageId, timestamp }
  updateReadStatus: (data) => {
    const state = get();
    const { opportunityId, userId, upToMessageId, timestamp } = data;
    const oppMessages = state.messages[opportunityId];
    if (!oppMessages) return;

    // Find the cutoff message index
    const cutoffIdx = oppMessages.findIndex((m) => m._id === upToMessageId);
    if (cutoffIdx === -1) return;

    const cutoffTime = new Date(oppMessages[cutoffIdx].createdAt);
    const updatedMessages = oppMessages.map((msg) => {
      // Only mark messages sent by others (not by the reader) up to the cutoff
      const msgTime = new Date(msg.createdAt);
      const senderId = msg.senderId?._id || msg.senderId;
      if (senderId === userId) return msg;  // Reader's own messages — skip
      if (msgTime > cutoffTime) return msg; // After cutoff — skip

      // Check if already marked as read by this user
      const alreadyRead = (msg.status?.read || []).some(
        (r) => (r.userId?._id || r.userId) === userId,
      );
      if (alreadyRead) return msg;

      return {
        ...msg,
        status: {
          ...msg.status,
          read: [...(msg.status?.read || []), { userId, timestamp }],
        },
      };
    });

    set({
      messages: { ...state.messages, [opportunityId]: updatedMessages },
    });
  },

  decrementUnread: (oppId) => {
    const state = get();
    const opps = state.opportunities.map((o) =>
      o._id === oppId ? { ...o, unreadCount: 0 } : o,
    );
    set({ opportunities: opps });
  },

  getActiveOpportunity: () => {
    const state = get();
    return state.opportunities.find((o) => o._id === state.activeOpportunityId);
  },
}));

export default useChatStore;

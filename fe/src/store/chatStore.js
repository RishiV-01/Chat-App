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

  updateMessageStatus: (data) => {
    const state = get();
    // data could be message_delivered or message_read
    // For simplicity, just refetch if needed
    set({ messages: { ...state.messages } });
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

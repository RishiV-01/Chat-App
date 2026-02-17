import { create } from 'zustand';
import { loginUser, getCurrentUser } from '../api/authApi';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,

  login: async (userId) => {
    set({ loading: true });
    try {
      const { data } = await loginUser(userId);
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  loadSession: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }
    try {
      const { data } = await getCurrentUser();
      set({ user: data.user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;

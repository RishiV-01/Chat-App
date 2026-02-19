import { create } from 'zustand';
import { loginUser, getCurrentUser } from '../api/authApi';

// =============================================================================
// POC: Auth store with mock login (current)
// =============================================================================
const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,

  // POC: Mock login by user ID selection
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

  // ==========================================================================
  // PRODUCTION: Cognito token exchange (uncomment & replace the login above)
  // ==========================================================================
  // The parent app passes a Cognito token to ChatApp. This method exchanges
  // it with the ChatApp backend to get the user profile.
  //
  // loginWithCognitoToken: async (cognitoToken) => {
  //   set({ loading: true });
  //   try {
  //     const { data } = await tokenExchange(cognitoToken);  // See authApi.js
  //     localStorage.setItem('token', data.token);
  //     set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
  //     return data;
  //   } catch (error) {
  //     set({ loading: false });
  //     throw error;
  //   }
  // },

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

    // ==========================================================================
    // PRODUCTION: Redirect to parent app on logout (uncomment)
    // ==========================================================================
    // When the user logs out of ChatApp, redirect them back to the parent app
    // which manages the Cognito session. Don't just clear local state.
    //
    // import { PARENT_APP_URL } from '../config/constants';
    // window.location.href = PARENT_APP_URL;
  },
}));

export default useAuthStore;

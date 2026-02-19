import axios from 'axios';
import { API_URL } from '../config/constants';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// =============================================================================
// POC: Token injection from localStorage (current)
// =============================================================================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =============================================================================
// PRODUCTION: Token injection works the same way.
// The Cognito token is stored in localStorage after token-exchange.
// The interceptor above is compatible with both POC and production tokens.
// No change needed here — the Cognito JWT is used as a Bearer token.
// =============================================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');

      // POC: Redirect to mock login page
      window.location.href = '/login';

      // ======================================================================
      // PRODUCTION: Redirect to parent app on 401 (uncomment & replace above)
      // ======================================================================
      // When the Cognito token expires, redirect the user back to the parent
      // app so they can re-authenticate via Cognito.
      //
      // import { PARENT_APP_URL } from '../config/constants';
      // window.location.href = `${PARENT_APP_URL}?returnTo=${encodeURIComponent(window.location.href)}`;
    }
    return Promise.reject(error);
  },
);

export default api;

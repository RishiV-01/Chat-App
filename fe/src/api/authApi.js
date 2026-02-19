import api from './axiosInstance';

// =============================================================================
// POC: Mock login API calls (current)
// =============================================================================
export const loginUser = (userId) => api.post('/auth/login', { userId });

export const getCurrentUser = () => api.get('/auth/me');

// POC only — public user listing for mock login page
export const getAllUsers = () => api.get('/users');

// =============================================================================
// PRODUCTION: Cognito token exchange API call (uncomment & use instead of loginUser)
// =============================================================================
// Sends the Cognito token from the parent app to ChatApp's backend
// for verification and user profile retrieval.
//
// export const tokenExchange = (cognitoToken) =>
//   api.post('/auth/token-exchange', { cognitoToken });
//
// getAllUsers should be removed or made authenticated in production:
// export const getAllUsers = () => api.get('/users');  // Now requires auth

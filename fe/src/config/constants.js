export const API_URL = import.meta.env.VITE_API_URL || '';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const TYPING_TIMEOUT = 3000; // 3 seconds
export const MESSAGES_PER_PAGE = 50;

// =============================================================================
// PRODUCTION: Parent App Integration Constants (uncomment when integrating)
// =============================================================================
// URL of the parent application (for redirecting back on auth failure, etc.)
// export const PARENT_APP_URL = import.meta.env.VITE_PARENT_APP_URL || '';
//
// Key used to receive the Cognito token from the parent app via postMessage
// export const PARENT_APP_TOKEN_KEY = 'cognito_token';
//
// Expected origin for postMessage security validation
// export const PARENT_APP_ORIGIN = import.meta.env.VITE_PARENT_APP_ORIGIN || '';

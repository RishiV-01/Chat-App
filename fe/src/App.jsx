import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import LoginPage from './components/auth/LoginPage';
import AppLayout from './components/layout/AppLayout';
import ChatPage from './components/chat/ChatPage';
import { connectSocket, disconnectSocket } from './socket/socketManager';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { isAuthenticated, token, loadSession } = useAuthStore();

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      connectSocket(token);
    } else {
      disconnectSocket();
    }
    return () => disconnectSocket();
  }, [isAuthenticated, token]);

  // ==========================================================================
  // PRODUCTION: The routing structure remains the same.
  // The /login route handles the Cognito token handoff (not a real login form).
  // The ProtectedRoute redirects unauthenticated users to /login, which
  // will then redirect them to the parent app if no token is provided.
  //
  // If ChatApp is embedded in an iframe within the parent app, you may want
  // to remove the /login route entirely and always expect the token via
  // postMessage (see LoginPage.jsx for Pattern B).
  // ==========================================================================

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ChatPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/chat' : '/login'} replace />} />
    </Routes>
  );
}

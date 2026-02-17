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
    }
    return () => {
      if (!isAuthenticated) disconnectSocket();
    };
  }, [isAuthenticated, token]);

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

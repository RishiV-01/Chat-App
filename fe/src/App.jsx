import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import LoginPage from './components/auth/LoginPage';
import AppLayout from './components/layout/AppLayout';
import EmbedWrapper from './components/embed/EmbedWrapper';
import EmbedChatPage from './components/embed/EmbedChatPage';
import EmbedSingleChat from './components/embed/EmbedSingleChat';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { isAuthenticated, loadSession } = useAuthStore();

  useEffect(() => {
    loadSession();
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Parent app shell - sidebar + content area (no socket needed here) */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />

      {/* Embed routes - loaded in iframes, each manages its own socket */}
      <Route
        path="/embed/chat"
        element={
          <EmbedWrapper>
            <EmbedChatPage />
          </EmbedWrapper>
        }
      />
      <Route
        path="/embed/chat/:opportunityId"
        element={
          <EmbedWrapper>
            <EmbedSingleChat />
          </EmbedWrapper>
        }
      />

      {/* Default redirects */}
      <Route path="/chat" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/app' : '/login'} replace />} />
    </Routes>
  );
}

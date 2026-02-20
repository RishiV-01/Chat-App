import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { connectSocket, disconnectSocket } from '../../socket/socketManager';

export default function EmbedWrapper({ children }) {
  const { isAuthenticated, token, loadSession } = useAuthStore();

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      connectSocket(token);
    }
    return () => disconnectSocket();
  }, [isAuthenticated, token]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { connectSocket, disconnectSocket } from '../../socket/socketManager';

export default function EmbedWrapper({ children }) {
  const { isAuthenticated, token, loadSession } = useAuthStore();
  const socketInitialized = useRef(false);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated && token && !socketInitialized.current) {
      socketInitialized.current = true;
      connectSocket(token);
    }
    
    // Only disconnect when component unmounts
    return () => {
      if (socketInitialized.current) {
        disconnectSocket();
        socketInitialized.current = false;
      }
    };
  }, [isAuthenticated, token]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

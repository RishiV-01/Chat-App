import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { getAllUsers } from '../../api/authApi';

// =============================================================================
// POC: Mock login page — user selection grid (current)
// =============================================================================
// This entire component is replaced in production by the Cognito token handoff.
// See the PRODUCTION section below for the replacement.

export default function LoginPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
      return;
    }
    getAllUsers()
      .then(({ data }) => setUsers(data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleSelectUser = async (userId) => {
    try {
      await login(userId);
      navigate('/chat');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const roleColor = {
    broker: 'bg-blue-100 text-blue-700',
    underwriter: 'bg-green-100 text-green-700',
  };

  return (
    <div className="flex h-screen items-center justify-center bg-navy-900">
      <div className="w-full max-w-2xl px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-700">
            <MessageSquare size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">OpportunityChat</h1>
          <p className="mt-2 text-navy-300">Insurance Communication Platform</p>
        </div>

        {/* User selection */}
        <div className="rounded-xl bg-white p-6 shadow-2xl">
          <h2 className="mb-4 text-center text-lg font-semibold text-gray-800">
            Select a User to Continue
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy-200 border-t-navy-800" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {users.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelectUser(user._id)}
                  className="flex items-center gap-3 rounded-lg border-2 border-gray-200 p-4 text-left transition-all hover:border-navy-400 hover:bg-navy-50"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-navy-800 text-sm font-bold text-white">
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${roleColor[user.role]}`}>
                      {user.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <p className="mt-4 text-center text-xs text-gray-400">
            POC Mode — Select a user to simulate SSO login
          </p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// PRODUCTION: Cognito Token Handoff Page (uncomment & replace the above export)
// =============================================================================
// In production, this page is NOT a login form. It's a "receiving" page that:
//   1. Receives the Cognito token from the parent app (via URL param or postMessage)
//   2. Exchanges it with ChatApp backend
//   3. Redirects to /chat on success
//
// There are two common patterns for receiving the token:
//
// --- Pattern A: Token via URL query parameter ---
// Parent app opens ChatApp as: https://chatapp.company.com/login?token=<cognito_jwt>
//
// import { useEffect, useState } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { MessageSquare } from 'lucide-react';
// import useAuthStore from '../../store/authStore';
// // import { PARENT_APP_URL } from '../../config/constants';
//
// export default function LoginPage() {
//   const [error, setError] = useState(null);
//   const { loginWithCognitoToken, isAuthenticated } = useAuthStore();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//
//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate('/chat');
//       return;
//     }
//
//     const token = searchParams.get('token');
//     if (!token) {
//       setError('No authentication token provided. Please access ChatApp from the main application.');
//       return;
//     }
//
//     // Exchange the Cognito token with ChatApp backend
//     loginWithCognitoToken(token)
//       .then(() => navigate('/chat'))
//       .catch((err) => {
//         console.error('Token exchange failed:', err);
//         setError('Authentication failed. Please try again from the main application.');
//       });
//   }, [isAuthenticated]);
//
//   return (
//     <div className="flex h-screen items-center justify-center bg-navy-900">
//       <div className="w-full max-w-md px-6 text-center">
//         <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-700">
//           <MessageSquare size={32} className="text-white" />
//         </div>
//         {error ? (
//           <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">
//             <p>{error}</p>
//             {/* <a href={PARENT_APP_URL} className="mt-2 inline-block text-sm underline">
//               Return to main application
//             </a> */}
//           </div>
//         ) : (
//           <div className="mt-4">
//             <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-navy-200 border-t-navy-800" />
//             <p className="mt-4 text-navy-300">Authenticating...</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
//
// --- Pattern B: Token via window.postMessage (iframe embedding) ---
// Parent app embeds ChatApp in an iframe and sends the token via postMessage.
//
// useEffect(() => {
//   function handleMessage(event) {
//     // IMPORTANT: Validate the origin to prevent cross-origin attacks
//     // if (event.origin !== PARENT_APP_ORIGIN) return;
//
//     const { type, token } = event.data;
//     if (type === 'COGNITO_TOKEN' && token) {
//       loginWithCognitoToken(token)
//         .then(() => navigate('/chat'))
//         .catch((err) => setError('Authentication failed'));
//     }
//   }
//
//   window.addEventListener('message', handleMessage);
//   // Notify parent that ChatApp is ready to receive the token
//   window.parent.postMessage({ type: 'CHATAPP_READY' }, '*');
//
//   return () => window.removeEventListener('message', handleMessage);
// }, []);

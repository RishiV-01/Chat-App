import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { getAllUsers } from '../../api/authApi';

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

import {
  LayoutDashboard,
  Users,
  Mail,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { disconnectSocket } from '../../socket/socketManager';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: false },
  { icon: Users, label: 'Contacts', active: false },
  { icon: Mail, label: 'Messages', active: true },
  { icon: Settings, label: 'Settings', active: false },
  { icon: Users, label: 'Users', active: false },
  { icon: HelpCircle, label: 'Help', active: false },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="flex w-14 flex-col items-center border-r bg-white py-3">
      {/* User initials */}
      <div className="mb-4 text-xs font-bold text-navy-800">{initials}</div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col items-center gap-1">
        {navItems.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            title={label}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              active
                ? 'bg-navy-800 text-white'
                : 'text-navy-600 hover:bg-gray-100 hover:text-navy-800'
            }`}
          >
            <Icon size={18} />
          </button>
        ))}
      </nav>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        title="Logout"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-600 transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}

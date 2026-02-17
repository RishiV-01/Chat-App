import { Search } from 'lucide-react';
import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="flex h-12 items-center justify-end border-b bg-white px-6">
          <div className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-1.5">
            <Search size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">Search</span>
          </div>
        </header>
        <main className="flex-1 overflow-hidden">{children}</main>
        {/* Footer */}
        <footer className="border-t bg-white px-6 py-2 text-center text-xs text-gray-400">
          &copy; 2026 eDIYBS. All Rights Reserved. |{' '}
          <span className="underline cursor-pointer">Privacy Policy</span> |{' '}
          <span className="underline cursor-pointer">Terms of Service</span> |{' '}
          Designed &amp; Developed by <span className="underline cursor-pointer">Health in Tech</span>
        </footer>
      </div>
    </div>
  );
}

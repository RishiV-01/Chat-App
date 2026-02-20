import { useState } from 'react';
import { Search } from 'lucide-react';
import Sidebar from './Sidebar';
import useUiStore from '../../store/uiStore';
import OpportunitiesPage from '../opportunities/OpportunitiesPage';

function IframeLoadingSkeleton() {
  return (
    <div className="absolute inset-0 flex flex-col bg-white animate-pulse">
      {/* Title skeleton */}
      <div className="px-8 pt-4 pb-3">
        <div className="h-10 w-48 rounded bg-gray-200" />
      </div>
      {/* Two-panel skeleton */}
      <div className="flex flex-1 gap-4 px-8 pb-4">
        {/* Left panel */}
        <div className="w-[400px] flex-shrink-0 rounded-xl border border-gray-200 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-8 w-28 rounded-full bg-gray-200" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="mb-3 flex items-center gap-3 rounded-xl bg-gray-100 p-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="mb-1 h-3 w-32 rounded bg-gray-200" />
                <div className="h-2 w-48 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
        {/* Right panel */}
        <div className="flex-1 rounded-xl border border-gray-200 p-4">
          <div className="mb-4 h-4 w-40 rounded bg-gray-200" />
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                <div className={`h-12 rounded-lg bg-gray-200 ${i % 2 === 0 ? 'w-60' : 'w-72'}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { activeView } = useUiStore();
  const [iframeLoaded, setIframeLoaded] = useState(false);

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

        {/* Main content area */}
        <main className="relative flex-1 overflow-hidden">
          {/* Loading skeleton - shown until iframe finishes loading */}
          {!iframeLoaded && activeView === 'messages' && <IframeLoadingSkeleton />}

          {/* Messages iframe - stays mounted to keep socket alive */}
          <iframe
            src="/embed/chat"
            title="Message Centre"
            onLoad={() => setIframeLoaded(true)}
            className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ${
              activeView === 'messages'
                ? iframeLoaded ? 'opacity-100' : 'opacity-0'
                : 'invisible'
            }`}
          />
          {activeView === 'opportunities' && (
            <OpportunitiesPage />
          )}
        </main>

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

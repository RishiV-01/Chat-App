import { useState } from 'react';
import { X } from 'lucide-react';
import useUiStore from '../../store/uiStore';

function ModalLoadingSkeleton() {
  return (
    <div className="flex flex-1 flex-col bg-white animate-pulse p-4">
      {/* Header skeleton */}
      <div className="mb-4 border-b pb-3">
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="mt-2 h-3 w-24 rounded bg-gray-200" />
      </div>
      {/* Message bubbles skeleton */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex justify-start">
          <div className="h-10 w-48 rounded-lg bg-gray-200" />
        </div>
        <div className="flex justify-end">
          <div className="h-10 w-40 rounded-lg bg-gray-200" />
        </div>
        <div className="flex justify-start">
          <div className="h-10 w-56 rounded-lg bg-gray-200" />
        </div>
      </div>
      {/* Input skeleton */}
      <div className="mt-4 border-t pt-3">
        <div className="flex gap-1 mb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 w-6 rounded bg-gray-200" />
          ))}
        </div>
        <div className="h-14 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export default function OpportunityMessageModal() {
  const { opportunityMessageModal, closeOpportunityMessageModal } = useUiStore();
  const { isOpen, opportunityId, opportunityName } = opportunityMessageModal;
  const [iframeLoaded, setIframeLoaded] = useState(false);

  if (!isOpen || !opportunityId) return null;

  const iframeSrc = `/embed/chat/${opportunityId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40">
      <div className="mr-4 flex h-[90vh] w-[500px] flex-col overflow-hidden rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <h2 className="text-lg font-bold uppercase tracking-widest text-white">
            Message
          </h2>
          <button
            onClick={closeOpportunityMessageModal}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Loading skeleton */}
        {!iframeLoaded && <ModalLoadingSkeleton />}

        {/* Chat iframe */}
        <iframe
          src={iframeSrc}
          title={`Chat - ${opportunityName || 'Opportunity'}`}
          onLoad={() => setIframeLoaded(true)}
          className={`flex-1 border-0 bg-white transition-opacity duration-300 ${iframeLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}

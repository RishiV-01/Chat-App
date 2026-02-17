import { useState } from 'react';
import { Send } from 'lucide-react';
import useUiStore from '../../../store/uiStore';
import useChatStore from '../../../store/chatStore';
import { emitEvent } from '../../../socket/socketManager';
import useFileUpload from '../../../hooks/useFileUpload';
import Modal from '../../common/Modal';
import FileDropZone from './FileDropZone';

export default function NewMessageModal() {
  const { isNewMessageModalOpen, closeNewMessageModal } = useUiStore();
  const { opportunities, setActiveOpportunity } = useChatStore();
  const [selectedOppId, setSelectedOppId] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const { upload, uploading, progress } = useFileUpload();

  const activeOpps = opportunities.filter((o) => o.status === 'active');

  const handleSend = async () => {
    if (!selectedOppId || (!messageContent.trim() && !selectedFile)) return;

    try {
      if (selectedFile) {
        const fileData = await upload(selectedFile, selectedOppId);
        emitEvent('send_message', {
          opportunityId: selectedOppId,
          content: messageContent.trim(),
          type: 'file',
          file: fileData,
        });
      } else {
        emitEvent('send_message', {
          opportunityId: selectedOppId,
          content: messageContent.trim(),
          type: 'text',
        });
      }

      setActiveOpportunity(selectedOppId);
      handleClose();
    } catch (err) {
      console.error('Send failed:', err);
    }
  };

  const handleClose = () => {
    setSelectedOppId('');
    setMessageContent('');
    setSelectedFile(null);
    closeNewMessageModal();
  };

  return (
    <Modal isOpen={isNewMessageModalOpen} onClose={handleClose} title="New Message">
      {/* Opportunity Select */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Opportunity Name
        </label>
        <select
          value={selectedOppId}
          onChange={(e) => setSelectedOppId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-400"
        >
          <option value="">Select Opportunity Name</option>
          {activeOpps.map((opp) => (
            <option key={opp._id} value={opp._id}>
              {opp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Message Details */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Message Details
        </label>
        <textarea
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="Start typing..."
          rows={5}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-400"
        />
      </div>

      {/* Attachments */}
      <div className="mb-6">
        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Attachment(s)
        </label>
        <FileDropZone
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
          uploading={uploading}
          progress={progress}
        />
      </div>

      {/* Send button */}
      <div className="flex justify-end">
        <button
          onClick={handleSend}
          disabled={!selectedOppId || (!messageContent.trim() && !selectedFile) || uploading}
          className="flex items-center gap-2 rounded-full bg-navy-800 px-6 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-navy-700"
        >
          Send
          <Send size={16} />
        </button>
      </div>
    </Modal>
  );
}

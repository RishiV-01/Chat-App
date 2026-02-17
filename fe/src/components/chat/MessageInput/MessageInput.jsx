import { useState, useRef, useCallback } from 'react';
import { Bold, Italic, Underline, List, Paperclip } from 'lucide-react';
import { emitEvent } from '../../../socket/socketManager';
import useTyping from '../../../hooks/useTyping';
import useFileUpload from '../../../hooks/useFileUpload';

export default function MessageInput({ opportunityId, isReadOnly }) {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const { startTyping, stopTyping } = useTyping(opportunityId);
  const { upload, uploading, progress } = useFileUpload();

  const handleSend = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed && !selectedFile) return;

    stopTyping();

    try {
      if (selectedFile) {
        const fileData = await upload(selectedFile, opportunityId);
        emitEvent('send_message', {
          opportunityId,
          content: trimmed,
          type: 'file',
          file: fileData,
        });
      } else {
        emitEvent('send_message', {
          opportunityId,
          content: trimmed,
          type: 'text',
        });
      }

      setContent('');
      setSelectedFile(null);
      textareaRef.current?.focus();
    } catch (err) {
      console.error('Send failed:', err);
    }
  }, [content, selectedFile, opportunityId, stopTyping, upload]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setContent(e.target.value);
    startTyping();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const applyFormat = (tag) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const wrapped = `<${tag}>${selected}</${tag}>`;
    setContent(content.substring(0, start) + wrapped + content.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length + 2, start + tag.length + 2 + selected.length);
    }, 0);
  };

  if (isReadOnly) {
    return (
      <div className="border-t bg-gray-50 px-6 py-4 text-center text-sm text-gray-400">
        This conversation is read-only
      </div>
    );
  }

  const formatButtons = [
    { icon: Bold, tag: 'b', label: 'Bold' },
    { icon: Italic, tag: 'i', label: 'Italic' },
    { icon: Underline, tag: 'u', label: 'Underline' },
    { icon: List, tag: 'li', label: 'List' },
  ];

  return (
    <div className="border-t">
      {/* File preview */}
      {selectedFile && (
        <div className="mx-6 mt-2 flex items-center gap-2 rounded bg-gray-50 px-3 py-2 text-sm">
          <Paperclip size={14} className="text-gray-500" />
          <span className="flex-1 truncate">{selectedFile.name}</span>
          {uploading && <span className="text-navy-600">{progress}%</span>}
          <button
            onClick={() => setSelectedFile(null)}
            className="text-gray-400 hover:text-red-500"
          >
            &times;
          </button>
        </div>
      )}

      {/* Toolbar row: formatting buttons left, attachment icon right */}
      <div className="flex items-center justify-between px-6 pt-3">
        <div className="flex items-center gap-1">
          {formatButtons.map(({ icon: Icon, tag, label }) => (
            <button
              key={tag}
              onClick={() => applyFormat(tag)}
              title={label}
              className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <Icon size={18} />
            </button>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Attach file"
          className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <Paperclip size={18} />
        </button>
      </div>

      {/* Textarea */}
      <div className="px-6 pb-4 pt-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Start typing..."
          rows={2}
          className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-600 placeholder-gray-400 outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-400"
          style={{ minHeight: '56px', maxHeight: '120px' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
        />
      </div>
    </div>
  );
}

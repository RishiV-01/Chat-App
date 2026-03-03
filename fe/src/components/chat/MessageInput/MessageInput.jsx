import { useState, useRef, useCallback, useEffect } from 'react';
import { Bold, Italic, Underline, List, Paperclip, Send } from 'lucide-react';
import { emitEvent } from '../../../socket/socketManager';
import useTyping from '../../../hooks/useTyping';
import useFileUpload from '../../../hooks/useFileUpload';

export default function MessageInput({ opportunityId, isReadOnly, showActionButtons }) {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const { startTyping, stopTyping } = useTyping(opportunityId);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    insertUnorderedList: false,
  });

  const { upload, uploading, progress } = useFileUpload();

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
    });
  };
  useEffect(() => {
    document.addEventListener('selectionchange', updateActiveFormats);
    return () => {
      document.removeEventListener('selectionchange', updateActiveFormats);
    };
  }, []);

  const handleSend = useCallback(async () => {
    const editor = textareaRef.current;
    if (!editor) return;

    const htmlContent = editor.innerHTML.trim();
    const plainText = editor.innerText.trim();

    // Prevent sending empty message
    if (!plainText && !selectedFile) return;

    stopTyping();

    try {
      if (selectedFile) {
        const fileData = await upload(selectedFile, opportunityId);

        emitEvent('send_message', {
          opportunityId,
          content: htmlContent, // use htmlContent
          type: 'file',
          file: fileData,
        });
      } else {
        emitEvent('send_message', {
          opportunityId,
          content: htmlContent, // use htmlContent
          type: 'text',
        });
      }

      // Clear editor
      editor.innerHTML = '';
      setContent('');
      setSelectedFile(null);

      editor.focus();
    } catch (err) {
      console.error('Send failed:', err);
    }
  }, [selectedFile, opportunityId, stopTyping, upload]);

  const handleKeyDown = (e) => {
    const isListActive = document.queryCommandState('insertUnorderedList');

    if (e.key === 'Enter' && !e.shiftKey) {
      if (isListActive) {
        // Allow default behavior → creates new bullet
        return;
      }
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

  const applyFormat = (command) => {
    textareaRef.current?.focus();
    document.execCommand(command, false, null);
    updateActiveFormats();
  };


  if (isReadOnly) {
    return (
      <div className="border-t bg-gray-50 px-2 xs:px-3 sm:px-6 py-2 xs:py-3 sm:py-4 text-center text-[10px] xs:text-xs sm:text-sm text-gray-400">
        This conversation is read-only
      </div>
    );
  }

  const formatButtons = [
    { icon: Bold, command: 'bold', label: 'Bold' },
    { icon: Italic, command: 'italic', label: 'Italic' },
    { icon: Underline, command: 'underline', label: 'Underline' },
    { icon: List, command: 'insertUnorderedList', label: 'List' },
  ];

  return (
    <div className="border-t">
      {/* File preview */}
      {selectedFile && (
        <div className="mx-2 xs:mx-3 sm:mx-6 mt-1.5 xs:mt-2 flex items-center gap-1.5 xs:gap-2 rounded bg-gray-50 px-1.5 xs:px-2 sm:px-3 py-1 xs:py-1.5 sm:py-2 text-[10px] xs:text-xs sm:text-sm">
          <Paperclip size={10} className="text-gray-500 xs:w-3 xs:h-3 sm:w-[14px] sm:h-[14px]" />
          <span className="flex-1 truncate">{selectedFile.name}</span>
          {uploading && <span className="text-navy-600 text-[9px] xs:text-[10px]">{progress}%</span>}
          <button
            onClick={() => setSelectedFile(null)}
            className="text-gray-400 hover:text-red-500"
          >
            &times;
          </button>
        </div>
      )}

      {/* Toolbar row: formatting buttons left, attachment icon right */}
      <div className="flex items-center justify-between px-1.5 xs:px-2 sm:px-4 py-0.5 xs:py-1 bg-[#9ca3af30]">
        <div className="flex items-center gap-0.5">
          {formatButtons.map(({ icon: Icon, command, label }) => {
            const isActive = activeFormats[command];

            return (
              <button
                key={command}
                onClick={() => applyFormat(command)}
                title={label}
                className={`flex h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 items-center justify-center rounded
        ${isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
              >
                <Icon size={12} className="xs:w-[14px] xs:h-[14px] sm:w-[18px] sm:h-[18px]" />
              </button>
            );
          })}
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
          className="flex h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 items-center justify-center rounded text-black-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <Paperclip size={12} className="xs:w-[14px] xs:h-[14px] sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>

      {/* Textarea */}
      <div
        ref={textareaRef}
        contentEditable
        onInput={(e) => {
          setContent(e.currentTarget.innerHTML);
          startTyping();
        }}
        onKeyDown={handleKeyDown}
        data-placeholder="Start typing..."
        className="w-full border-t px-1.5 xs:px-2 sm:px-4 py-1.5 xs:py-2 sm:py-3 text-[10px] xs:text-xs sm:text-sm text-gray-700 outline-none
             min-h-[40px] xs:min-h-[48px] sm:min-h-[56px] max-h-[80px] xs:max-h-[100px] sm:max-h-[120px] overflow-y-auto
             [&>ul]:list-disc [&>ul]:pl-3 xs:[&>ul]:pl-4 sm:[&>ul]:pl-6
             empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
        suppressContentEditableWarning
      />

      {/* Action buttons - shown in modal/embed mode */}
      {showActionButtons && (
        <div className="flex items-center justify-end gap-1.5 xs:gap-2 sm:gap-3 border-t px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3">
          <button
            onClick={() => {}}
            className="rounded-lg border border-gray-300 px-2 xs:px-3 sm:px-5 py-1 xs:py-1.5 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Save Draft
          </button>
          <button
            onClick={handleSend}
            className="flex items-center gap-1 xs:gap-1 sm:gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 px-2 xs:px-3 sm:px-5 py-1 xs:py-1.5 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Send
            <Send size={10} className="xs:w-3 xs:h-3 sm:w-[14px] sm:h-[14px]" />
          </button>
        </div>
      )}
    </div>
  );
}

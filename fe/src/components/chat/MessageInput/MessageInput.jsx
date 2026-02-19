import { useState, useRef, useCallback, useEffect } from 'react';
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
      <div className="border-t bg-gray-50 px-6 py-4 text-center text-sm text-gray-400">
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
      <div className="flex items-center justify-between px-4 py-1 bg-[#9ca3af30]">
        <div className="flex items-center gap-1">
          {formatButtons.map(({ icon: Icon, command, label }) => {
            const isActive = activeFormats[command];

            return (
              <button
                key={command}
                onClick={() => applyFormat(command)}
                title={label}
                className={`flex h-7 w-7 items-center justify-center rounded
        ${isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
              >
                <Icon size={18} />
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
          className="flex h-7 w-7 items-center justify-center rounded text-black-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <Paperclip size={18} />
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
        className="w-full border-t px-4 py-3 text-sm text-gray-700 outline-none 
             min-h-[56px] max-h-[120px] overflow-y-auto
             [&>ul]:list-disc [&>ul]:pl-6"
        suppressContentEditableWarning
      />
    </div>
  );
}

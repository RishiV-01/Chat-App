import { Bold, Italic, Underline, List } from 'lucide-react';

export default function FormattingToolbar({ onFormat }) {
  const tools = [
    { icon: Bold, tag: 'b', label: 'Bold' },
    { icon: Italic, tag: 'i', label: 'Italic' },
    { icon: Underline, tag: 'u', label: 'Underline' },
    { icon: List, tag: 'li', label: 'List' },
  ];

  return (
    <div className="flex items-center gap-1 border-b px-6 py-1.5">
      {tools.map(({ icon: Icon, tag, label }) => (
        <button
          key={tag}
          onClick={() => onFormat(tag)}
          title={label}
          className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}

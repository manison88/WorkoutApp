interface NoteEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function NoteEditor({ value, onChange, placeholder }: NoteEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => onChange(value)}
      placeholder={placeholder ?? 'Add notes...'}
      rows={3}
      className="w-full bg-dark-base border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-purple transition-all duration-200 resize-none"
    />
  );
}

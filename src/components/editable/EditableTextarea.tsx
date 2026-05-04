import { useEffect, useRef, useState } from 'react';

type Props = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  ariaLabel?: string;
};

export function EditableTextarea({
  value,
  onChange,
  placeholder = 'Click to add notes…',
  className = '',
  rows = 4,
  ariaLabel,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  if (editing) {
    return (
      <textarea
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (draft !== value) onChange(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        rows={rows}
        aria-label={ariaLabel}
        className={`w-full px-2 py-1 border border-indigo-400 rounded bg-white text-sm resize-y ${className}`}
      />
    );
  }

  return (
    <div
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setDraft(value);
          setEditing(true);
        }
      }}
      aria-label={ariaLabel}
      className={`cursor-text hover:bg-yellow-50 rounded p-2 -m-2 whitespace-pre-line text-sm min-h-[6rem] ${value ? 'text-gray-800' : 'text-gray-400 italic'} ${className}`}
    >
      {value || placeholder}
    </div>
  );
}

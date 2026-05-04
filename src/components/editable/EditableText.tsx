import { useEffect, useRef, useState } from 'react';

type Props = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  /** Render the static (non-editing) view. Defaults to a span with text. */
  className?: string;
  /** Tag for the static view. */
  as?: 'span' | 'div';
  /** Optional input width hint. */
  size?: number;
  ariaLabel?: string;
};

/**
 * Click the rendered text to switch to an input. Blur or Enter saves; Esc cancels.
 * Empty values render the placeholder dimmed; clicking the placeholder enters edit mode.
 */
export function EditableText({
  value,
  onChange,
  placeholder = '—',
  className = '',
  as = 'span',
  size,
  ariaLabel,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (draft !== value) onChange(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          } else if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        size={size}
        aria-label={ariaLabel}
        className={`px-1 -mx-1 border border-indigo-400 rounded bg-white text-sm ${className}`}
      />
    );
  }

  const Tag = as;
  const isEmpty = !value;
  return (
    <Tag
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
      className={`cursor-text hover:bg-yellow-50 rounded px-0.5 -mx-0.5 ${isEmpty ? 'text-gray-400 italic' : ''} ${className}`}
    >
      {isEmpty ? placeholder : value}
    </Tag>
  );
}

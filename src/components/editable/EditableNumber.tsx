import { useEffect, useRef, useState } from 'react';

type Props = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  className?: string;
  size?: number;
  /** Format the number for display (e.g. comma-separated). */
  format?: (n: number) => string;
  ariaLabel?: string;
};

export function EditableNumber({
  value,
  onChange,
  min,
  max,
  className = '',
  size = 6,
  format = (n) => String(n),
  ariaLabel,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() === '') return; // empty input → cancel without calling onChange
    const n = Number(draft);
    if (!Number.isFinite(n) || !Number.isInteger(n)) return;
    let clamped = n;
    if (typeof min === 'number') clamped = Math.max(min, clamped);
    if (typeof max === 'number') clamped = Math.min(max, clamped);
    if (clamped !== value) onChange(clamped);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        inputMode="numeric"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          } else if (e.key === 'Escape') {
            setDraft(String(value));
            setEditing(false);
          }
        }}
        min={min}
        max={max}
        size={size}
        aria-label={ariaLabel}
        className={`w-14 px-1 -mx-1 border border-red-400 rounded bg-white text-sm ${className}`}
      />
    );
  }

  return (
    <span
      onClick={() => {
        setDraft(String(value));
        setEditing(true);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setDraft(String(value));
          setEditing(true);
        }
      }}
      aria-label={ariaLabel}
      className={`cursor-text hover:bg-yellow-50 rounded px-0.5 -mx-0.5 font-mono ${className}`}
    >
      {format(value)}
    </span>
  );
}

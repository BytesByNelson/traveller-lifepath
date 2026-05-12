import { useState } from 'react';
import { useGmOverride } from '../gm/useGmOverride';

/**
 * GM mode control: a single small button when off (just shows "GM"), or a
 * compact input + queue display when on. Sits in the bottom-right pod next
 * to ThemeSwitcher and FontSizeSwitcher.
 *
 * When enabled and the queue has values, the next "Roll for me" button click
 * anywhere in the app consumes the head value instead of calling the RNG.
 * Useful for testing edge cases (force qualification fail, force survival
 * pass), reproducing reported bugs, or steering a session at the table.
 */
export function GmOverridePanel() {
  const { enabled, queue, setEnabled, enqueue, clear } = useGmOverride();
  const [input, setInput] = useState('');

  if (!enabled) {
    return (
      <button
        type="button"
        onClick={() => setEnabled(true)}
        title="GM mode: queue specific dice values to force on the next rolls"
        aria-label="Enable GM dice override mode"
        className="inline-flex items-center justify-center rounded border border-gray-300 bg-white text-xs text-gray-700 hover:bg-gray-50 shadow-sm px-2 py-1"
      >
        GM
      </button>
    );
  }

  const submit = () => {
    const parsed = input
      .split(/[,\s]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && Number.isInteger(n));
    if (parsed.length === 0) return;
    enqueue(parsed);
    setInput('');
  };

  return (
    <div
      role="group"
      aria-label="GM dice override"
      className="inline-flex items-stretch gap-1 rounded border border-amber-400 bg-amber-50 text-xs text-amber-900 shadow-sm px-2 py-1"
    >
      <span className="font-semibold uppercase tracking-wider self-center">GM</span>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
        placeholder="next rolls e.g. 8,10,3"
        aria-label="Queue dice values, comma-separated"
        className="w-32 px-1 py-0.5 border border-amber-300 rounded bg-white text-gray-900"
      />
      <button
        type="button"
        onClick={submit}
        className="px-1.5 py-0.5 rounded border border-amber-300 bg-white hover:bg-amber-100"
      >
        Queue
      </button>
      <span
        className="self-center px-1 font-mono text-amber-900"
        title="Queued values consumed by the next dice rolls"
      >
        {queue.length === 0 ? '(empty)' : `→ ${queue.join(', ')}`}
      </span>
      <button
        type="button"
        onClick={clear}
        disabled={queue.length === 0}
        className="px-1.5 py-0.5 rounded border border-amber-300 bg-white hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Clear
      </button>
      <button
        type="button"
        onClick={() => setEnabled(false)}
        title="Exit GM mode"
        aria-label="Exit GM dice override mode"
        className="px-1.5 py-0.5 rounded border border-amber-300 bg-white hover:bg-amber-100"
      >
        ×
      </button>
    </div>
  );
}

import { useMemo, useState } from 'react';
import type { RollLogEntry } from '../types';

type Props = {
  entries: RollLogEntry[];
  onClose: () => void;
};

type SourceFilter = 'all' | 'rng' | 'manual';
type OutcomeFilter = 'all' | 'pass' | 'fail' | 'no_target';

export function RollLogViewer({ entries, onClose }: Props) {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('all');
  const [contextFilter, setContextFilter] = useState('');
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (sourceFilter !== 'all' && e.source !== sourceFilter) return false;
      if (outcomeFilter === 'pass' && e.success !== true) return false;
      if (outcomeFilter === 'fail' && e.success !== false) return false;
      if (outcomeFilter === 'no_target' && e.target !== undefined) return false;
      if (contextFilter && !e.context.toLowerCase().includes(contextFilter.toLowerCase())) return false;
      return true;
    });
  }, [entries, sourceFilter, outcomeFilter, contextFilter]);

  const onCopy = async () => {
    const text = filtered
      .map((e) => formatEntryAsText(e))
      .reverse()
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — clipboard may be denied
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Roll log"
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 print:hidden"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-baseline justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Roll log</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none" aria-label="Close">
            ×
          </button>
        </header>

        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3 text-sm">
          <label className="flex items-center gap-1">
            Source:
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
              className="px-1 py-0.5 border border-gray-300 rounded"
              aria-label="Source filter"
            >
              <option value="all">All</option>
              <option value="rng">RNG</option>
              <option value="manual">Manual</option>
            </select>
          </label>
          <label className="flex items-center gap-1">
            Outcome:
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value as OutcomeFilter)}
              className="px-1 py-0.5 border border-gray-300 rounded"
              aria-label="Outcome filter"
            >
              <option value="all">All</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="no_target">No target</option>
            </select>
          </label>
          <label className="flex items-center gap-1 flex-1 min-w-[150px]">
            Context:
            <input
              type="text"
              value={contextFilter}
              onChange={(e) => setContextFilter(e.target.value)}
              placeholder="filter..."
              className="px-1 py-0.5 border border-gray-300 rounded flex-1"
              aria-label="Context filter"
            />
          </label>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {filtered.length} of {entries.length}
            </span>
            <button
              onClick={onCopy}
              className="px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-50 text-xs"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No entries match the current filters.</p>
          ) : (
            <ol className="space-y-2 text-sm">
              {filtered.slice().reverse().map((e) => (
                <li key={e.id} className="border border-gray-200 rounded p-2 bg-white">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium text-gray-900 truncate">{e.context}</span>
                    <span className="shrink-0 text-xs text-gray-400">{new Date(e.ts).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1 flex items-baseline flex-wrap gap-x-3">
                    {e.target !== undefined ? <span>Target: <strong>{e.target}+</strong></span> : null}
                    {e.natural !== undefined ? <span>Natural: <strong>{e.natural}</strong></span> : null}
                    <span>
                      Result:{' '}
                      <strong className={e.success === undefined ? '' : e.success ? 'text-emerald-700' : 'text-red-600'}>
                        {e.result}
                      </strong>
                    </span>
                    <span className="text-gray-400">
                      {e.source === 'rng' ? '🎲 rolled' : '✍ entered'}
                    </span>
                  </div>
                  {e.dms && e.dms.length > 0 ? (
                    <ul className="text-[11px] text-gray-500 mt-1 ml-2 space-y-0.5">
                      {e.dms.map((d, i) => (
                        <li key={i}>
                          {d.source}:{' '}
                          <span className={d.value < 0 ? 'text-red-600' : d.value > 0 ? 'text-emerald-700' : ''}>
                            {d.value > 0 ? '+' : ''}
                            {d.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

function formatEntryAsText(e: RollLogEntry): string {
  const parts: string[] = [new Date(e.ts).toISOString(), e.context];
  if (e.target !== undefined) parts.push(`target ${e.target}+`);
  if (e.natural !== undefined) parts.push(`natural ${e.natural}`);
  parts.push(`result ${e.result}`);
  if (e.success !== undefined) parts.push(e.success ? 'PASS' : 'FAIL');
  parts.push(e.source);
  return parts.join(' | ');
}

import type { RollLogEntry } from '../types';

export function RollLog({ entries }: { entries: RollLogEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-gray-500 italic">No rolls yet.</p>;
  }
  return (
    <ol className="text-sm space-y-1.5 font-mono">
      {entries.map((e) => (
        <li key={e.id} className="flex gap-2">
          <span className="text-gray-400 shrink-0 w-12">
            {new Date(e.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-gray-700 flex-1 truncate">{e.context}</span>
          <span className="text-gray-500 shrink-0">
            {e.target !== undefined ? `${e.target}+ ` : ''}
            <span className={e.success === undefined ? '' : e.success ? 'text-emerald-700' : 'text-red-600'}>
              {e.result}
            </span>
            <span className="text-gray-400">{e.source === 'rng' ? ' 🎲' : ' ✍'}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

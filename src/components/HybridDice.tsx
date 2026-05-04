import { useState } from 'react';
import { roll2d, type Rng } from '../engine';

type Props = {
  /** Title of the roll, shown above the buttons. */
  title: string;
  /** Target number — caller computes "target - DM" if needed. The UI renders the raw target and DMs separately. */
  target: number;
  /** DM breakdown. Shown next to the buttons. */
  dms: { source: string; value: number }[];
  /** Number of dice to roll: 2D for most checks, 1D for table rolls. */
  dice?: '1D' | '2D';
  /** Called with (natural, modifiedTotal, source). Both equal for 1D rolls. */
  onResult: (natural: number, modifiedTotal: number, source: 'rng' | 'manual') => void;
  /** RNG override — defaults to Math.random. */
  rng?: Rng;
  /** Which controls to show. 'app' shows only Roll for me; 'manual' shows only the input; 'both' shows both. */
  mode?: 'app' | 'manual' | 'both';
};

export function HybridDice({ title, target, dms, dice = '2D', onResult, rng, mode = 'both' }: Props) {
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const dmTotal = dms.reduce((acc, d) => acc + d.value, 0);
  const max = dice === '2D' ? 12 : 6;
  const min = dice === '2D' ? 2 : 1;

  const rollForMe = () => {
    const natural = dice === '2D' ? roll2d(rng).total : 1 + Math.floor((rng ?? Math.random)() * 6);
    onResult(natural, natural + dmTotal, 'rng');
  };

  const submitManual = () => {
    const n = Number(manualInput);
    if (!Number.isInteger(n) || n < min || n > max) {
      setError(`Enter a whole number from ${min} to ${max}`);
      return;
    }
    setError(null);
    onResult(n, n + dmTotal, 'manual');
    setManualInput('');
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
        <div className="text-sm text-gray-600">
          Target: <span className="font-semibold text-gray-900">{target}+</span>
        </div>
      </div>
      {dms.length > 0 ? (
        <ul className="text-xs text-gray-600 mb-3 space-y-0.5">
          {dms.map((d, i) => (
            <li key={i}>
              <span className="text-gray-500">{d.source}:</span>{' '}
              <span className={d.value < 0 ? 'text-red-600' : 'text-emerald-700'}>
                {d.value > 0 ? '+' : ''}
                {d.value}
              </span>
            </li>
          ))}
          <li className="font-medium text-gray-900">
            Total DM: {dmTotal > 0 ? '+' : ''}
            {dmTotal}
          </li>
        </ul>
      ) : (
        <div className="text-xs text-gray-500 mb-3">No modifiers.</div>
      )}
      <div className="flex gap-2 items-center flex-wrap">
        {mode !== 'manual' ? (
          <button
            type="button"
            onClick={rollForMe}
            className="px-3 py-1.5 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            Roll for me ({dice})
          </button>
        ) : null}
        {mode === 'both' ? <span className="text-xs text-gray-500">or</span> : null}
        {mode !== 'app' ? (
          <>
            <input
              type="number"
              inputMode="numeric"
              min={min}
              max={max}
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder={`${min}–${max}`}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <button
              type="button"
              onClick={submitManual}
              className="px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-gray-50"
            >
              Enter result
            </button>
          </>
        ) : null}
      </div>
      {error ? <div className="text-xs text-red-600 mt-2">{error}</div> : null}
    </div>
  );
}

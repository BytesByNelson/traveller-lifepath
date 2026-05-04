import { useState } from 'react';
import type { Character } from '../../types';
import { rollPSI, setPSI } from '../../engine';

/**
 * Visible only when the Traveller has no PSI rating yet. Rolls 2D − terms
 * served per the Psionic Strength rules and sets it on the character.
 */
export function PsiTestButton({
  character,
  onChange,
}: {
  character: Character;
  onChange: (next: Character) => void;
}) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<{ rolled: number; psi: number } | null>(null);

  if (character.psi) return null;

  const terms = character.careerHistory.length;

  const doRoll = () => {
    const r = rollPSI(Math.random, terms);
    setResult(r);
  };

  const accept = () => {
    if (!result) return;
    onChange(setPSI(character, result.psi));
    setOpen(false);
    setResult(null);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm px-3 py-1 rounded border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 print:hidden"
        title="Test psionic potential — institute testing"
      >
        Test PSI
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="Psionic Strength test"
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 print:hidden"
          onClick={() => {
            setOpen(false);
            setResult(null);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-semibold">Psionic Strength test</h2>
            <p className="text-sm text-gray-600">
              Roll 2D − terms served (currently {terms}). Floor 0. Costs Cr5,000 and two weeks at the institute.
              The referee normally has to permit this; the rulebook gates it through Life Events 12.1 or pre-career events.
            </p>

            {result === null ? (
              <button
                onClick={doRoll}
                className="px-3 py-1.5 rounded bg-amber-600 text-white text-sm hover:bg-amber-700"
              >
                Roll for me
              </button>
            ) : (
              <div className="text-sm space-y-2">
                <div>
                  Rolled <strong>{result.rolled}</strong> on 2D, minus {terms} terms ={' '}
                  <strong className={result.psi > 0 ? 'text-emerald-700' : 'text-red-700'}>
                    PSI {result.psi}
                  </strong>
                </div>
                {result.psi > 0 ? (
                  <p className="text-gray-700">
                    You have psionic potential. After accepting, training (Cr100,000, four months) lets you
                    attempt to learn talents — add them to your skill list to track them on the sheet.
                  </p>
                ) : (
                  <p className="text-red-700">No potential. PSI 0 means no psionic talents are available.</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={accept}
                    className="px-3 py-1.5 rounded bg-amber-600 text-white text-sm hover:bg-amber-700"
                  >
                    Accept (sets PSI {result.psi})
                  </button>
                  <button
                    onClick={() => setResult(null)}
                    className="px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-gray-50"
                  >
                    Re-roll
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

import type { Character } from '../types';
import { CAREERS } from '../data';

/**
 * Between-terms branching:
 *   - continue same career & assignment (if last term outcome allows)
 *   - change assignment within same career
 *   - change career
 *   - muster out
 *
 * Forced routes (Prisoner / Drifter / Draft) are surfaced when wizardState flags say so.
 */
export function BetweenTermsStep({
  character,
  onChange,
  onContinueSame,
  onChangeAssignment,
  onChangeCareer,
  onMusterOut,
}: {
  character: Character;
  onChange: (c: Character) => void;
  onContinueSame: () => void;
  onChangeAssignment: () => void;
  onChangeCareer: () => void;
  onMusterOut: () => void;
}) {
  const lastTerm = character.careerHistory.at(-1);
  const wizard = character.wizardState ?? { step: 'between_terms' };
  const forced = wizard.forcedNextCareer;
  const draft = wizard.forcedDraft;

  if (!lastTerm) {
    return <p className="text-gray-500">No completed terms yet.</p>;
  }

  const lastCareer = CAREERS[lastTerm.career];
  const ejectedOrForced = lastTerm.termOutcome === 'ejected' || !!forced || !!draft;
  const mustContinue = lastTerm.termOutcome === 'forced_to_continue';

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Between terms</h2>

      <div className="rounded border border-gray-200 p-3 text-sm bg-gray-50">
        <div className="font-medium">
          Term {lastTerm.index + 1} — {lastCareer.name} ({lastCareer.assignments.find((a) => a.id === lastTerm.assignment)?.name})
        </div>
        <div className="text-xs text-gray-600">
          Outcome: <span className="capitalize">{lastTerm.termOutcome.replace('_', ' ')}</span>
          {lastTerm.advancement
            ? ` • Advancement ${lastTerm.advancement.success ? 'passed' : 'failed'} (${lastTerm.advancement.rolled})`
            : ''}
          {lastTerm.isOfficer ? ' • Commissioned officer' : ''}
        </div>
      </div>

      {forced ? (
        <div className="rounded border border-red-200 p-3 text-sm bg-red-50 space-y-2">
          <p>
            <strong>Forced career switch:</strong> next term you must enter the {forced.career}{' '}
            career{forced.assignment ? ` (${forced.assignment})` : ''}.
          </p>
          <button
            onClick={() => {
              const next: Character = {
                ...character,
                wizardState: { ...wizard, forcedNextCareer: undefined, step: 'career_term' },
              };
              onChange(next);
              onChangeCareer();
            }}
            className="px-4 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700"
          >
            Begin forced term
          </button>
        </div>
      ) : draft ? (
        <div className="rounded border border-amber-200 p-3 text-sm bg-amber-50 space-y-2">
          <p>
            <strong>Draft:</strong> a roll on the Draft table will assign you to a service.
          </p>
          <button
            onClick={() => {
              const next: Character = {
                ...character,
                wizardState: { ...wizard, forcedDraft: false, step: 'career_term' },
              };
              onChange(next);
              onChangeCareer();
            }}
            className="px-4 py-2 rounded bg-amber-600 text-white text-sm hover:bg-amber-700"
          >
            Roll the draft
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={ejectedOrForced || lastTerm.advancement?.rolled !== undefined &&
            lastTerm.advancement.rolled <= character.careerHistory.filter((t) => t.career === lastTerm.career).length &&
            character.careerHistory.filter((t) => t.career === lastTerm.career).length > 0 &&
            !mustContinue}
          onClick={() => {
            // Mark the continuation so CareerTermStep skips the career picker and qualification roll.
            onChange({
              ...character,
              wizardState: {
                ...wizard,
                continueInCareer: { career: lastTerm.career, assignment: lastTerm.assignment },
                step: 'career_term',
              },
            });
            onContinueSame();
          }}
          className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-left"
        >
          <div className="font-medium text-sm">Continue same assignment</div>
          <div className="text-xs text-gray-500">
            Keep going in {lastCareer.name}{mustContinue ? ' (forced — natural 12)' : ''}.
          </div>
        </button>

        <button
          disabled={ejectedOrForced || mustContinue}
          onClick={() => {
            // Stay in career, pick a new assignment — re-qualification applies per rules.
            onChange({
              ...character,
              wizardState: {
                ...wizard,
                continueInCareer: undefined,
                step: 'career_term',
              },
            });
            onChangeAssignment();
          }}
          className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-left"
        >
          <div className="font-medium text-sm">Change assignment</div>
          <div className="text-xs text-gray-500">Pick a different assignment in {lastCareer.name} (qualification roll).</div>
        </button>

        <button
          disabled={mustContinue}
          onClick={() => {
            onChange({
              ...character,
              wizardState: {
                ...wizard,
                continueInCareer: undefined,
                step: 'career_term',
              },
            });
            onChangeCareer();
          }}
          className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-left"
        >
          <div className="font-medium text-sm">Change career</div>
          <div className="text-xs text-gray-500">New career and assignment (qualification roll, DM-1 per previous career).</div>
        </button>

        <button
          disabled={mustContinue}
          onClick={onMusterOut}
          className="px-3 py-2 rounded border border-emerald-400 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-left"
        >
          <div className="font-medium text-sm">Muster out</div>
          <div className="text-xs text-gray-600">Take your benefits and start adventuring.</div>
        </button>
      </div>
    </section>
  );
}

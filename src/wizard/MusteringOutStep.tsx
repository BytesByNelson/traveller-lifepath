import { useMemo, useState } from 'react';
import type { CareerId, Character } from '../types';
import { CAREERS, MAX_CASH_BENEFIT_ROLLS_TOTAL, rankBenefits } from '../data';
import {
  computeCharacterPension,
  startMusteringOutRoll,
  type EngineState,
} from '../engine';
import { PendingPrompt } from '../components/PendingPrompt';

type Allocation = { careerId: CareerId; column: 'cash' | 'benefits' };

type Phase =
  | { kind: 'plan' }
  | { kind: 'rolling'; engine: EngineState; current: Allocation; rolledRow: number };

type CareerBucket = { careerId: CareerId; rolls: number };

export function MusteringOutStep({
  character,
  onChange,
  onDone,
}: {
  character: Character;
  onChange: (c: Character) => void;
  onDone: () => void;
}) {
  const buckets = useMemo<CareerBucket[]>(() => {
    const map = new Map<CareerId, { terms: number; highestRank: number }>();
    for (const t of character.careerHistory) {
      const cur = map.get(t.career) ?? { terms: 0, highestRank: 0 };
      cur.terms += 1;
      cur.highestRank = Math.max(cur.highestRank, t.rankAtEnd);
      map.set(t.career, cur);
    }
    const result: CareerBucket[] = [];
    for (const [careerId, info] of map) {
      const bonus = rankBenefits(info.highestRank)?.bonusBenefitRolls ?? 0;
      result.push({ careerId, rolls: info.terms + bonus });
    }
    return result;
  }, [character.careerHistory]);

  const [remaining, setRemaining] = useState<Record<CareerId, number>>(() => {
    const r = {} as Record<CareerId, number>;
    for (const b of buckets) r[b.careerId] = b.rolls;
    return r;
  });
  const [phase, setPhase] = useState<Phase>({ kind: 'plan' });
  const cashUsed = character.cashRollsUsed;
  const cashRemainingGlobal = MAX_CASH_BENEFIT_ROLLS_TOTAL - cashUsed;

  const rollFor = (careerId: CareerId, column: 'cash' | 'benefits') => {
    const career = CAREERS[careerId];
    // Pop one carried benefit-roll DM (e.g. from a pre-career life event "DM+2 to next benefit roll").
    const carried = character.wizardState?.carriedDMs?.benefitRollDMs ?? [];
    const [appliedDM, ...rest] = carried;
    const characterAfterPop: Character = appliedDM !== undefined
      ? {
          ...character,
          wizardState: {
            ...(character.wizardState ?? { step: 'mustering_out' }),
            carriedDMs: {
              ...(character.wizardState?.carriedDMs ?? {}),
              benefitRollDMs: rest,
            },
          },
        }
      : character;
    if (appliedDM !== undefined) onChange(characterAfterPop);
    const { state, row } = startMusteringOutRoll(characterAfterPop, career, column, appliedDM ?? 0, Math.random);
    setPhase({ kind: 'rolling', engine: state, current: { careerId, column }, rolledRow: row });
  };

  const carriedBenefitDMs = character.wizardState?.carriedDMs?.benefitRollDMs ?? [];

  if (phase.kind === 'rolling') {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Mustering out — rolled {phase.rolledRow}</h2>
        {phase.engine.prompt ? (
          <PendingPrompt
            state={phase.engine}
            onUpdate={(s) => {
              onChange(s.character);
              setPhase({ ...phase, engine: s });
            }}
          />
        ) : (
          <button
            onClick={() => {
              // Commit the engine's character, then decrement remaining and update cashRollsUsed if needed.
              const c = phase.engine.character;
              const next: Character = {
                ...c,
                cashRollsUsed: phase.current.column === 'cash' ? c.cashRollsUsed + 1 : c.cashRollsUsed,
              };
              onChange(next);
              setRemaining((m) => ({ ...m, [phase.current.careerId]: m[phase.current.careerId]! - 1 }));
              setPhase({ kind: 'plan' });
            }}
            className="px-4 py-2 rounded bg-red-700 text-white text-sm font-medium hover:bg-red-800"
          >
            Apply benefit
          </button>
        )}
      </section>
    );
  }

  const totalRemaining = Object.values(remaining).reduce((a, b) => a + b, 0);
  const pension = computeCharacterPension(character);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Mustering out</h2>

      <div className="rounded border border-gray-200 p-3 text-sm bg-gray-50 space-y-1">
        <div>
          Cash benefit rolls used: <strong>{cashUsed}</strong> / {MAX_CASH_BENEFIT_ROLLS_TOTAL} (global cap).
        </div>
        <div>Pension entitlement: Cr{pension.toLocaleString()} per year.</div>
        <div>Remaining benefit rolls across all careers: <strong>{totalRemaining}</strong>.</div>
        {carriedBenefitDMs.length > 0 ? (
          <div className="text-emerald-700">
            Carried benefit DMs: <strong>{carriedBenefitDMs.map((d) => (d > 0 ? `+${d}` : `${d}`)).join(', ')}</strong>
            {' '}— one is consumed automatically on your next benefit roll.
          </div>
        ) : null}
      </div>

      <ul className="space-y-3">
        {buckets.map((b) => {
          const career = CAREERS[b.careerId];
          const left = remaining[b.careerId] ?? 0;
          return (
            <li key={b.careerId} className="border border-gray-200 rounded p-3">
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold">{career.name}</h3>
                <span className="text-xs text-gray-600">{left} of {b.rolls} remaining</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  disabled={left <= 0 || cashRemainingGlobal <= 0}
                  onClick={() => rollFor(b.careerId, 'cash')}
                  className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-left"
                >
                  <div className="text-sm font-medium">Cash column</div>
                  <div className="text-xs text-gray-500">Roll 1D for credits.</div>
                </button>
                <button
                  disabled={left <= 0}
                  onClick={() => rollFor(b.careerId, 'benefits')}
                  className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-left"
                >
                  <div className="text-sm font-medium">Benefits column</div>
                  <div className="text-xs text-gray-500">Roll 1D for items, ship shares, stat bumps, etc.</div>
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="text-sm text-gray-600">
        Cash on hand: <strong>Cr{character.currentCash.toLocaleString()}</strong>
      </div>

      <button
        disabled={totalRemaining > 0}
        onClick={() => {
          const next: Character = pension > 0 ? { ...character, pension } : character;
          onChange(next);
          onDone();
        }}
        className="px-4 py-2 rounded bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        title={
          totalRemaining > 0
            ? `Spend your remaining ${totalRemaining} benefit roll${totalRemaining === 1 ? '' : 's'} before continuing.`
            : undefined
        }
      >
        Done with mustering out → Skill package
        {totalRemaining > 0 ? <span className="ml-1 text-xs opacity-90">({totalRemaining} roll{totalRemaining === 1 ? '' : 's'} left)</span> : null}
      </button>
    </section>
  );
}

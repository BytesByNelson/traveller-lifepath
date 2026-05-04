import { useState } from 'react';
import type { CareerId, CareerTerm, Character } from '../types';
import { CAREERS } from '../data';
import {
  agingCrisisChars,
  applyBasicTraining,
  availableSkillTables,
  canAttemptCommission,
  commitCareerTerm,
  isAgingDue,
  qualificationDMs,
  roll1d,
  startAdvancement,
  startAging,
  startCommission,
  startEvent,
  startQualification,
  startRankBonus,
  startSkillTableRoll,
  startSurvival,
  termsInCareer,
  type EngineState,
  type SkillTableId,
} from '../engine';
import { PendingPrompt } from '../components/PendingPrompt';
import { ConnectionBonusPicker } from './ConnectionBonusPicker';
import { summarizeEffect } from '../components/effectPreview';
import type { SkillTableRow } from '../types';

/** Working state of a term as it's being resolved. Becomes a CareerTerm at commit. */
type TermCtx = {
  careerId: CareerId;
  assignmentId: string;
  qualified: boolean;
  isOfficer: boolean;
  rankAtEnd: number;
  ejected: boolean;
  mustContinue: boolean; // natural 12 on advancement
  commissionAttempted: boolean;
  advancementAttempted: boolean;
  advancementSuccess: boolean | undefined;
  advancementRolled: number | undefined;
  skillTableRolls: { tableId: SkillTableId; rolled: number }[];
  survivalSuccess: boolean | undefined;
  survivalRolled: number | undefined;
};

const newCtx = (careerId: CareerId, assignmentId: string, qualified: boolean): TermCtx => ({
  careerId,
  assignmentId,
  qualified,
  isOfficer: false,
  rankAtEnd: 0,
  ejected: false,
  mustContinue: false,
  commissionAttempted: false,
  advancementAttempted: false,
  advancementSuccess: undefined,
  advancementRolled: undefined,
  skillTableRolls: [],
  survivalSuccess: undefined,
  survivalRolled: undefined,
});

type Phase =
  | { kind: 'pick_career' }
  | { kind: 'pick_assignment'; careerId: CareerId }
  | { kind: 'qualify'; ctx: TermCtx; engine: EngineState }
  | { kind: 'basic_training'; ctx: TermCtx }
  | { kind: 'pick_skill_table'; ctx: TermCtx; isExtra: boolean }
  | { kind: 'rolling_skill_table'; ctx: TermCtx; engine: EngineState; tableId: SkillTableId; rolled: number; isExtra: boolean }
  | { kind: 'survival'; ctx: TermCtx; engine: EngineState }
  | { kind: 'event'; ctx: TermCtx; engine: EngineState; isConnection: boolean }
  | { kind: 'commission_offer'; ctx: TermCtx }
  | { kind: 'commission_check'; ctx: TermCtx; engine: EngineState }
  | { kind: 'advancement_offer'; ctx: TermCtx }
  | { kind: 'advancement_check'; ctx: TermCtx; engine: EngineState }
  | { kind: 'aging'; ctx: TermCtx; engine: EngineState }
  | { kind: 'aging_crisis'; ctx: TermCtx; affected: import('../types').CharCode[] };

export function CareerTermStep({
  character,
  onChange,
  onBack,
  onTermComplete,
}: {
  character: Character;
  onChange: (c: Character) => void;
  onBack: () => void;
  onTermComplete: (next: Character) => void;
}) {
  const [phase, setPhase] = useState<Phase>(() => {
    const forced = character.wizardState?.forcedNextCareer;
    return forced
      ? { kind: 'pick_assignment', careerId: forced.career as CareerId }
      : { kind: 'pick_career' };
  });

  const termIndex = character.careerHistory.length;
  const careerId = phase.kind === 'pick_assignment' ? phase.careerId : 'ctx' in phase ? phase.ctx.careerId : null;
  const career = careerId ? CAREERS[careerId] : null;

  /** Commit the term and notify the parent. */
  const commit = (c: Character, ctx: TermCtx) => {
    const term: CareerTerm = {
      index: termIndex,
      career: ctx.careerId,
      assignment: ctx.assignmentId,
      qualified: ctx.qualified,
      skillRolls: ctx.skillTableRolls.map((r) => ({
        tableId: r.tableId,
        roll: r.rolled,
        // The actual SkillRef granted has been merged into character.backgroundSkills via the engine;
        // we record the roll itself here for transparency. The "resolved" ref is reconstructed at view time.
        resolved: { name: 'Streetwise' },
      })),
      survival: { rolled: ctx.survivalRolled ?? 0, target: 0, success: ctx.survivalSuccess ?? false },
      rankAtEnd: ctx.rankAtEnd,
      isOfficer: ctx.isOfficer,
      termOutcome: ctx.ejected
        ? 'ejected'
        : ctx.mustContinue
          ? 'forced_to_continue'
          : 'continued',
      ...(ctx.advancementAttempted
        ? {
            advancement: {
              attempted: true,
              success: ctx.advancementSuccess ?? false,
              rolled: ctx.advancementRolled ?? 0,
            },
          }
        : {}),
      ...(ctx.commissionAttempted ? { commission: { attempted: true, success: ctx.isOfficer, rolled: 0 } } : {}),
    };
    onTermComplete(commitCareerTerm(c, term));
  };

  /** Decide what comes after the survival/event/commission/advancement chain. Routes through aging if due. */
  const finishTerm = (c: Character, ctx: TermCtx) => {
    // Aging check: triggers when about to start term 5+. We're committing this term, so terms after = termIndex + 1.
    const wouldBeTerms = termIndex + 1;
    if (wouldBeTerms >= 4) {
      const state = startAging(c, Math.random);
      onChange(state.character);
      setPhase({ kind: 'aging', ctx, engine: state });
    } else {
      commit(c, ctx);
    }
  };

  /** Decide whether to offer commission (military, eligible) or jump to advancement. */
  const proceedToCommissionOrAdvancement = (ctx: TermCtx) => {
    if (career && canAttemptCommission(character, career, termsInCareer(character, ctx.careerId), ctx.isOfficer)) {
      setPhase({ kind: 'commission_offer', ctx });
    } else {
      setPhase({ kind: 'advancement_offer', ctx });
    }
  };

  /* ─────── pick career ─────── */
  if (phase.kind === 'pick_career') {
    const psionicsAvailable =
      character.wizardState?.psionicsEnabled === true ||
      character.wizardState?.psionEligibility === true;
    const visibleCareers = Object.values(CAREERS).filter((c) => {
      if (c.id === 'psion') return psionicsAvailable;
      return true;
    });
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Term {termIndex + 1} — pick a career</h2>
        <ul className="grid grid-cols-2 gap-2">
          {visibleCareers.map((c) => {
            const dms = qualificationDMs(character, c.id);
            const total = dms.reduce((acc, d) => acc + d.value, 0);
            return (
              <li key={c.id}>
                <button
                  disabled={c.flags?.enforcedEntry}
                  onClick={() => setPhase({ kind: 'pick_assignment', careerId: c.id })}
                  className="w-full text-left px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-600">
                    {c.flags?.enforcedEntry
                      ? 'Cannot enter voluntarily'
                      : c.qualification.special === 'automatic'
                        ? 'Automatic qualification'
                        : `Qualify: ${c.qualification.check.char} ${c.qualification.check.target}+ (DM ${total >= 0 ? '+' : ''}${total})`}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        {!psionicsAvailable ? (
          <p className="text-xs text-gray-500 italic">
            Psion career hidden — enable psionics in Basics, or trigger eligibility through a pre-career or unusual life event.
          </p>
        ) : null}
        <button onClick={onBack} className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50">
          Back
        </button>
      </section>
    );
  }

  /* ─────── pick assignment ─────── */
  if (phase.kind === 'pick_assignment') {
    const c = CAREERS[phase.careerId];
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{c.name} — pick assignment</h2>
        <ul className="grid grid-cols-1 gap-2">
          {c.assignments.map((a) => (
            <li key={a.id}>
              <button
                onClick={() => {
                  const { state, auto } = startQualification(character, c.id, Math.random);
                  if (auto) {
                    onChange(state.character);
                    setPhase({ kind: 'basic_training', ctx: newCtx(c.id, a.id, true) });
                  } else {
                    setPhase({ kind: 'qualify', ctx: newCtx(c.id, a.id, false), engine: state });
                  }
                }}
                className="w-full text-left px-3 py-2 rounded border border-gray-300 hover:bg-gray-50"
              >
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-gray-600">{a.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Survival {fmtCheck(a.survival)}, Advancement {fmtCheck(a.advancement)}
                </div>
              </button>
            </li>
          ))}
        </ul>
        <button onClick={() => setPhase({ kind: 'pick_career' })} className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50">
          Back
        </button>
      </section>
    );
  }

  if (!career) return null;

  /* ─────── qualify ─────── */
  if (phase.kind === 'qualify') {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{career.name} — qualification</h2>
        <PendingPrompt
          state={phase.engine}
          onUpdate={(s) => {
            onChange(s.character);
            if (!s.prompt) {
              const lastCheck = s.character.rollLog.filter((r) => r.target !== undefined).at(-1);
              if (lastCheck?.success) {
                setPhase({ kind: 'basic_training', ctx: { ...phase.ctx, qualified: true } });
              } else {
                setPhase({ kind: 'pick_career' });
              }
            } else {
              setPhase({ ...phase, engine: s });
            }
          }}
        />
      </section>
    );
  }

  /* ─────── basic training ─────── */
  if (phase.kind === 'basic_training') {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{career.name} — basic training</h2>
        <p className="text-sm text-gray-600">
          {termsInCareer(character, phase.ctx.careerId) === 0
            ? 'First term in this career: gain all service skills at level 0.'
            : 'Subsequent term: pick one service skill at level 0 (this UI hands all six for now).'}
        </p>
        <button
          onClick={() => {
            const next = applyBasicTraining(character, phase.ctx.careerId, phase.ctx.assignmentId, termIndex);
            onChange(next);
            setPhase({ kind: 'pick_skill_table', ctx: phase.ctx, isExtra: false });
          }}
          className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
        >
          Apply basic training → Skill table
        </button>
      </section>
    );
  }

  /* ─────── pick skill table ─────── */
  if (phase.kind === 'pick_skill_table') {
    const tables = availableSkillTables(character, phase.ctx.careerId, phase.ctx.isOfficer);
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{career.name} — {phase.isExtra ? 'bonus skill (promotion)' : 'skill table'}</h2>
        <p className="text-sm text-gray-600">
          Pick a table; the engine will roll 1D and apply the row that comes up. Each table's rows are listed below so you
          can see what's at stake.
        </p>
        <ul className="grid grid-cols-1 gap-2">
          {tables.map((t) => {
            const rows = lookupTableRows(career, phase.ctx.assignmentId, t.id);
            const locked = !!t.locked;
            return (
              <li key={t.id}>
                <button
                  disabled={locked}
                  onClick={() => {
                    const { state, rolled } = startSkillTableRoll(character, phase.ctx.careerId, phase.ctx.assignmentId, t.id, Math.random);
                    setPhase({
                      kind: 'rolling_skill_table',
                      ctx: phase.ctx,
                      engine: state,
                      tableId: t.id,
                      rolled,
                      isExtra: phase.isExtra,
                    });
                  }}
                  className={`w-full text-left px-3 py-3 rounded border text-sm ${
                    locked
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{t.label}</div>
                  {locked ? (
                    <div className="text-xs text-red-600 mt-0.5">{t.locked}</div>
                  ) : (
                    <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-gray-700">
                      {rows.map((r) => (
                        <li key={r.roll} className="font-mono">
                          <span className="text-gray-500">{r.roll}.</span>{' '}
                          <span className="font-sans">{summarizeEffect(r.effect)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  /* ─────── rolling skill table ─────── */
  if (phase.kind === 'rolling_skill_table') {
    const rolledRow = lookupTableRows(career, phase.ctx.assignmentId, phase.tableId).find(
      (r) => r.roll === phase.rolled,
    );
    const tableLabel = skillTableLabel(phase.tableId);
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{career.name} — {tableLabel}</h2>
        <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm space-y-1">
          <div className="text-xs uppercase tracking-wide text-emerald-700">1D rolled: {phase.rolled}</div>
          <div className="text-emerald-900">
            Result: <span className="font-medium">{rolledRow ? summarizeEffect(rolledRow.effect) : '—'}</span>
          </div>
        </div>
        {phase.engine.prompt ? (
          <>
            <p className="text-xs text-gray-600">This row needs a follow-up choice — resolve it below.</p>
            <PendingPrompt
              state={phase.engine}
              onUpdate={(s) => {
                onChange(s.character);
                setPhase({ ...phase, engine: s });
              }}
            />
          </>
        ) : (
          <button
            onClick={() => {
              const ctx = {
                ...phase.ctx,
                skillTableRolls: [...phase.ctx.skillTableRolls, { tableId: phase.tableId, rolled: phase.rolled }],
              };
              if (phase.isExtra) {
                // Bonus skill roll done — move to aging/commit.
                finishTerm(character, ctx);
              } else {
                // Normal flow → survival.
                const next = startSurvival(character, career, ctx.assignmentId, 0, Math.random);
                setPhase({ kind: 'survival', ctx, engine: next });
              }
            }}
            className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Continue {phase.isExtra ? '→ Term complete' : '→ Survival roll'}
          </button>
        )}
      </section>
    );
  }

  /* ─────── survival ─────── */
  if (phase.kind === 'survival') {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{career.name} — survival</h2>
        <PendingPrompt
          state={phase.engine}
          onUpdate={(s) => {
            onChange(s.character);
            if (!s.prompt) {
              const last = s.character.rollLog.filter((r) => r.target !== undefined).at(-1);
              const ejected = !!s.flags.ejected;
              const ctx = {
                ...phase.ctx,
                survivalSuccess: last?.success,
                survivalRolled: last?.result,
                ejected,
              };
              if (ejected) {
                // Ejected by mishap — skip to commit.
                finishTerm(s.character, ctx);
              } else {
                const next = startEvent(s.character, career, Math.random);
                setPhase({ kind: 'event', ctx, engine: next, isConnection: false });
              }
            } else {
              setPhase({ ...phase, engine: s });
            }
          }}
        />
      </section>
    );
  }

  /* ─────── event ─────── */
  if (phase.kind === 'event') {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{career.name} — event</h2>
        <ConnectionToggle
          character={character}
          checked={phase.isConnection}
          onChange={(v) => setPhase({ ...phase, isConnection: v })}
        />
        {phase.engine.prompt ? (
          <PendingPrompt
            state={phase.engine}
            onUpdate={(s) => {
              onChange(s.character);
              setPhase({ ...phase, engine: s });
            }}
          />
        ) : phase.isConnection && character.connectionsUsed < 2 ? (
          <ConnectionBonusPicker
            character={character}
            onApply={(next) => {
              onChange(next);
              setPhase({ ...phase, isConnection: false });
            }}
            onSkip={() => setPhase({ ...phase, isConnection: false })}
          />
        ) : (
          <button
            onClick={() => proceedToCommissionOrAdvancement(phase.ctx)}
            className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Continue
          </button>
        )}
      </section>
    );
  }

  /* ─────── commission offer ─────── */
  if (phase.kind === 'commission_offer') {
    const com = career.commission!;
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{career.name} — commission?</h2>
        <p className="text-sm text-gray-600">
          Attempt commission ({com.check.char} {com.check.target}+).
          You may not roll for advancement in the same term you gain a commission.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const state = startCommission(character, career, termsInCareer(character, phase.ctx.careerId), Math.random);
              setPhase({ kind: 'commission_check', ctx: { ...phase.ctx, commissionAttempted: true }, engine: state });
            }}
            className="px-4 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            Attempt commission
          </button>
          <button
            onClick={() => setPhase({ kind: 'advancement_offer', ctx: phase.ctx })}
            className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
          >
            Skip
          </button>
        </div>
      </section>
    );
  }

  /* ─────── commission check ─────── */
  if (phase.kind === 'commission_check') {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{career.name} — commission check</h2>
        <PendingPrompt
          state={phase.engine}
          onUpdate={(s) => {
            onChange(s.character);
            if (!s.prompt) {
              const last = s.character.rollLog.filter((r) => r.target !== undefined).at(-1);
              if (last?.success) {
                // Promote to officer rank 1, apply rank bonus.
                const ranked = startRankBonus(s.character, career, phase.ctx.assignmentId, 1, true, Math.random);
                onChange(ranked.character);
                const ctx = { ...phase.ctx, isOfficer: true, rankAtEnd: 1 };
                if (ranked.prompt) {
                  // Rank bonus paused (rare) — display via PendingPrompt then move on.
                  setPhase({ kind: 'rolling_skill_table', ctx, engine: ranked, tableId: 'service_skills', rolled: 0, isExtra: true });
                } else {
                  // Cannot also roll advancement this term → bonus skill roll for the promotion.
                  setPhase({ kind: 'pick_skill_table', ctx, isExtra: true });
                }
              } else {
                setPhase({ kind: 'advancement_offer', ctx: phase.ctx });
              }
            } else {
              setPhase({ ...phase, engine: s });
            }
          }}
        />
      </section>
    );
  }

  /* ─────── advancement offer ─────── */
  if (phase.kind === 'advancement_offer') {
    const adv = career.assignments.find((a) => a.id === phase.ctx.assignmentId)!.advancement;
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{career.name} — advancement?</h2>
        <p className="text-sm text-gray-600">
          Advancement check: {fmtCheck(adv)}. Failing with a roll ≤ terms-in-career means you must leave the career.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const next = startAdvancement(character, career, phase.ctx.assignmentId, 0, Math.random);
              setPhase({ kind: 'advancement_check', ctx: { ...phase.ctx, advancementAttempted: true }, engine: next });
            }}
            className="px-4 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            Roll advancement
          </button>
          <button
            onClick={() => finishTerm(character, phase.ctx)}
            className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
          >
            Skip
          </button>
        </div>
      </section>
    );
  }

  /* ─────── advancement check ─────── */
  if (phase.kind === 'advancement_check') {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{career.name} — advancement check</h2>
        <PendingPrompt
          state={phase.engine}
          onUpdate={(s) => {
            onChange(s.character);
            if (!s.prompt) {
              const last = s.character.rollLog.filter((r) => r.target !== undefined).at(-1);
              const success = !!last?.success;
              const natural = last?.natural;
              const total = last?.result ?? 0;
              const termsHere = termsInCareer(character, phase.ctx.careerId);
              let ctx: TermCtx = {
                ...phase.ctx,
                advancementSuccess: success,
                advancementRolled: total,
                mustContinue: natural === 12,
              };
              if (success) {
                const newRank = ctx.rankAtEnd + 1;
                const ranked = startRankBonus(s.character, career, phase.ctx.assignmentId, newRank, ctx.isOfficer, Math.random);
                onChange(ranked.character);
                ctx = { ...ctx, rankAtEnd: newRank };
                // Bonus skill roll on promotion
                if (ranked.prompt) {
                  setPhase({ kind: 'rolling_skill_table', ctx, engine: ranked, tableId: 'service_skills', rolled: 0, isExtra: true });
                } else {
                  setPhase({ kind: 'pick_skill_table', ctx, isExtra: true });
                }
              } else {
                // Failed advancement: must leave if total ≤ termsHere.
                const mustLeave = total <= termsHere && termsHere > 0;
                finishTerm(s.character, { ...ctx, ejected: ctx.ejected || mustLeave });
              }
            } else {
              setPhase({ ...phase, engine: s });
            }
          }}
        />
      </section>
    );
  }

  /* ─────── aging ─────── */
  if (phase.kind === 'aging') {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Aging</h2>
        <PendingPrompt
          state={phase.engine}
          onUpdate={(s) => {
            onChange(s.character);
            if (!s.prompt) {
              const affected = agingCrisisChars(s.character);
              if (affected.length > 0) {
                setPhase({ kind: 'aging_crisis', ctx: phase.ctx, affected });
              } else {
                commit(s.character, phase.ctx);
              }
            } else {
              setPhase({ ...phase, engine: s });
            }
          }}
        />
      </section>
    );
  }

  /* ─────── aging crisis ─────── */
  if (phase.kind === 'aging_crisis') {
    const affected = phase.affected;
    const pay = () => {
      const rolled = roll1d(Math.random);
      const cost = rolled * 10000;
      const cash = character.currentCash;
      const paid = Math.min(cost, cash);
      const debt = cost - paid;
      let updated: Character = {
        ...character,
        currentCash: cash - paid,
        medicalDebt: (character.medicalDebt ?? 0) + debt,
        rollLog: [
          ...character.rollLog,
          {
            id: crypto.randomUUID(),
            ts: Date.now(),
            context: `Aging crisis — pay 1D × Cr10,000 → ${rolled} = Cr${cost.toLocaleString()}`,
            result: rolled,
            source: 'rng',
          },
        ],
      };
      // Restore each affected characteristic to 1.
      const restored = { ...updated.characteristics };
      for (const code of affected) restored[code] = 1;
      updated = { ...updated, characteristics: restored };
      onChange(updated);
      commit(updated, phase.ctx);
    };

    const die = () => {
      const next: Character = {
        ...character,
        wizardState: {
          ...(character.wizardState ?? { step: 'career_term' }),
          step: 'done',
        },
        deceased: {
          reason: `Aging crisis — refused medical care (${affected.join(', ')} → 0)`,
          termIndex,
        },
      };
      onChange(next);
      onTermComplete(next);
    };

    return (
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-red-700">Aging crisis</h2>
        <div className="rounded border border-red-300 p-3 text-sm bg-red-50 space-y-2">
          <p>
            Aging has reduced <strong>{affected.join(', ')}</strong> to 0. Per the rulebook the Traveller dies unless
            they pay <strong>1D × Cr10,000</strong> for medical care, which restores affected characteristics to 1.
          </p>
          <p className="text-gray-700">
            Cash on hand: <strong>Cr{character.currentCash.toLocaleString()}</strong>. Any shortfall is added to medical debt.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={pay}
            className="px-4 py-2 rounded bg-amber-600 text-white text-sm font-medium hover:bg-amber-700"
          >
            Pay 1D × Cr10,000
          </button>
          <button
            onClick={die}
            className="px-4 py-2 rounded border border-red-400 bg-white text-red-700 text-sm hover:bg-red-50"
          >
            Decline — the Traveller dies
          </button>
        </div>
      </section>
    );
  }

  return null;
}

const fmtCheck = (c: { char: string; target: number }): string => `${c.char} ${c.target}+`;

const skillTableLabel = (id: SkillTableId): string => {
  switch (id) {
    case 'personal_development':
      return 'Personal Development';
    case 'service_skills':
      return 'Service Skills';
    case 'advanced_education':
      return 'Advanced Education';
    case 'officer':
      return 'Officer';
    case 'assignment':
      return 'Assignment Skills';
  }
};

function lookupTableRows(
  career: { skillTables: { id: SkillTableId; rows: SkillTableRow[] }[]; assignments: { id: string; skillTable: SkillTableRow[] }[] },
  assignmentId: string,
  tableId: SkillTableId,
): SkillTableRow[] {
  if (tableId === 'assignment') {
    return career.assignments.find((a) => a.id === assignmentId)?.skillTable ?? [];
  }
  return career.skillTables.find((t) => t.id === tableId)?.rows ?? [];
}

function ConnectionToggle({
  character,
  checked,
  onChange,
}: {
  character: Character;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const used = character.connectionsUsed;
  const disabled = !checked && used >= 2;
  return (
    <label className={`flex items-center gap-2 text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'} cursor-pointer`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span>
        Mark this event as a connection with another Traveller (grants one bonus skill, max 2 — used {used}/2)
      </span>
    </label>
  );
}

void isAgingDue; // imported for symbol-keep; aging trigger uses inline `wouldBeTerms >= 4` to avoid double-counting.

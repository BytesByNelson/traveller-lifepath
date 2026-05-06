import { useCallback, useState } from 'react';
import type { Character, RollLogEntry, SkillName } from '../types';
import { MILITARY_ACADEMY, PRE_CAREER_EVENTS, SKILLS, UNIVERSITY } from '../data';
import { usePhaseUndoReset } from './usePhaseUndoReset';
import {
  startMilitaryAcademyEntry,
  startMilitaryAcademyGraduation,
  startPreCareerEvent,
  startUniversityEntry,
  startUniversityGraduation,
  type EngineState,
} from '../engine';
import { PendingPrompt } from '../components/PendingPrompt';
import { debug } from '../debug';

type Track = 'university' | 'army' | 'marine' | 'navy';

/** University picks made on the skills page, deferred until entry succeeds.
 *  level1Spec carries the specialization when level1 is a parent skill (Profession,
 *  Science, Engineer, Pilot, etc.) — required at level 1+ per Mongoose 2022 p60. */
type PendingUniversitySkills = { level0: SkillName; level1: SkillName; level1Spec?: string };

type Phase =
  | { kind: 'choose' }
  | { kind: 'university_skills'; level0?: SkillName; level1?: SkillName; level1Spec?: string }
  | { kind: 'entry_check'; track: Track; engine: EngineState; pendingUniversitySkills?: PendingUniversitySkills }
  | {
      kind: 'entry_outcome';
      track: Track;
      success: boolean;
      rollEntry: RollLogEntry;
      pendingUniversitySkills?: PendingUniversitySkills;
    }
  | { kind: 'event'; track: Track; engine: EngineState }
  | { kind: 'event_outcome'; track: Track; eventRoll: number }
  | { kind: 'graduation_check'; track: Track; engine: EngineState }
  | {
      kind: 'graduation_outcome';
      track: Track;
      success: boolean;
      honours: boolean;
      rollEntry: RollLogEntry;
      failsafeAuto: boolean;
    }
  | { kind: 'done'; track: Track; success: boolean; honours: boolean };

export function PreCareerEducationStep({
  character,
  onChange,
  onSkip,
  onComplete,
}: {
  character: Character;
  onChange: (c: Character) => void;
  onSkip: () => void;
  onComplete: () => void;
}) {
  const [phase, _setPhase] = useState<Phase>({ kind: 'choose' });
  const setPhase = (p: Phase) => {
    debug('wizard:precareer', 'phase →', p.kind, p);
    _setPhase(p);
  };
  // If undo pops the character back, walk the phase back to the chooser so the
  // screen stays consistent with the now-restored character state.
  const resetToChoose = useCallback(() => _setPhase({ kind: 'choose' }), []);
  usePhaseUndoReset(character, resetToChoose);
  const termIndex = character.careerHistory.length;

  if (phase.kind === 'choose') {
    const edu = character.characteristics.EDU;
    const end = character.characteristics.END;
    const intStat = character.characteristics.INT;
    const uniReq = UNIVERSITY.entry.check.target;
    const armyReq = MILITARY_ACADEMY.entry.army.check.target;
    const marineReq = MILITARY_ACADEMY.entry.marine.check.target;
    const navyReq = MILITARY_ACADEMY.entry.navy.check.target;

    const uniBlocked = edu < uniReq;
    const armyBlocked = end < armyReq;
    const marineBlocked = end < marineReq;
    const navyBlocked = intStat < navyReq;

    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Pre-career education</h2>
        <p className="text-sm text-gray-600">
          Optional. Available for terms 1–3. Skip to go straight to your first career.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <TrackButton
            title="University"
            subtitle={`Entry: EDU ${uniReq}+ — you have EDU ${edu}`}
            disabled={uniBlocked}
            disabledReason={uniBlocked ? `Requires EDU ${uniReq}+` : undefined}
            onClick={() => setPhase({ kind: 'university_skills' })}
          />
          <TrackButton
            title="Army Academy"
            subtitle={`Entry: END ${armyReq}+ — you have END ${end}`}
            disabled={armyBlocked}
            disabledReason={armyBlocked ? `Requires END ${armyReq}+` : undefined}
            onClick={() => {
              const state = startMilitaryAcademyEntry(character, 'army', termIndex, Math.random);
              setPhase({ kind: 'entry_check', track: 'army', engine: state });
            }}
          />
          <TrackButton
            title="Marine Academy"
            subtitle={`Entry: END ${marineReq}+ — you have END ${end}`}
            disabled={marineBlocked}
            disabledReason={marineBlocked ? `Requires END ${marineReq}+` : undefined}
            onClick={() => {
              const state = startMilitaryAcademyEntry(character, 'marine', termIndex, Math.random);
              setPhase({ kind: 'entry_check', track: 'marine', engine: state });
            }}
          />
          <TrackButton
            title="Navy Academy"
            subtitle={`Entry: INT ${navyReq}+ — you have INT ${intStat}`}
            disabled={navyBlocked}
            disabledReason={navyBlocked ? `Requires INT ${navyReq}+` : undefined}
            onClick={() => {
              const state = startMilitaryAcademyEntry(character, 'navy', termIndex, Math.random);
              setPhase({ kind: 'entry_check', track: 'navy', engine: state });
            }}
          />
        </div>
        {uniBlocked || armyBlocked || marineBlocked || navyBlocked ? (
          <p className="text-xs text-gray-500 italic">
            Greyed-out tracks are <strong>hard requirements</strong> per Mongoose 2022 — your stat
            is below the minimum and the academy won't accept the application. The entry roll
            applies on top of the stat gate (you must qualify <em>and</em> succeed at the roll).
          </p>
        ) : null}
        {uniBlocked && armyBlocked && marineBlocked && navyBlocked ? (
          <p className="text-xs text-gray-500 italic">
            None of the academies will accept this Traveller — proceed straight to a career.
          </p>
        ) : null}
        <button onClick={onSkip} className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50">
          Skip pre-career education
        </button>
      </section>
    );
  }

  if (phase.kind === 'university_skills') {
    const level1Def = phase.level1 ? SKILLS[phase.level1] : undefined;
    const level1NeedsSpec = !!level1Def && level1Def.specs.length > 0;
    const level1SpecMissing = level1NeedsSpec && !phase.level1Spec;
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">University — pick skills</h2>
        <p className="text-sm text-gray-600">
          Choose one skill at level 0 and one at level 1 from the university list. Both are bumped on graduation.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Picker
            label="Level 0 skill"
            value={phase.level0}
            options={UNIVERSITY.skillPickList}
            onChange={(v) => setPhase({ ...phase, level0: v })}
          />
          <Picker
            label="Level 1 skill"
            value={phase.level1}
            options={UNIVERSITY.skillPickList}
            onChange={(v) => setPhase({ ...phase, level1: v, level1Spec: undefined })}
          />
        </div>

        {level1NeedsSpec && level1Def ? (
          <div>
            <label className="block">
              <span className="text-xs text-gray-600">
                Pick a specialization for {phase.level1} — required at level 1 per Mongoose 2022 p60.
              </span>
              <select
                value={phase.level1Spec ?? ''}
                onChange={(e) => setPhase({ ...phase, level1Spec: e.target.value || undefined })}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="" disabled>
                  Pick a specialization
                </option>
                {level1Def.specs.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        <button
          disabled={
            !phase.level0 ||
            !phase.level1 ||
            phase.level0 === phase.level1 ||
            level1SpecMissing
          }
          onClick={() => {
            // Skills + the "education taken" flag are NOT applied yet — only on entry success.
            // If the player fails the entry roll, no skills should land on the sheet and
            // no academy term should count toward their age. Carry the picks through the
            // entry phase via phase state.
            const state = startUniversityEntry(character, termIndex, Math.random);
            setPhase({
              kind: 'entry_check',
              track: 'university',
              engine: state,
              pendingUniversitySkills: {
                level0: phase.level0!,
                level1: phase.level1!,
                ...(phase.level1Spec ? { level1Spec: phase.level1Spec } : {}),
              },
            });
          }}
          className="px-4 py-2 rounded bg-red-700 text-white text-sm font-medium hover:bg-red-800 disabled:opacity-50"
        >
          Continue → Entry roll
        </button>
      </section>
    );
  }

  if (phase.kind === 'entry_check') {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{trackLabel(phase.track)} — entry</h2>
        <PendingPrompt
          state={phase.engine}
          onUpdate={(s) => {
            onChange(s.character);
            if (!s.prompt) {
              const last = lastTargetedRoll(s.character);
              if (last) {
                setPhase({
                  kind: 'entry_outcome',
                  track: phase.track,
                  success: !!last.success,
                  rollEntry: last,
                  ...(phase.pendingUniversitySkills
                    ? { pendingUniversitySkills: phase.pendingUniversitySkills }
                    : {}),
                });
              }
            } else {
              setPhase({ ...phase, engine: s });
            }
          }}
        />
      </section>
    );
  }

  if (phase.kind === 'entry_outcome') {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{trackLabel(phase.track)} — entry result</h2>
        <RollResultCard entry={phase.rollEntry} success={phase.success} />
        {phase.success ? (
          <>
            <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              <p className="font-medium">You're in!</p>
              <p className="mt-1">{entrySuccessSummary(phase.track)}</p>
              {phase.pendingUniversitySkills ? (
                <p className="mt-1">
                  Granted: <strong>{phase.pendingUniversitySkills.level0}</strong> at level 0,{' '}
                  <strong>
                    {phase.pendingUniversitySkills.level1}
                    {phase.pendingUniversitySkills.level1Spec
                      ? ` (${phase.pendingUniversitySkills.level1Spec})`
                      : ''}
                  </strong>{' '}
                  at level 1.
                </p>
              ) : null}
            </div>
            <button
              onClick={() => {
                // Now that entry succeeded: apply the deferred university skill grant
                // and mark the academy term as taken (only successful enrollment counts
                // toward age + sheet skills per Mongoose 2022 p16).
                let next = character;
                if (phase.pendingUniversitySkills) {
                  next = grantSkillsForUniversity(
                    next,
                    phase.pendingUniversitySkills.level0,
                    phase.pendingUniversitySkills.level1,
                    phase.pendingUniversitySkills.level1Spec,
                  );
                }
                next = markPreCareerEducationTaken(next);
                onChange(next);

                const event = startPreCareerEvent(next, Math.random);
                onChange(event.character);
                // If the event drained immediately (no follow-up prompts), skip the
                // intermediate "blank Continue" page and go straight to the result.
                if (!event.prompt) {
                  const eventRoll = lastEventRoll(event.character) ?? 0;
                  setPhase({ kind: 'event_outcome', track: phase.track, eventRoll });
                } else {
                  setPhase({ kind: 'event', track: phase.track, engine: event });
                }
              }}
              className="px-4 py-2 rounded bg-red-700 text-white text-sm font-medium hover:bg-red-800"
            >
              Continue → Pre-career event
            </button>
          </>
        ) : (
          <>
            <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <p className="font-medium">Application denied.</p>
              <p className="mt-1">
                You were not accepted into {trackLabel(phase.track)}. You can try a different track or skip pre-career
                education and start a career.
              </p>
            </div>
            <button
              onClick={() => setPhase({ kind: 'choose' })}
              className="px-4 py-2 rounded bg-red-700 text-white text-sm font-medium hover:bg-red-800"
            >
              Back to track selection
            </button>
          </>
        )}
      </section>
    );
  }

  if (phase.kind === 'event') {
    const eventRoll = lastEventRoll(character);
    const eventRow =
      eventRoll !== undefined ? PRE_CAREER_EVENTS.find((r) => r.roll === eventRoll) : undefined;
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Pre-career event</h2>
        {eventRow ? (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm space-y-1">
            <div className="text-xs uppercase tracking-wide text-red-800">Event roll: {eventRoll}</div>
            <p className="text-gray-800">{eventRow.text}</p>
          </div>
        ) : null}
        <PendingPrompt
          state={phase.engine}
          onUpdate={(s) => {
            onChange(s.character);
            if (!s.prompt) {
              // Final prompt resolved — the engine has drained. Skip the blank
              // intermediate page and go straight to the event result.
              const finishedRoll = lastEventRoll(s.character) ?? 0;
              setPhase({ kind: 'event_outcome', track: phase.track, eventRoll: finishedRoll });
            } else {
              setPhase({ ...phase, engine: s });
            }
          }}
        />
      </section>
    );
  }

  if (phase.kind === 'event_outcome') {
    const row = PRE_CAREER_EVENTS.find((r) => r.roll === phase.eventRoll);
    const subRolls = character.rollLog.filter((r) =>
      r.context.startsWith(`Pre-career event → ${phase.eventRoll} /`),
    );
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Pre-career event — result</h2>
        <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm space-y-2">
          <div className="text-xs uppercase tracking-wide text-gray-500">Event roll: {phase.eventRoll}</div>
          {row ? (
            <p className="text-gray-800">{row.text}</p>
          ) : (
            <p className="text-gray-700 italic">No event matched this roll.</p>
          )}
          {subRolls.length > 0 ? (
            <div className="rounded border border-gray-200 bg-white px-2 py-1.5 text-xs space-y-0.5">
              <div className="text-[10px] uppercase tracking-wide text-gray-500">Checks during this event</div>
              {subRolls.map((r) => {
                const label = r.context.split(' / ').slice(1).join(' / ');
                return (
                  <div key={r.id} className="flex justify-between">
                    <span className="text-gray-700">{label}</span>
                    <span className={r.success ? 'text-emerald-700' : 'text-rose-700'}>
                      rolled {r.result} vs {r.target}+ —{' '}
                      <span className="font-medium uppercase">{r.success ? 'pass' : 'fail'}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}
          <p className="text-xs text-gray-600">
            Any effects from this event have already been applied above and recorded on your sheet.
          </p>
        </div>
        <button
          onClick={() => {
            // Pre-career event 3 ("Deep tragedy") sets a flag that forces graduation to fail.
            if (character.wizardState?.forceFailPreCareerGraduation) {
              const cleared: Character = {
                ...character,
                wizardState: { ...character.wizardState, forceFailPreCareerGraduation: false },
              };
              onChange(cleared);
              const honourThreshold =
                phase.track === 'university'
                  ? UNIVERSITY.graduationHonoursAtLeast
                  : MILITARY_ACADEMY.graduationHonoursAtLeast;
              setPhase({
                kind: 'graduation_outcome',
                track: phase.track,
                success: false,
                honours: false,
                rollEntry: {
                  id: crypto.randomUUID(),
                  ts: Date.now(),
                  context: phase.track === 'university' ? 'University graduation (forced fail — Deep tragedy)' : 'Military Academy graduation (forced fail — Deep tragedy)',
                  target: phase.track === 'university'
                    ? UNIVERSITY.graduation.check.target
                    : MILITARY_ACADEMY.graduation.check.target,
                  result: 0,
                  natural: 0,
                  success: false,
                  source: 'manual',
                },
                // result 0 < failsafeAutoEntryFloor (3) ⇒ no auto-entry; ensures honourThreshold doesn't trip.
                failsafeAuto: 0 >= MILITARY_ACADEMY.failsafeAutoEntryFloor && phase.track !== 'university',
              });
              void honourThreshold;
              return;
            }
            const grad =
              phase.track === 'university'
                ? startUniversityGraduation(character, Math.random)
                : startMilitaryAcademyGraduation(character, Math.random);
            setPhase({ kind: 'graduation_check', track: phase.track, engine: grad });
          }}
          className="px-4 py-2 rounded bg-red-700 text-white text-sm font-medium hover:bg-red-800"
        >
          Continue → Graduation roll
        </button>
      </section>
    );
  }

  if (phase.kind === 'graduation_check') {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{trackLabel(phase.track)} — graduation</h2>
        <PendingPrompt
          state={phase.engine}
          onUpdate={(s) => {
            onChange(s.character);
            if (!s.prompt) {
              const last = lastTargetedRoll(s.character);
              if (!last) return;
              const success = !!last.success;
              const honourThreshold =
                phase.track === 'university'
                  ? UNIVERSITY.graduationHonoursAtLeast
                  : MILITARY_ACADEMY.graduationHonoursAtLeast;
              const honours = (last.result ?? 0) >= honourThreshold;
              const failsafeAuto =
                !success &&
                phase.track !== 'university' &&
                (last.result ?? 0) >= MILITARY_ACADEMY.failsafeAutoEntryFloor;
              setPhase({
                kind: 'graduation_outcome',
                track: phase.track,
                success,
                honours,
                rollEntry: last,
                failsafeAuto,
              });
            } else {
              setPhase({ ...phase, engine: s });
            }
          }}
        />
      </section>
    );
  }

  if (phase.kind === 'graduation_outcome') {
    const benefits = describeGraduationBenefits(phase.track, phase.success, phase.honours, phase.failsafeAuto);
    const tone = phase.success
      ? phase.honours
        ? 'border-amber-300 bg-amber-50 text-amber-900'
        : 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : phase.failsafeAuto
        ? 'border-blue-200 bg-blue-50 text-blue-900'
        : 'border-rose-200 bg-rose-50 text-rose-900';
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{trackLabel(phase.track)} — graduation result</h2>
        <RollResultCard entry={phase.rollEntry} success={phase.success} />
        <div className={`rounded border px-3 py-2 text-sm space-y-2 ${tone}`}>
          <p className="font-medium">{benefits.headline}</p>
          {benefits.lines.length > 0 ? (
            <ul className="list-disc pl-5 space-y-0.5">
              {benefits.lines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : null}
          {benefits.followup ? <p className="mt-1">{benefits.followup}</p> : null}
        </div>
        <button
          onClick={() => {
            const next = applyGraduationBenefits(character, phase.track, phase.success, phase.honours);
            onChange(next);
            setPhase({ kind: 'done', track: phase.track, success: phase.success, honours: phase.honours });
          }}
          className="px-4 py-2 rounded bg-red-700 text-white text-sm font-medium hover:bg-red-800"
        >
          Continue → Career term
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Pre-career education complete</h2>
      <button
        onClick={onComplete}
        className="px-4 py-2 rounded bg-red-700 text-white text-sm font-medium hover:bg-red-800"
      >
        Continue → Career term
      </button>
    </section>
  );
}

/** Renders a Continue button after the event resolves silently — passes the rolled total upward. */
function RollResultCard({ entry, success }: { entry: RollLogEntry; success: boolean }) {
  const target = entry.target ?? 0;
  const result = entry.result;
  const natural = entry.natural ?? result;
  const dms = entry.dms ?? [];
  const dmTotal = dms.reduce((acc, d) => acc + d.value, 0);
  return (
    <div
      className={`rounded border px-3 py-2 text-sm ${
        success ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'
      }`}
    >
      <div className="flex items-baseline justify-between">
        <div>
          <span className="font-semibold">Rolled {result}</span>
          {dmTotal !== 0 ? (
            <span className="text-gray-600">
              {' '}
              ({natural} natural{dmTotal > 0 ? ` + ${dmTotal}` : ` − ${Math.abs(dmTotal)}`} DM)
            </span>
          ) : null}
          <span className="text-gray-600"> vs target {target}+</span>
        </div>
        <span className={`text-xs font-semibold uppercase ${success ? 'text-emerald-700' : 'text-rose-700'}`}>
          {success ? 'Success' : 'Failure'}
        </span>
      </div>
    </div>
  );
}

function TrackButton({
  title,
  subtitle,
  onClick,
  disabled = false,
  disabledReason,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  if (disabled) {
    return (
      <div
        className="px-3 py-2 rounded border border-gray-200 bg-gray-50 text-left opacity-60 cursor-not-allowed"
        title={disabledReason}
        aria-label={`${title} (disabled — ${disabledReason ?? 'requirement not met'})`}
      >
        <div className="font-medium text-gray-500">{title}</div>
        <div className="text-xs text-gray-500">{subtitle}</div>
        {disabledReason ? <div className="text-xs text-red-600 mt-0.5">{disabledReason}</div> : null}
      </div>
    );
  }
  return _TrackButtonEnabled({ title, subtitle, onClick });
}

function _TrackButtonEnabled({ title, subtitle, onClick }: { title: string; subtitle: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 text-left">
      <div className="font-medium">{title}</div>
      <div className="text-xs text-gray-600">{subtitle}</div>
    </button>
  );
}

function Picker({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: SkillName | undefined;
  options: readonly SkillName[];
  onChange: (v: SkillName) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-gray-600">{label}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value as SkillName)}
        className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded text-sm"
      >
        <option value="" disabled>
          Pick a skill
        </option>
        {options.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}

const trackLabel = (track: Track): string =>
  track === 'university' ? 'University' : `${track[0]!.toUpperCase()}${track.slice(1)} Academy`;

const tiedCareerName = (track: Track): string =>
  track === 'army' ? 'Army' : track === 'marine' ? 'Marine' : track === 'navy' ? 'Navy' : '';

const lastTargetedRoll = (c: Character): RollLogEntry | undefined =>
  c.rollLog.filter((r) => r.target !== undefined).at(-1);

const lastEventRoll = (c: Character): number | undefined => {
  // Match only the original 2D event roll, not sub-rolls that nest inside an event
  // (those carry the same context prefix because the engine joins the context stack).
  for (let i = c.rollLog.length - 1; i >= 0; i--) {
    const m = c.rollLog[i]!.context.match(/^Pre-career event → (\d+)$/);
    if (m) return Number(m[1]);
  }
  return undefined;
};

function entrySuccessSummary(track: Track): string {
  if (track === 'university') {
    return 'You start university. Next, roll on the pre-career events table to see what happens during your studies, then attempt the graduation check.';
  }
  return `You're admitted to the ${trackLabel(track)}. Next, roll on the pre-career events table for life during your training, then attempt the graduation check.`;
}

function describeGraduationBenefits(
  track: Track,
  success: boolean,
  honours: boolean,
  failsafeAuto: boolean,
): { headline: string; lines: string[]; followup?: string } {
  if (track === 'university') {
    if (!success) {
      return {
        headline: 'Did not graduate.',
        lines: [],
        followup: 'No university benefits. Continue to your first career.',
      };
    }
    const lines = [
      'EDU +1',
      'Both skills you chose on entry bumped by +1',
      `+${honours ? UNIVERSITY.graduationCareerBonusDMHonours : UNIVERSITY.graduationCareerBonusDM} DM to qualify for: Agent, Army, Marine, Navy, Scholar, Scout, Citizen (corporate), Entertainer (journalist)`,
      honours
        ? 'Automatic commission on first term of any military career'
        : `+${UNIVERSITY.commissionDM} DM on commission roll for first term of any military career`,
    ];
    return {
      headline: honours ? 'Graduated with honours!' : 'Graduated!',
      lines,
      followup: 'These bonuses kick in when you start your career.',
    };
  }
  // Military Academy
  const career = tiedCareerName(track);
  if (success) {
    const lines = ['EDU +1'];
    if (honours) lines.push('SOC +1');
    lines.push(`Auto-entry to ${career} career (no qualification roll needed)`);
    lines.push(
      honours
        ? `Automatic commission on first term of ${career}`
        : `+${MILITARY_ACADEMY.graduationBenefits.commissionDM} DM on commission roll for first term of ${career}`,
    );
    return {
      headline: honours ? `Graduated ${trackLabel(track)} with honours!` : `Graduated ${trackLabel(track)}!`,
      lines,
      followup: `Your next career will be ${career}.`,
    };
  }
  if (failsafeAuto) {
    return {
      headline: 'Did not graduate, but were not expelled.',
      lines: [
        `You drop out of the academy and enlist directly into ${career}`,
        'No commission bonus on your first term',
      ],
      followup: `Per the rulebook, dropping out (rolling ≥ 3 on graduation) still routes you into the tied service. Your next career will be ${career}.`,
    };
  }
  return {
    headline: 'Failed graduation.',
    lines: [],
    followup: 'No academy benefits. Continue to a career of your choice.',
  };
}

function markPreCareerEducationTaken(c: Character): Character {
  if (c.wizardState?.preCareerEducationTaken) return c;
  return {
    ...c,
    wizardState: {
      ...(c.wizardState ?? { step: 'pre_career_education' }),
      preCareerEducationTaken: true,
    },
  };
}

function grantSkillsForUniversity(
  c: Character,
  level0: SkillName,
  level1: SkillName,
  level1Spec?: string,
): Character {
  const list = [...c.backgroundSkills];
  // Level 0: parent skill at no-spec is RAW-valid ("all specs at 0"), so we never
  // attach a spec here even if level0 names a parent.
  const idx0 = list.findIndex((s) => s.name === level0 && !s.spec);
  if (idx0 === -1) {
    list.push({ name: level0, level: 0, source: { kind: 'pre_career_education', institution: 'university' } });
  } // (level 0 is the floor; no upgrade path needed)

  // Level 1: parent skills MUST carry a spec per Mongoose 2022 p60. The picker
  // enforces this; if level1Spec is missing we still defensively skip writing
  // an invalid no-spec parent at level 1.
  const def = SKILLS[level1];
  const needsSpec = !!def && def.specs.length > 0;
  if (needsSpec && !level1Spec) return { ...c, backgroundSkills: list };
  const spec = needsSpec ? level1Spec : undefined;
  const idx1 = list.findIndex((s) => s.name === level1 && (s.spec ?? '') === (spec ?? ''));
  if (idx1 === -1) {
    list.push({
      name: level1,
      ...(spec ? { spec } : {}),
      level: 1,
      source: { kind: 'pre_career_education', institution: 'university' },
    });
  } else if (1 > list[idx1]!.level) {
    list[idx1] = { ...list[idx1]!, level: 1 };
  }
  return { ...c, backgroundSkills: list };
}

function applyGraduationBenefits(
  c: Character,
  track: Track,
  graduated: boolean,
  honours: boolean,
): Character {
  let next = c;
  const wizardState = next.wizardState ?? { step: 'pre_career_education' };
  if (track === 'university') {
    if (graduated) {
      // EDU +1, +1 to each chosen skill (we apply the +1 to whichever level0/level1 entries were marked university)
      next = { ...next, characteristics: { ...next.characteristics, EDU: next.characteristics.EDU + 1 } };
      next = {
        ...next,
        backgroundSkills: next.backgroundSkills.map((s) =>
          s.source.kind === 'pre_career_education' && s.source.institution === 'university'
            ? { ...s, level: s.level + 1 }
            : s,
        ),
      };
      next = {
        ...next,
        wizardState: {
          ...wizardState,
          preCareerBonus: {
            qualifyDM: {
              dm: honours ? UNIVERSITY.graduationCareerBonusDMHonours : UNIVERSITY.graduationCareerBonusDM,
              careers: [...UNIVERSITY.bonusCareers],
              assignmentSpecific: UNIVERSITY.bonusAssignmentSpecific.map((x) => ({ ...x })),
            },
            commission: { dm: UNIVERSITY.commissionDM, auto: honours },
          },
        },
      };
    }
  } else {
    const branch = track;
    if (graduated) {
      next = { ...next, characteristics: { ...next.characteristics, EDU: next.characteristics.EDU + 1 } };
      if (honours) {
        next = { ...next, characteristics: { ...next.characteristics, SOC: next.characteristics.SOC + 1 } };
      }
      next = {
        ...next,
        wizardState: {
          ...wizardState,
          preCareerBonus: {
            qualifyDM: { dm: 0, careers: [] },
            commission: { dm: MILITARY_ACADEMY.graduationBenefits.commissionDM, auto: honours, tiedTo: branch },
            autoEntry: { career: branch, commissionAllowed: true },
          },
        },
      };
    } else {
      // Non-fatal failure: still allows auto-entry to the tied military career (no commission).
      const last = next.rollLog.filter((r) => r.target !== undefined).at(-1);
      if ((last?.result ?? 0) >= MILITARY_ACADEMY.failsafeAutoEntryFloor) {
        next = {
          ...next,
          wizardState: {
            ...wizardState,
            preCareerBonus: {
              qualifyDM: { dm: 0, careers: [] },
              autoEntry: { career: branch, commissionAllowed: false },
            },
          },
        };
      }
    }
  }
  return next;
}

import type { Character, SkillName } from '../../types';
import { SKILLS } from '../../data';
import { SheetPanel } from './SheetPanel';
import { EditableNumber } from '../editable/EditableNumber';

export function TrainingBox({
  character,
  onChange,
}: {
  character: Character;
  onChange?: (next: Character) => void;
}) {
  const sp = character.studyPeriods[0];
  const editable = !!onChange;

  const update = (patch: Partial<NonNullable<typeof sp>>) => {
    if (!onChange) return;
    const current = character.studyPeriods[0] ?? {
      skill: { name: 'Admin' as SkillName },
      targetLevel: 1,
      weeksAccumulated: 0,
      successfulPeriods: 0,
    };
    const next = { ...current, ...patch };
    onChange({ ...character, studyPeriods: [next, ...character.studyPeriods.slice(1)] });
  };

  return (
    <SheetPanel title="Training">
      <dl className="text-xs space-y-0.5">
        <Row label="Skill">
          {editable ? (
            <select
              value={sp?.skill.name ?? 'Admin'}
              onChange={(e) =>
                update({ skill: { name: e.target.value as SkillName } })
              }
              className="text-xs bg-transparent border-0 hover:bg-yellow-50"
              aria-label="Training skill"
            >
              {(Object.keys(SKILLS) as SkillName[]).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          ) : sp ? (
            <>
              {sp.skill.name}
              {sp.skill.spec ? ` (${sp.skill.spec})` : ''}
              {' → '}
              {sp.targetLevel}
            </>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </Row>
        <Row label="Target level">
          {editable ? (
            <EditableNumber
              value={sp?.targetLevel ?? 1}
              onChange={(v) => update({ targetLevel: v })}
              min={1}
              max={9}
              ariaLabel="Target level"
            />
          ) : sp ? (
            sp.targetLevel
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </Row>
        <Row label="Completed weeks">
          {editable ? (
            <EditableNumber
              value={sp?.weeksAccumulated ?? 0}
              onChange={(v) => update({ weeksAccumulated: v })}
              min={0}
              ariaLabel="Completed weeks"
            />
          ) : sp ? (
            sp.weeksAccumulated
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </Row>
        <Row label="Completed periods">
          {editable ? (
            <EditableNumber
              value={sp?.successfulPeriods ?? 0}
              onChange={(v) => update({ successfulPeriods: v })}
              min={0}
              ariaLabel="Completed study periods"
            />
          ) : sp ? (
            sp.successfulPeriods
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </Row>
      </dl>
    </SheetPanel>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] items-baseline gap-2">
      <dt className="text-[10px] uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="border-b border-dotted border-gray-300">{children}</dd>
    </div>
  );
}

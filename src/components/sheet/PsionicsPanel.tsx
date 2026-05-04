import type { Character, PsionicPower, PsionicTalentId } from '../../types';
import { TALENT_NAMES, PSIONIC_RANGE_LABELS, DIFFICULTY_TARGETS } from '../../types';
import { POWERS_BY_TALENT } from '../../data';
import { SheetPanel } from './SheetPanel';
import { EditableNumber } from '../editable/EditableNumber';

const TALENT_SKILL_NAMES: Record<PsionicTalentId, string> = {
  telepathy: 'Telepathy',
  clairvoyance: 'Clairvoyance',
  telekinesis: 'Telekinesis',
  awareness: 'Awareness',
  teleportation: 'Teleportation',
};

/**
 * Renders the PSI tracker plus a list of learned talents and their powers.
 * Shown only when the Traveller has psi defined (i.e. has been tested).
 */
export function PsionicsPanel({
  character,
  onChange,
}: {
  character: Character;
  onChange?: (next: Character) => void;
}) {
  if (!character.psi) return null;

  const editable = !!onChange;
  const psi = character.psi;
  const powersKnown = new Set(character.psionicPowersKnown ?? []);

  const learnedTalents: PsionicTalentId[] = (Object.keys(TALENT_NAMES) as PsionicTalentId[]).filter((t) =>
    character.backgroundSkills.some((s) => s.name === TALENT_SKILL_NAMES[t] && !s.spec),
  );

  const setMax = (v: number) => onChange?.({ ...character, psi: { ...psi, max: v, current: Math.min(psi.current, v) } });
  const setCurrent = (v: number) => onChange?.({ ...character, psi: { ...psi, current: Math.max(0, Math.min(v, psi.max)) } });
  const togglePower = (id: string) => {
    if (!onChange) return;
    const next = new Set(powersKnown);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ ...character, psionicPowersKnown: Array.from(next) });
  };

  return (
    <SheetPanel title="Psionics">
      <div className="text-xs space-y-3">
        {/* PSI tracker */}
        <div className="grid grid-cols-2 gap-2 items-baseline">
          <div>
            <span className="text-[10px] uppercase tracking-wide text-gray-500 mr-1">Current PSI</span>
            {editable ? (
              <EditableNumber
                value={psi.current}
                onChange={setCurrent}
                min={0}
                max={psi.max}
                ariaLabel="Current PSI"
              />
            ) : (
              <span className="font-mono">{psi.current}</span>
            )}
            <span className="text-gray-400">{` / `}</span>
            {editable ? (
              <EditableNumber value={psi.max} onChange={setMax} min={0} max={20} ariaLabel="Max PSI" />
            ) : (
              <span className="font-mono">{psi.max}</span>
            )}
          </div>
          {editable ? (
            <div className="flex gap-1 justify-end">
              <button
                onClick={() => setCurrent(psi.current - 1)}
                disabled={psi.current <= 0}
                className="px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
                aria-label="Spend 1 PSI"
              >
                −1
              </button>
              <button
                onClick={() => setCurrent(psi.current + 1)}
                disabled={psi.current >= psi.max}
                className="px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
                aria-label="Recover 1 PSI"
              >
                +1
              </button>
              <button
                onClick={() => setCurrent(psi.max)}
                className="px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-50"
                aria-label="Refresh PSI"
              >
                Refresh
              </button>
            </div>
          ) : null}
        </div>

        {/* Learned talents and their powers */}
        {learnedTalents.length === 0 ? (
          <p className="text-gray-500 italic">No talents learned. Visit a Psionic Institute to begin training.</p>
        ) : (
          <div className="space-y-3">
            {learnedTalents.map((talent) => (
              <TalentBlock
                key={talent}
                talent={talent}
                powersKnown={powersKnown}
                editable={editable}
                onToggle={togglePower}
              />
            ))}
          </div>
        )}
      </div>
    </SheetPanel>
  );
}

function TalentBlock({
  talent,
  powersKnown,
  editable,
  onToggle,
}: {
  talent: PsionicTalentId;
  powersKnown: Set<string>;
  editable: boolean;
  onToggle: (id: string) => void;
}) {
  const powers = POWERS_BY_TALENT[talent];
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-700">
        {TALENT_NAMES[talent]}
      </h4>
      <ul className="mt-1 space-y-1">
        {powers.map((p) => (
          <li
            key={p.id}
            className={`flex items-baseline gap-2 ${powersKnown.has(p.id) ? '' : 'opacity-50'}`}
          >
            {editable ? (
              <input
                type="checkbox"
                checked={powersKnown.has(p.id)}
                onChange={() => onToggle(p.id)}
                aria-label={`Know ${p.name}`}
                className="mt-0.5"
              />
            ) : null}
            <PowerSummary power={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PowerSummary({ power }: { power: PsionicPower }) {
  return (
    <div className="text-[11px]">
      <div className="font-medium text-gray-900">
        {power.name}{' '}
        <span className="font-normal text-gray-500">
          · {DIFFICULTY_LABEL[power.difficulty]} ({DIFFICULTY_TARGETS[power.difficulty]}+) ·{' '}
          {PSIONIC_RANGE_LABELS[power.range]} · {power.psiCost} PSI
          {power.damage ? ` · damage ${power.damage}` : ''}
        </span>
      </div>
      <div className="text-gray-700">{power.description}</div>
    </div>
  );
}

const DIFFICULTY_LABEL: Record<keyof typeof DIFFICULTY_TARGETS, string> = {
  simple: 'Simple',
  easy: 'Easy',
  routine: 'Routine',
  average: 'Average',
  difficult: 'Difficult',
  very_difficult: 'Very Difficult',
  formidable: 'Formidable',
  impossible: 'Impossible',
};

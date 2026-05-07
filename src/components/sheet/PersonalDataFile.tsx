import type { Character, SpeciesId } from '../../types';
import { SPECIES } from '../../data';
import { SheetPanel } from './SheetPanel';
import { getAge } from '../../engine';
import { EditableText } from '../editable/EditableText';

type Props = {
  character: Character;
  onChange?: (next: Character) => void;
  distinguishingFeatures?: string;
  onChangeDistinguishingFeatures?: (next: string) => void;
};

export function PersonalDataFile({ character, onChange }: Props) {
  const editable = !!onChange;
  const traits = SPECIES[character.species].traits.map((t) => t.name).join(', ');

  const set = <K extends keyof Character>(key: K, value: Character[K]) => {
    onChange?.({ ...character, [key]: value });
  };

  return (
    <SheetPanel title="Personal Data File">
      {/* Compact layout — matches the official Mongoose 2026 sheet's
          density: Age + Species share a row (saves ~0.4in of vertical
          space vs one-row-per-field). Tighter leading than the rest of
          the sheet because these are short single-line values. */}
      <dl className="text-sm leading-snug">
        <Row label="Name">
          {editable ? (
            <EditableText
              value={character.name}
              onChange={(v) => set('name', v)}
              placeholder="(unnamed)"
              ariaLabel="Name"
            />
          ) : (
            character.name || <span className="text-gray-400">(unnamed)</span>
          )}
        </Row>
        <Row label="Title">
          {editable ? (
            <EditableText
              value={(character as Character & { title?: string }).title ?? ''}
              onChange={(v) => set('title' as keyof Character, v as never)}
              placeholder="—"
              ariaLabel="Title"
            />
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </Row>
        <div className="grid grid-cols-2 gap-x-3">
          <Row label="Age" compact>{getAge(character)}</Row>
          <Row label="Species" compact className="capitalize">
            {editable ? (
              <select
                value={character.species}
                onChange={(e) => set('species', e.target.value as SpeciesId)}
                className="text-sm bg-transparent border-0 hover:bg-yellow-50 capitalize"
                aria-label="Species"
              >
                {(Object.keys(SPECIES) as SpeciesId[]).map((id) => (
                  <option key={id} value={id}>
                    {SPECIES[id].name}
                  </option>
                ))}
              </select>
            ) : (
              character.species
            )}
          </Row>
        </div>
        <Row label="Homeworld">
          {editable ? (
            <EditableText
              value={character.homeworld ?? ''}
              onChange={(v) => set('homeworld', v || undefined)}
              placeholder="—"
              ariaLabel="Homeworld"
            />
          ) : (
            character.homeworld || <span className="text-gray-400">—</span>
          )}
        </Row>
        <Row label="Traits">{traits || <span className="text-gray-400">—</span>}</Row>
      </dl>
    </SheetPanel>
  );
}

function Row({
  label,
  children,
  className = '',
  compact = false,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  // The compact variant uses a narrower label column for paired fields
  // (Age | Species) so two Rows fit comfortably side-by-side without
  // the labels eating the value space.
  const cols = compact ? 'grid-cols-[3rem_1fr]' : 'grid-cols-[5.5rem_1fr]';
  return (
    <div className={`grid ${cols} items-baseline gap-2`}>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className={`border-b border-dotted border-gray-300 ${className}`}>{children}</dd>
    </div>
  );
}

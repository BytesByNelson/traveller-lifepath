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
      <dl className="text-sm space-y-0.5">
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
        <Row label="Age">{getAge(character)}</Row>
        <Row label="Species" className="capitalize">
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

function Row({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-2">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className={`border-b border-dotted border-gray-300 leading-relaxed ${className}`}>{children}</dd>
    </div>
  );
}

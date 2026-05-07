import type { Character } from '../../types';
import { AugmentsBlock, ArmourBlock, WeaponsBlock, EquipmentBlock } from './EquipmentBlocks';
import { CareersHistory } from './CareersHistory';
import { CharacteristicsRow } from './CharacteristicsRow';
import { ConnectionsBoxes } from './ConnectionsBoxes';
import { Finances } from './Finances';
import { HistoryNotes } from './HistoryNotes';
import { PersonalDataFile } from './PersonalDataFile';
import { PsionicsPanel } from './PsionicsPanel';
import { SkillsList } from './SkillsList';
import { TrainingBox } from './TrainingBox';
import { Wounds } from './Wounds';

type Props = {
  character: Character;
  /** When provided, every section is editable (click-to-edit). When omitted, the sheet is read-only. */
  onChange?: (next: Character) => void;
};

export function Sheet({ character, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 print:grid-cols-1 print:gap-0">
      <SheetPage1 character={character} onChange={onChange} />
      <SheetPage2 character={character} onChange={onChange} />
    </div>
  );
}

function SheetPage1({ character, onChange }: Props) {
  return (
    <article
      className="sheet-page bg-white p-3 md:p-4 grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2"
      data-testid="sheet-page-1"
    >
      <div className="space-y-3">
        <AugmentsBlock character={character} {...(onChange ? { onChange } : {})} />
        <ArmourBlock character={character} {...(onChange ? { onChange } : {})} />
        <WeaponsBlock character={character} {...(onChange ? { onChange } : {})} />
        <EquipmentBlock character={character} {...(onChange ? { onChange } : {})} />
      </div>
      <div className="space-y-3">
        <PersonalDataFile character={character} {...(onChange ? { onChange } : {})} />
        <CharacteristicsRow character={character} {...(onChange ? { onChange } : {})} />
        <SkillsList character={character} {...(onChange ? { onChange } : {})} />
      </div>
    </article>
  );
}

function SheetPage2({ character, onChange }: Props) {
  return (
    <article
      className="sheet-page bg-white p-3 md:p-4 grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2"
      data-testid="sheet-page-2"
    >
      <div className="space-y-3">
        <Finances character={character} {...(onChange ? { onChange } : {})} />
        <Wounds character={character} {...(onChange ? { onChange } : {})} />
        {character.psi ? <PsionicsPanel character={character} {...(onChange ? { onChange } : {})} /> : null}
        <CareersHistory character={character} />
        <HistoryNotes character={character} {...(onChange ? { onChange } : {})} />
      </div>
      <div className="space-y-3">
        <ConnectionsBoxes character={character} {...(onChange ? { onChange } : {})} />
        {/* Training panel was on page 1's right column; moved here so the
            skills list can use the full vertical space of page 1 without
            overflowing into a 3rd printed page. */}
        <TrainingBox character={character} {...(onChange ? { onChange } : {})} />
      </div>
    </article>
  );
}

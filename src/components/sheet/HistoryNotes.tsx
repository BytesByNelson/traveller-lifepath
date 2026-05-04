import type { Character } from '../../types';
import { SheetPanel } from './SheetPanel';
import { EditableTextarea } from '../editable/EditableTextarea';

export function HistoryNotes({
  character,
  onChange,
}: {
  character: Character;
  onChange?: (next: Character) => void;
}) {
  const editable = !!onChange;
  return (
    <SheetPanel title="History & Background">
      {editable ? (
        <EditableTextarea
          value={character.notes}
          onChange={(v) => onChange?.({ ...character, notes: v })}
          rows={6}
          placeholder="Click to add background, motivation, personality quirks…"
          ariaLabel="History and background"
        />
      ) : (
        <p className="text-xs whitespace-pre-line text-gray-800 min-h-[6rem]">
          {character.notes || <span className="text-gray-400 italic">No notes recorded.</span>}
        </p>
      )}
    </SheetPanel>
  );
}

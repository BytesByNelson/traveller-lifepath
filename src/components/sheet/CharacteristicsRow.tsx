import type { Character, CharCode } from '../../types';
import { characteristicDM } from '../../data';
import { EditableNumber } from '../editable/EditableNumber';

const CHARS: { code: CharCode; label: string }[] = [
  { code: 'STR', label: 'STR' },
  { code: 'DEX', label: 'DEX' },
  { code: 'END', label: 'END' },
  { code: 'INT', label: 'INT' },
  { code: 'EDU', label: 'EDU' },
  { code: 'SOC', label: 'SOC' },
];

export function CharacteristicsRow({
  character,
  onChange,
}: {
  character: Character;
  onChange?: (next: Character) => void;
}) {
  const editable = !!onChange;
  const setChar = (code: CharCode, value: number) => {
    onChange?.({ ...character, characteristics: { ...character.characteristics, [code]: value } });
  };

  return (
    <div className="grid grid-cols-6 gap-1.5">
      {CHARS.map(({ code, label }) => {
        const value = character.characteristics[code];
        const dm = characteristicDM(value);
        return (
          <div
            key={code}
            className="flex flex-col items-center"
            style={{ clipPath: 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)' }}
            data-testid={`char-${code}`}
          >
            <div className="bg-gray-100 w-full h-full px-1 py-1 text-center">
              <div className="text-[10px] font-semibold tracking-wider text-gray-500">{label}</div>
              <div className="text-2xl font-mono font-semibold text-gray-900 leading-tight">
                {editable ? (
                  <EditableNumber
                    value={value}
                    onChange={(v) => setChar(code, v)}
                    min={0}
                    max={99}
                    size={3}
                    ariaLabel={`${label} value`}
                  />
                ) : (
                  value
                )}
              </div>
              <div className="text-[10px] text-gray-500">{`DM ${dm > 0 ? '+' : ''}${dm}`}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { useState } from 'react';
import { CHAR_CODES, type Character, type CharCode } from '../types';
import { CHAR_NAMES, characteristicDM, SPECIES } from '../data';
import { rollAllCharacteristics, setCharacteristic } from '../engine';

export function CharacteristicsStep({
  character,
  onChange,
  onBack,
  onNext,
}: {
  character: Character;
  onChange: (c: Character) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const mods = SPECIES[character.species].charModifiers;
  const [manualValues, setManualValues] = useState<Record<CharCode, string>>({
    STR: '', DEX: '', END: '', INT: '', EDU: '', SOC: '',
  });

  const rollAll = () => onChange(rollAllCharacteristics(character, Math.random));
  const setManual = (code: CharCode, value: number) =>
    onChange(setCharacteristic(character, code, value));

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Characteristics</h2>
      <p className="text-sm text-gray-600">
        Roll 2D for each of the six characteristics, or enter values manually.
        Species modifiers apply automatically.
      </p>

      <button
        onClick={rollAll}
        className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
      >
        Roll all (2D × 6)
      </button>

      <table className="w-full text-sm">
        <thead className="text-xs text-gray-500">
          <tr>
            <th className="text-left py-1">Char</th>
            <th className="text-right">Base</th>
            <th className="text-right">Species</th>
            <th className="text-right">Final</th>
            <th className="text-right">DM</th>
            <th className="w-32"></th>
          </tr>
        </thead>
        <tbody>
          {CHAR_CODES.map((code) => {
            const base = character.baseCharacteristics[code];
            const final = character.characteristics[code];
            const mod = (mods as Record<CharCode, number | undefined>)[code] ?? 0;
            return (
              <tr key={code} className="border-t border-gray-200">
                <td className="py-1.5 font-medium">{code}</td>
                <td className="text-right">{base}</td>
                <td className={`text-right ${mod < 0 ? 'text-red-600' : mod > 0 ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {mod === 0 ? '—' : (mod > 0 ? `+${mod}` : mod)}
                </td>
                <td className="text-right font-semibold">{final}</td>
                <td className="text-right">
                  <span className={characteristicDM(final) < 0 ? 'text-red-600' : 'text-gray-700'}>
                    {characteristicDM(final) > 0 ? '+' : ''}
                    {characteristicDM(final)}
                  </span>
                </td>
                <td className="text-right">
                  <input
                    type="number"
                    min={2}
                    max={12}
                    value={manualValues[code]}
                    onChange={(e) => setManualValues((m) => ({ ...m, [code]: e.target.value }))}
                    className="w-12 px-1 border border-gray-300 rounded text-xs text-right"
                    placeholder="2–12"
                    title={`Set ${CHAR_NAMES[code]} manually (2D)`}
                  />
                  <button
                    type="button"
                    className="ml-1 text-xs px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-50"
                    onClick={() => {
                      const n = Number(manualValues[code]);
                      if (Number.isInteger(n) && n >= 2 && n <= 12) {
                        setManual(code, n);
                        setManualValues((m) => ({ ...m, [code]: '' }));
                      }
                    }}
                  >
                    Set
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex gap-2">
        <button onClick={onBack} className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50">
          Back
        </button>
        <button onClick={onNext} className="px-4 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700">
          Continue → Background skills
        </button>
      </div>
    </section>
  );
}

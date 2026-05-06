import type { Character, Connection, ConnectionType } from '../../types';
import { SheetPanel } from './SheetPanel';
import { EditableText } from '../editable/EditableText';

const TITLES: Record<ConnectionType, string> = {
  ally: 'Allies',
  contact: 'Contacts',
  rival: 'Rivals',
  enemy: 'Enemies',
};

const KEY: Record<ConnectionType, keyof Character['connections']> = {
  ally: 'allies',
  contact: 'contacts',
  rival: 'rivals',
  enemy: 'enemies',
};

export function ConnectionsBoxes({
  character,
  onChange,
}: {
  character: Character;
  onChange?: (next: Character) => void;
}) {
  return (
    <div className="space-y-3">
      {(['ally', 'contact', 'rival', 'enemy'] as ConnectionType[]).map((type) => (
        <ConnectionPanel
          key={type}
          type={type}
          list={character.connections[KEY[type]]}
          {...(onChange ? { onChange: (list: Connection[]) => onChange({ ...character, connections: { ...character.connections, [KEY[type]]: list } }) } : {})}
        />
      ))}
    </div>
  );
}

function ConnectionPanel({
  type,
  list,
  onChange,
}: {
  type: ConnectionType;
  list: Connection[];
  onChange?: (list: Connection[]) => void;
}) {
  const editable = !!onChange;

  const update = (id: string, key: 'description' | 'linkedTraveller', value: string) => {
    onChange?.(list.map((c) => (c.id === id ? { ...c, [key]: value } : c)));
  };
  const remove = (id: string) => onChange?.(list.filter((c) => c.id !== id));
  const add = () => onChange?.([...list, { id: crypto.randomUUID(), type, description: '' }]);

  const padded: Connection[] = [...list];
  if (!editable) {
    while (padded.length < 3) padded.push({ id: `pad-${type}-${padded.length}`, type, description: '' });
  }

  return (
    <SheetPanel title={TITLES[type]}>
      <table className="w-full text-[11px]">
        <thead>
          <tr className="text-left text-gray-500 uppercase tracking-wider text-[9px]">
            <th className="py-0.5 pr-2 border-b border-gray-300 w-1/3">Name</th>
            <th className="py-0.5 pr-2 border-b border-gray-300">Notes</th>
            {editable ? <th className="border-b border-gray-300 w-6 print:hidden" /> : null}
          </tr>
        </thead>
        <tbody>
          {padded.map((c) => (
            <tr key={c.id} className="border-b border-dotted border-gray-200 group">
              <td className="py-1 pr-2">
                {editable ? (
                  <EditableText
                    value={c.description}
                    onChange={(v) => update(c.id, 'description', v)}
                    placeholder="—"
                    ariaLabel={`${type} name`}
                  />
                ) : (
                  c.description || <span>&nbsp;</span>
                )}
              </td>
              <td className="py-1 pr-2 text-gray-700">
                {editable ? (
                  <EditableText
                    value={c.linkedTraveller ?? ''}
                    onChange={(v) => update(c.id, 'linkedTraveller', v)}
                    placeholder="—"
                    ariaLabel={`${type} notes`}
                  />
                ) : c.linkedTraveller ? (
                  c.linkedTraveller
                ) : (
                  <span>&nbsp;</span>
                )}
              </td>
              {editable ? (
                <td className="print:hidden align-top">
                  <button
                    onClick={() => remove(c.id)}
                    className="text-gray-400 hover:text-red-600 text-xs px-1"
                    aria-label="Remove"
                    title="Remove"
                  >
                    ×
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
          {/* spacer rows for the empty editable case */}
          {editable && padded.length < 3
            ? Array.from({ length: 3 - padded.length }).map((_, i) => (
                <tr key={`pad-${i}`} className="border-b border-dotted border-gray-200">
                  <td className="py-1 pr-2">&nbsp;</td>
                  <td className="py-1 pr-2">&nbsp;</td>
                  <td className="print:hidden" />
                </tr>
              ))
            : null}
          {editable ? (
            <tr className="print:hidden">
              <td colSpan={3} className="pt-1">
                <button
                  onClick={add}
                  className="text-xs text-red-700 hover:text-red-900"
                  aria-label={`Add ${type}`}
                >
                  + Add {type}
                </button>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </SheetPanel>
  );
}

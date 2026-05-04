import { Fragment } from 'react';
import { EditableNumber } from './EditableNumber';
import { EditableText } from './EditableText';

export type ColumnDef<T> = {
  key: keyof T & string;
  label: string;
  type: 'text' | 'number';
  width?: string;
  format?: (value: number) => string;
};

type Props<T extends { id: string }> = {
  rows: T[];
  columns: ColumnDef<T>[];
  onChange: (rows: T[]) => void;
  /** Used to seed a new row's values. */
  blank: () => Omit<T, 'id'>;
  /** Number of empty padding rows to render so the table matches the PDF's grid. */
  emptyRows?: number;
};

export function EditableTable<T extends { id: string }>({
  rows,
  columns,
  onChange,
  blank,
  emptyRows = 0,
}: Props<T>) {
  const updateRow = (id: string, key: string, next: string | number) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, [key]: next } : r)));
  };
  const removeRow = (id: string) => {
    onChange(rows.filter((r) => r.id !== id));
  };
  const addRow = () => {
    const id = crypto.randomUUID();
    onChange([...rows, { id, ...blank() } as T]);
  };

  return (
    <table className="w-full text-[11px]">
      <thead>
        <tr className="text-left text-gray-500 uppercase tracking-wider text-[9px]">
          {columns.map((c) => (
            <th key={c.key} className="font-semibold py-0.5 pr-2 border-b border-gray-300" style={c.width ? { width: c.width } : undefined}>
              {c.label}
            </th>
          ))}
          <th className="border-b border-gray-300 w-6 print:hidden" />
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-dotted border-gray-200 group">
            {columns.map((c) => (
              <td key={c.key} className="py-1 pr-2 align-top text-gray-800">
                {c.type === 'number' ? (
                  <EditableNumber
                    value={(row as Record<string, unknown>)[c.key] as number ?? 0}
                    onChange={(n) => updateRow(row.id, c.key, n)}
                    {...(c.format ? { format: c.format } : {})}
                    ariaLabel={`${c.label} for row`}
                  />
                ) : (
                  <EditableText
                    value={String((row as Record<string, unknown>)[c.key] ?? '')}
                    onChange={(v) => updateRow(row.id, c.key, v)}
                    ariaLabel={`${c.label} for row`}
                    placeholder="—"
                  />
                )}
              </td>
            ))}
            <td className="print:hidden align-top">
              <button
                onClick={() => removeRow(row.id)}
                className="text-gray-400 hover:text-red-600 text-xs px-1"
                aria-label="Remove row"
                title="Remove"
              >
                ×
              </button>
            </td>
          </tr>
        ))}
        {Array.from({ length: Math.max(0, emptyRows - rows.length) }).map((_, i) => (
          <Fragment key={`pad-${i}`}>
            <tr className="border-b border-dotted border-gray-200">
              {columns.map((c) => (
                <td key={c.key} className="py-1 pr-2">&nbsp;</td>
              ))}
              <td className="print:hidden" />
            </tr>
          </Fragment>
        ))}
        <tr className="print:hidden">
          <td colSpan={columns.length + 1} className="pt-1">
            <button
              onClick={addRow}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              + Add row
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

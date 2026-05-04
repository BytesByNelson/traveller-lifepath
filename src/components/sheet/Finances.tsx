import type { Character } from '../../types';
import { SheetPanel } from './SheetPanel';
import { EditableNumber } from '../editable/EditableNumber';

const fmtCr = (n: number) => `Cr${n.toLocaleString()}`;

export function Finances({ character, onChange }: { character: Character; onChange?: (next: Character) => void }) {
  const editable = !!onChange;
  const shipShares = character.benefits.filter((b) => b.benefit.kind === 'ship_share').reduce((sum, b) => {
    if (b.benefit.kind !== 'ship_share') return sum;
    return sum + b.benefit.count;
  }, 0);

  const set = <K extends keyof Character>(key: K, value: Character[K]) => {
    onChange?.({ ...character, [key]: value });
  };

  return (
    <SheetPanel title="Finances">
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
        <Row label="Cash on hand">
          {editable ? (
            <EditableNumber
              value={character.currentCash}
              onChange={(v) => set('currentCash', v)}
              min={0}
              format={(n) => fmtCr(n)}
              ariaLabel="Cash on hand"
            />
          ) : (
            fmtCr(character.currentCash)
          )}
        </Row>
        <Row label="Monthly cash flow">
          <span className="text-gray-400">{(character.pension ?? 0) - (character.livingCost ?? 0) - (character.monthlyShipPayment ?? 0)} Cr/mo</span>
        </Row>
        <Row label="Ship shares">{shipShares}</Row>
        <Row label="Income">
          <span className="text-gray-400">—</span>
        </Row>
        <Row label="Debt">
          <span className="text-gray-400">—</span>
        </Row>
        <Row label="Annual pension">
          {editable ? (
            <EditableNumber
              value={character.pension ?? 0}
              onChange={(v) => set('pension', v || undefined)}
              min={0}
              format={fmtCr}
              ariaLabel="Annual pension"
            />
          ) : character.pension ? (
            fmtCr(character.pension)
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </Row>
        <Row label="Living costs">
          {editable ? (
            <EditableNumber
              value={character.livingCost ?? 0}
              onChange={(v) => set('livingCost', v || undefined)}
              min={0}
              format={fmtCr}
              ariaLabel="Living costs"
            />
          ) : character.livingCost ? (
            fmtCr(character.livingCost)
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </Row>
        <Row label="Ship payments">
          {editable ? (
            <EditableNumber
              value={character.monthlyShipPayment ?? 0}
              onChange={(v) => set('monthlyShipPayment', v || undefined)}
              min={0}
              format={fmtCr}
              ariaLabel="Monthly ship payment"
            />
          ) : character.monthlyShipPayment ? (
            fmtCr(character.monthlyShipPayment)
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </Row>
      </div>
    </SheetPanel>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-baseline gap-2">
      <dt className="text-[10px] uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="border-b border-dotted border-gray-300">{children}</dd>
    </div>
  );
}

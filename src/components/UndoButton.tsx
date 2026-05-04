type Props = {
  onUndo: () => void;
  disabled: boolean;
  depth?: number;
  className?: string;
};

export function UndoButton({ onUndo, disabled, depth = 0, className = '' }: Props) {
  return (
    <button
      onClick={onUndo}
      disabled={disabled}
      title={disabled ? 'Nothing to undo' : `Undo last action (${depth} in stack)`}
      className={
        className ||
        'text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
      }
    >
      ↶ Undo
    </button>
  );
}

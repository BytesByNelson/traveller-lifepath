import { useFontSize, type FontSize } from '../theme/useFontSize';

const NEXT_LABEL: Record<FontSize, string> = {
  normal: 'larger',
  large: 'largest',
  larger: 'normal',
};

const STEP_DOT: Record<FontSize, string> = {
  normal: '·',
  large: '··',
  larger: '···',
};

/**
 * Single-button accessibility control: click cycles Normal → Large → Larger →
 * back to Normal. The current step is rendered as dots beside the "Aa" so
 * a sighted user can tell which level they're on without opening a menu.
 */
export function FontSizeSwitcher() {
  const { fontSize, cycle } = useFontSize();
  return (
    <button
      type="button"
      onClick={cycle}
      title={`Font size: ${fontSize}. Click to switch to ${NEXT_LABEL[fontSize]}.`}
      aria-label={`Font size (currently ${fontSize}). Click to switch to ${NEXT_LABEL[fontSize]}.`}
      className="inline-flex items-center justify-center gap-1 rounded border border-gray-300 bg-white text-xs text-gray-700 hover:bg-gray-50 shadow-sm px-2 py-1"
    >
      <span aria-hidden="true">Aa</span>
      <span aria-hidden="true" className="text-gray-400 text-[10px] leading-none">
        {STEP_DOT[fontSize]}
      </span>
    </button>
  );
}

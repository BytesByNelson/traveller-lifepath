import { useTheme, type Theme } from '../theme/useTheme';

const OPTIONS: { value: Theme; label: string; title: string }[] = [
  { value: 'lbb', label: 'LBB', title: 'Light theme' },
  { value: 'imperial', label: 'Imperial', title: 'Dark theme' },
  { value: 'system', label: 'System', title: 'Follow OS theme' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <div
      className="inline-flex rounded border border-gray-300 bg-white text-xs shadow-sm overflow-hidden"
      role="group"
      aria-label="Theme"
    >
      {OPTIONS.map((opt, i) => {
        const selected = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            title={opt.title}
            aria-pressed={selected}
            className={`px-2 py-1 ${
              selected
                ? 'bg-red-700 text-white'
                : 'text-gray-700 hover:bg-gray-50'
            } ${i > 0 ? 'border-l border-gray-300' : ''}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

import type { Character } from '../types';
import { slugifyForFilename } from '../store/migrations';

/**
 * Trigger a download of the character as a JSON file. Uses a temporary anchor
 * with `download` attribute — works in all current browsers.
 */
export function ExportButton({
  character,
  className = '',
}: {
  character: Character;
  className?: string;
}) {
  const onClick = () => {
    const filename = `${slugifyForFilename(character.name, `traveller-${character.id.slice(0, 8)}`)}.traveller.json`;
    const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Defer revoke so the browser has time to start the download.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <button
      onClick={onClick}
      className={className || 'text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50'}
      title="Download character as JSON"
    >
      Export JSON
    </button>
  );
}

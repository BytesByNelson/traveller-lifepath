/**
 * Lightweight debug logger toggled by `?debug=1` (or `#debug=1`) in the URL.
 *
 * When enabled, `debug(group, ...args)` prints to console with a tag so the
 * user can copy-paste the full transcript when reporting issues. When disabled
 * the call is a no-op.
 *
 * Read once at module load — flipping the flag mid-session requires a reload.
 */

const isBrowser = typeof window !== 'undefined';

const enabledOnce = (() => {
  if (!isBrowser) return false;
  const search = window.location.search ?? '';
  const hash = window.location.hash ?? '';
  const haystack = `${search} ${hash}`;
  return /[?&#]debug=1\b/.test(haystack) || /\bdebug=true\b/.test(haystack);
})();

export const isDebugEnabled = (): boolean => enabledOnce;

export const debug = (group: string, ...args: unknown[]): void => {
  if (!enabledOnce) return;

  console.log(`[trav:${group}]`, ...args);
};

if (enabledOnce && isBrowser) {

  console.log(
    '%cTraveller debug logging enabled',
    'color: #4f46e5; font-weight: bold',
    '— append #debug=1 or ?debug=1 to the URL to keep it on. Remove it (or hard reload) to silence.',
  );
}

import { Suspense, lazy, type ComponentType } from 'react';
import { Outlet, createHashRouter, useRouteError } from 'react-router-dom';
import { AnalyticsRouteTracker } from './components/AnalyticsRouteTracker';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { FontSizeSwitcher } from './components/FontSizeSwitcher';
import { GmOverridePanel } from './components/GmOverridePanel';

/**
 * Wrap a lazy() loader so a stale-chunk failure (most common cause: a new build
 * was deployed mid-session, and the HTML in this tab references chunk hashes
 * that no longer exist on the server) triggers a single full-page reload. The
 * reload pulls fresh HTML pointing to current chunk hashes; localStorage state
 * is preserved across the reload so the user lands on the page they intended.
 *
 * Guarded by a 30-second sessionStorage key so a genuinely-broken chunk doesn't
 * spin in an infinite reload loop.
 */
const RELOAD_GUARD_KEY = 'traveller:chunk_reload_at';

const isChunkLoadError = (err: unknown): boolean => {
  if (!(err instanceof Error)) return false;
  const m = err.message ?? '';
  return (
    /loading dynamically imported module/i.test(m) ||
    /failed to fetch dynamically imported module/i.test(m) ||
    /loading chunk \d+ failed/i.test(m) ||
    /importing a module script failed/i.test(m)
  );
};

const reloadOnce = (): void => {
  if (typeof window === 'undefined') return;
  const last = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) ?? 0);
  if (Date.now() - last < 30_000) return;
  sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
  window.location.reload();
};

const lazyChunk = (loader: () => Promise<{ default: ComponentType<unknown> }>) =>
  lazy(() =>
    loader().catch((err: unknown) => {
      if (isChunkLoadError(err)) reloadOnce();
      throw err;
    }),
  );

const CharacterListPage = lazyChunk(() =>
  import('./pages/CharacterListPage').then((m) => ({ default: m.CharacterListPage })),
);
const WizardPage = lazyChunk(() =>
  import('./pages/WizardPage').then((m) => ({ default: m.WizardPage })),
);
const SheetPage = lazyChunk(() =>
  import('./pages/SheetPage').then((m) => ({ default: m.SheetPage })),
);
const NpcGeneratorPage = lazyChunk(() =>
  import('./pages/NpcGeneratorPage').then((m) => ({ default: m.NpcGeneratorPage })),
);

const Loading = () => (
  <main className="p-6 text-sm text-gray-500">Loading…</main>
);

const wrap = (el: React.ReactNode) => <Suspense fallback={<Loading />}>{el}</Suspense>;

/**
 * Fallback rendered when something throws inside a route. The most common case
 * is a chunk-load failure that didn't (or couldn't) auto-reload — we surface a
 * "reload to recover" button so the user has an unambiguous escape hatch and
 * the message reassures them their character is still saved in localStorage.
 */
const RouteErrorBoundary = () => {
  const err = useRouteError();
  const isChunk = isChunkLoadError(err);
  return (
    <main className="max-w-xl mx-auto p-6 space-y-3">
      <h1 className="text-xl font-semibold text-rose-700">
        {isChunk ? 'Site updated — please reload' : 'Something went wrong'}
      </h1>
      <p className="text-sm text-gray-700">
        {isChunk
          ? 'A newer version of the app was deployed while this tab was open, so an asset this page needs is no longer on the server. Your character is still saved in your browser — reload to pick up the new build and continue where you left off.'
          : 'An unexpected error occurred. Your character data is saved in your browser; reload the page to continue.'}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 rounded bg-red-700 text-white text-sm font-medium hover:bg-red-800"
      >
        Reload
      </button>
      {err instanceof Error ? (
        <details className="mt-4 text-xs text-gray-500">
          <summary className="cursor-pointer">Technical detail</summary>
          <pre className="mt-2 whitespace-pre-wrap break-all">{err.message}</pre>
        </details>
      ) : null}
    </main>
  );
};

/**
 * Layout route — wraps every page so the analytics tracker sits inside the router
 * (it needs useLocation) and fires a pageview on every route change. HashRouter
 * doesn't fire native page loads, so without this we'd only ever see the initial
 * landing route in GoatCounter.
 */
const RootLayout = () => (
  <>
    {/* Skip-to-content link: hidden until focused via keyboard (Tab on page load
        targets it first), then jumps screen-reader / keyboard users straight
        past the route-tracking and theme chrome to the page content. */}
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only fixed top-2 left-2 z-[60] bg-red-700 text-white px-3 py-1 rounded text-sm font-medium shadow-md"
    >
      Skip to main content
    </a>
    <AnalyticsRouteTracker />
    <div id="main-content">
      <Outlet />
    </div>
    {/* Bottom-right keeps the switcher discoverable but out of every page's
        header zone — the SheetPage action bar (Undo / Roll log / Export) sits
        in the top-right and collided with a top-anchored switcher. */}
    <div className="fixed bottom-3 right-3 z-50 print:hidden flex items-center gap-2 flex-wrap justify-end">
      <GmOverridePanel />
      <FontSizeSwitcher />
      <ThemeSwitcher />
    </div>
  </>
);

export const router = createHashRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/', element: wrap(<CharacterListPage />) },
      { path: '/create/:id', element: wrap(<WizardPage />) },
      { path: '/sheet/:id', element: wrap(<SheetPage />) },
      { path: '/npc', element: wrap(<NpcGeneratorPage />) },
    ],
  },
]);

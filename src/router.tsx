import { Suspense, lazy } from 'react';
import { Outlet, createHashRouter } from 'react-router-dom';
import { AnalyticsRouteTracker } from './components/AnalyticsRouteTracker';

// Lazy-load each page so the initial bundle stays small. The catalogue data,
// equipment blocks, and full sheet only download once the user navigates to
// /sheet/:id. The wizard chunks similarly when they hit /create/:id.
const CharacterListPage = lazy(() =>
  import('./pages/CharacterListPage').then((m) => ({ default: m.CharacterListPage })),
);
const WizardPage = lazy(() =>
  import('./pages/WizardPage').then((m) => ({ default: m.WizardPage })),
);
const SheetPage = lazy(() =>
  import('./pages/SheetPage').then((m) => ({ default: m.SheetPage })),
);

const Loading = () => (
  <main className="p-6 text-sm text-gray-500">Loading…</main>
);

const wrap = (el: React.ReactNode) => <Suspense fallback={<Loading />}>{el}</Suspense>;

/**
 * Layout route — wraps every page so the analytics tracker sits inside the router
 * (it needs useLocation) and fires a pageview on every route change. HashRouter
 * doesn't fire native page loads, so without this we'd only ever see the initial
 * landing route in GoatCounter.
 */
const RootLayout = () => (
  <>
    <AnalyticsRouteTracker />
    <Outlet />
  </>
);

export const router = createHashRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: wrap(<CharacterListPage />) },
      { path: '/create/:id', element: wrap(<WizardPage />) },
      { path: '/sheet/:id', element: wrap(<SheetPage />) },
    ],
  },
]);

import { Suspense, lazy } from 'react';
import { createHashRouter } from 'react-router-dom';

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

export const router = createHashRouter([
  { path: '/', element: wrap(<CharacterListPage />) },
  { path: '/create/:id', element: wrap(<WizardPage />) },
  { path: '/sheet/:id', element: wrap(<SheetPage />) },
]);

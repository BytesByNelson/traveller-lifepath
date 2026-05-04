import { createHashRouter } from 'react-router-dom';
import { CharacterListPage } from './pages/CharacterListPage';
import { WizardPage } from './pages/WizardPage';
import { SheetPage } from './pages/SheetPage';

// Hash router avoids needing SPA fallback config on GitHub Pages.
export const router = createHashRouter([
  { path: '/', element: <CharacterListPage /> },
  { path: '/create/:id', element: <WizardPage /> },
  { path: '/sheet/:id', element: <SheetPage /> },
]);

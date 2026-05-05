import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { Footer } from './components/Footer';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <RouterProvider router={router} />
      </div>
      <Footer />
    </div>
  </React.StrictMode>,
);

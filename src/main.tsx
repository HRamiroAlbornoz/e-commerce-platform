import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { router } from '@/routes/router';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('No se encontro el elemento #root en index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);

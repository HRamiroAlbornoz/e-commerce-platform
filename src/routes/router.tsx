import { createBrowserRouter } from 'react-router';
import { CatalogPage } from '@/features/products/pages/CatalogPage';
import { PublicLayout } from '@/layouts/PublicLayout';
import { PrivateLayout } from '@/layouts/PrivateLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AdminRoute } from '@/routes/AdminRoute';

function LoginPlaceholder() {
  return <p className="p-4 text-gray-500">Login: pendiente (slice de autenticacion).</p>;
}

function PrivateAreaPlaceholder() {
  return <p className="p-4 text-gray-500">Area privada: pendiente.</p>;
}

function AdminAreaPlaceholder() {
  return <p className="p-4 text-gray-500">Panel de administracion: pendiente.</p>;
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: 'login', element: <LoginPlaceholder /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <PrivateLayout />,
        children: [{ path: 'account', element: <PrivateAreaPlaceholder /> }],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [{ path: 'admin', element: <AdminAreaPlaceholder /> }],
      },
    ],
  },
]);

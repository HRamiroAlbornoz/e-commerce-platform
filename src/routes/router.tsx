import { createBrowserRouter } from 'react-router';
import { CatalogPage } from '@/features/products/pages/CatalogPage';
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { PublicLayout } from '@/layouts/PublicLayout';
import { PrivateLayout } from '@/layouts/PrivateLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AdminRoute } from '@/routes/AdminRoute';

function ProductReviewsPlaceholder() {
  return <p className="p-4 text-gray-500">Reseñas: pendiente (slice de reviews).</p>;
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
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'products/:id/reviews', element: <ProductReviewsPlaceholder /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
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

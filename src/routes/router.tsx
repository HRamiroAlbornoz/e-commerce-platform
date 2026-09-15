import { createBrowserRouter, Navigate } from 'react-router';
import { CatalogPage } from '@/features/products/pages/CatalogPage';
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage';
import { CartPage } from '@/features/cart/pages/CartPage';
import { CheckoutPage } from '@/features/checkout/pages/CheckoutPage';
import { OrdersPage } from '@/features/orders/pages/OrdersPage';
import { OrderDetailPage } from '@/features/orders/pages/OrderDetailPage';
import { ProductReviewsPage } from '@/features/reviews/pages/ProductReviewsPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { AdminProductsPage } from '@/features/admin/products/pages/AdminProductsPage';
import { AdminProductFormPage } from '@/features/admin/products/pages/AdminProductFormPage';
import { PublicLayout } from '@/layouts/PublicLayout';
import { PrivateLayout } from '@/layouts/PrivateLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AdminRoute } from '@/routes/AdminRoute';

function PrivateAreaPlaceholder() {
  return <p className="p-4 text-gray-500">Area privada: pendiente.</p>;
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'products/:id/reviews', element: <ProductReviewsPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <PrivateLayout />,
        children: [
          { path: 'account', element: <PrivateAreaPlaceholder /> },
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'orders/:orderId', element: <OrderDetailPage /> },
        ],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: 'admin', element: <Navigate to="/admin/products" replace /> },
          { path: 'admin/products', element: <AdminProductsPage /> },
          { path: 'admin/products/new', element: <AdminProductFormPage /> },
          { path: 'admin/products/:id/edit', element: <AdminProductFormPage /> },
        ],
      },
    ],
  },
]);

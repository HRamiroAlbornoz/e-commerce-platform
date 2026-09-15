import { useParams } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useAdminProduct } from '@/features/admin/products/hooks/useAdminProduct';
import { AdminProductForm } from '@/features/admin/products/components/AdminProductForm';
import { AdminProductFormSkeleton } from '@/features/admin/products/components/AdminProductFormSkeleton';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';

export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const auth = useAuth();
  const productState = useAdminProduct(id);

  if (auth.status !== 'authenticated') {
    return null;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:px-8 lg:px-12">
      {!id ? <AdminProductForm user={auth.user} existingProduct={null} /> : null}

      {id && productState.status === 'loading' ? <AdminProductFormSkeleton /> : null}

      {id && productState.status === 'error' ? (
        <ErrorState message={productState.message} onRetry={productState.retry} />
      ) : null}

      {id && productState.status === 'not-found' ? (
        <EmptyState
          title="Producto no encontrado"
          description="No encontramos ese producto. Puede que ya se haya eliminado."
        />
      ) : null}

      {id && productState.status === 'success' ? (
        <AdminProductForm user={auth.user} existingProduct={productState.product} />
      ) : null}
    </main>
  );
}

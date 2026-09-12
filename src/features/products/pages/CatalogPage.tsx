import { useActiveProducts } from '@/features/products/hooks/useActiveProducts';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';

export function CatalogPage() {
  const catalog = useActiveProducts();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 lg:px-12">
      {catalog.status === 'loading' ? <ProductGrid status="loading" /> : null}

      {catalog.status === 'error' ? (
        <ErrorState message={catalog.message} onRetry={catalog.retry} />
      ) : null}

      {catalog.status === 'success' && catalog.products.length === 0 ? (
        <EmptyState
          title="Todavia no hay productos"
          description="La sala esta vacia por ahora. Volve mas tarde."
        />
      ) : null}

      {catalog.status === 'success' && catalog.products.length > 0 ? (
        <ProductGrid status="success" products={catalog.products} />
      ) : null}
    </main>
  );
}

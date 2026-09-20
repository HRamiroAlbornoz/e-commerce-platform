import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useAdminProducts } from '@/features/admin/products/hooks/useAdminProducts';
import { AdminProductFilters } from '@/features/admin/products/components/AdminProductFilters';
import { AdminProductRow } from '@/features/admin/products/components/AdminProductRow';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { BUTTON_CLASSES } from '@/components/ui/Button';
import { TABLE_LABEL_CLASSES } from '@/features/admin/constants/tableLabelClasses';
import { toNameLower, type Product, type ProductCategory } from '@shared/schemas/product';

function filterProducts(
  products: Product[],
  category: ProductCategory | undefined,
  searchTerm: string,
): Product[] {
  const normalizedSearchTerm = toNameLower(searchTerm);

  return products.filter((product) => {
    if (category && product.category !== category) {
      return false;
    }
    if (normalizedSearchTerm && !product.nameLower.includes(normalizedSearchTerm)) {
      return false;
    }
    return true;
  });
}

export function AdminProductsPage() {
  const auth = useAuth();
  const productsState = useAdminProducts();
  const [category, setCategory] = useState<ProductCategory | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const products = productsState.status === 'success' ? productsState.data : null;
  const filteredProducts = useMemo(
    () => (products ? filterProducts(products, category, searchTerm) : []),
    [products, category, searchTerm],
  );

  if (auth.status !== 'authenticated') {
    return null;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 lg:px-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-ink dark:text-bone">Productos</h1>
        <Link to="/admin/products/new" className={BUTTON_CLASSES}>
          Nuevo producto
        </Link>
      </div>

      {products && products.length > 0 ? (
        <AdminProductFilters
          category={category}
          searchTerm={searchTerm}
          onCategoryChange={setCategory}
          onSearchTermChange={setSearchTerm}
        />
      ) : null}

      {productsState.status === 'loading' ? <TableSkeleton /> : null}

      {productsState.status === 'error' ? (
        <ErrorState message={productsState.message} onRetry={productsState.retry} />
      ) : null}

      {products && products.length === 0 ? (
        <EmptyState
          title="Todavía no hay productos"
          description="Subí el primer producto del catálogo para empezar."
        />
      ) : null}

      {products && products.length > 0 && filteredProducts.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="Ningún producto coincide con esta búsqueda o categoría. Probá con otro término o mostrá todas las categorías."
        />
      ) : null}

      {filteredProducts.length > 0 ? (
        <table className="block w-full md:table md:table-auto">
          <thead className="hidden border-b border-ink/15 md:table-header-group dark:border-bone/15">
            <tr>
              <th className={`py-2 pr-4 text-left ${TABLE_LABEL_CLASSES}`}>Producto</th>
              <th className={`py-2 pr-4 text-left ${TABLE_LABEL_CLASSES}`}>Categoría</th>
              <th className={`py-2 pr-4 text-left ${TABLE_LABEL_CLASSES}`}>Precio</th>
              <th className={`py-2 pr-4 text-left ${TABLE_LABEL_CLASSES}`}>Stock</th>
              <th className={`py-2 pr-4 text-left ${TABLE_LABEL_CLASSES}`}>Estado</th>
              <th className={`py-2 text-right ${TABLE_LABEL_CLASSES}`}>Acciones</th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {filteredProducts.map((product) => (
              <AdminProductRow
                key={product.id}
                product={product}
                user={auth.user}
                onMutated={productsState.retry}
              />
            ))}
          </tbody>
        </table>
      ) : null}
    </main>
  );
}

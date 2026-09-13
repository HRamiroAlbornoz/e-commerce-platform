import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useActiveProducts } from '@/features/products/hooks/useActiveProducts';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { CatalogFilters } from '@/features/products/components/CatalogFilters';
import { PaginationControls } from '@/features/products/components/PaginationControls';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import {
  parseCategoryParam,
  parsePageParam,
  parseSearchTermParam,
} from '@/features/products/utils/catalogQueryParams';

const SEARCH_DEBOUNCE_MS = 400;

function withParam(
  params: URLSearchParams,
  key: string,
  value: string | undefined,
): URLSearchParams {
  const nextParams = new URLSearchParams(params);
  if (value) {
    nextParams.set(key, value);
  } else {
    nextParams.delete(key);
  }
  return nextParams;
}

function withFilterChange(
  params: URLSearchParams,
  key: string,
  value: string | undefined,
): URLSearchParams {
  const nextParams = withParam(params, key, value);
  nextParams.delete('page');
  return nextParams;
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = parseCategoryParam(searchParams.get('category'));
  const committedSearchTerm = parseSearchTermParam(searchParams.get('q'));
  const page = parsePageParam(searchParams.get('page'));

  const [searchInputValue, setSearchInputValue] = useState(committedSearchTerm);
  const debouncedSearchTerm = useDebouncedValue(searchInputValue, SEARCH_DEBOUNCE_MS);
  const searchTermPending = debouncedSearchTerm !== committedSearchTerm;

  useEffect(() => {
    if (!searchTermPending) {
      return;
    }

    setSearchParams((currentParams) => withFilterChange(currentParams, 'q', debouncedSearchTerm), {
      replace: true,
    });
  }, [debouncedSearchTerm, searchTermPending, setSearchParams]);

  const effectivePage = searchTermPending ? 1 : page;
  const catalog = useActiveProducts({ category, searchTerm: debouncedSearchTerm }, effectivePage);
  const hasActiveFilter = category !== undefined || debouncedSearchTerm !== '';

  function handleCategoryChange(nextCategory: string | undefined) {
    setSearchParams((currentParams) => withFilterChange(currentParams, 'category', nextCategory));
  }

  function handlePageChange(nextPage: number) {
    setSearchParams((currentParams) =>
      withParam(currentParams, 'page', nextPage > 1 ? String(nextPage) : undefined),
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 lg:px-12">
      <CatalogFilters
        category={category}
        searchInputValue={searchInputValue}
        onCategoryChange={handleCategoryChange}
        onSearchInputChange={setSearchInputValue}
      />

      {catalog.status === 'loading' ? <ProductGrid status="loading" /> : null}

      {catalog.status === 'error' ? (
        <ErrorState message={catalog.message} onRetry={catalog.retry} />
      ) : null}

      {catalog.status === 'success' && catalog.products.length === 0 ? (
        <EmptyState
          title={hasActiveFilter ? 'Sin resultados' : 'Todavia no hay productos'}
          description={
            hasActiveFilter
              ? 'Ningun producto coincide con esta busqueda o categoria. Probá con otro termino o mostrá todos los productos.'
              : 'La sala esta vacia por ahora. Volve mas tarde.'
          }
        />
      ) : null}

      {catalog.status === 'success' && catalog.products.length > 0 ? (
        <>
          <ProductGrid status="success" products={catalog.products} />
          {effectivePage > 1 || catalog.hasNextPage ? (
            <PaginationControls
              page={effectivePage}
              hasNextPage={catalog.hasNextPage}
              onPageChange={handlePageChange}
            />
          ) : null}
        </>
      ) : null}
    </main>
  );
}

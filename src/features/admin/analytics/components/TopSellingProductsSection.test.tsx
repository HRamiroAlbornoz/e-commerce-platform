import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopSellingProductsSection } from '@/features/admin/analytics/components/TopSellingProductsSection';
import { useTopSellingProducts } from '@/features/admin/analytics/hooks/useTopSellingProducts';
import type { Product } from '@shared/schemas/product';

vi.mock('@/features/admin/analytics/hooks/useTopSellingProducts', () => ({
  useTopSellingProducts: vi.fn(),
}));

vi.mock('@/features/admin/analytics/components/TopSellingProductsChart', () => ({
  TopSellingProductsChart: ({ products }: { products: Product[] }) => (
    <div data-testid="top-products-chart">{products.length} productos</div>
  ),
}));

describe('TopSellingProductsSection', () => {
  it('mientras carga, muestra un esqueleto', () => {
    vi.mocked(useTopSellingProducts).mockReturnValue({ status: 'loading', retry: vi.fn() });

    render(<TopSellingProductsSection />);

    expect(screen.queryByTestId('top-products-chart')).not.toBeInTheDocument();
  });

  it('si la consulta falla, muestra el error con reintentar', () => {
    const retry = vi.fn();
    vi.mocked(useTopSellingProducts).mockReturnValue({
      status: 'error',
      message: 'No pudimos cargar el ranking de productos. Intenta de nuevo.',
      retry,
    });

    render(<TopSellingProductsSection />);

    expect(
      screen.getByText('No pudimos cargar el ranking de productos. Intenta de nuevo.'),
    ).toBeInTheDocument();
  });

  it('con datos, renderiza el grafico (F12.1)', () => {
    vi.mocked(useTopSellingProducts).mockReturnValue({
      status: 'success',
      products: [{ id: 'product-1' } as Product],
      retry: vi.fn(),
    });

    render(<TopSellingProductsSection />);

    expect(screen.getByTestId('top-products-chart')).toHaveTextContent('1 productos');
  });

  it('con una lista vacia, no renderiza el grafico y explica que no hay ventas todavia', () => {
    vi.mocked(useTopSellingProducts).mockReturnValue({
      status: 'success',
      products: [],
      retry: vi.fn(),
    });

    render(<TopSellingProductsSection />);

    expect(screen.queryByTestId('top-products-chart')).not.toBeInTheDocument();
    expect(
      screen.getByText('Todavía no hay unidades vendidas para armar el ranking.'),
    ).toBeInTheDocument();
  });
});

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminAnalyticsPage } from '@/features/admin/analytics/pages/AdminAnalyticsPage';
import { useOrdersSummary } from '@/features/admin/analytics/hooks/useOrdersSummary';

vi.mock('@/features/admin/analytics/hooks/useOrdersSummary', () => ({
  useOrdersSummary: vi.fn(),
}));

vi.mock('@/features/admin/analytics/components/TopSellingProductsSection', () => ({
  TopSellingProductsSection: () => <div data-testid="top-products-section" />,
}));

describe('AdminAnalyticsPage', () => {
  it('mientras carga, muestra un esqueleto', () => {
    vi.mocked(useOrdersSummary).mockReturnValue({ status: 'loading', retry: vi.fn() });

    render(<AdminAnalyticsPage />);

    expect(screen.queryByTestId('top-products-section')).not.toBeInTheDocument();
  });

  it('si la consulta falla, muestra el error con reintentar', () => {
    vi.mocked(useOrdersSummary).mockReturnValue({
      status: 'error',
      message: 'No pudimos cargar el resumen de ventas. Intentá de nuevo.',
      retry: vi.fn(),
    });

    render(<AdminAnalyticsPage />);

    expect(
      screen.getByText('No pudimos cargar el resumen de ventas. Intentá de nuevo.'),
    ).toBeInTheDocument();
  });

  it('con cero ordenes, muestra el estado vacio y no el grafico (F12.4)', () => {
    vi.mocked(useOrdersSummary).mockReturnValue({
      status: 'success',
      summary: { totalRevenue: 0, totalOrders: 0 },
      retry: vi.fn(),
    });

    render(<AdminAnalyticsPage />);

    expect(screen.getByText('Todavía no hay ventas')).toBeInTheDocument();
    expect(screen.queryByTestId('top-products-section')).not.toBeInTheDocument();
  });

  it('con ordenes, muestra los totales y el ranking de productos (F12.1)', () => {
    vi.mocked(useOrdersSummary).mockReturnValue({
      status: 'success',
      summary: { totalRevenue: 189998, totalOrders: 2 },
      retry: vi.fn(),
    });

    render(<AdminAnalyticsPage />);

    expect(screen.getByText('$189.998')).toBeInTheDocument();
    expect(screen.getByTestId('top-products-section')).toBeInTheDocument();
  });
});

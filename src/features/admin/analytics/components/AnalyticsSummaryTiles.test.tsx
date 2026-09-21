import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalyticsSummaryTiles } from '@/features/admin/analytics/components/AnalyticsSummaryTiles';

describe('AnalyticsSummaryTiles', () => {
  it('muestra el ingreso total formateado y la cantidad de ordenes (F12.1)', () => {
    render(<AnalyticsSummaryTiles summary={{ totalRevenue: 189998, totalOrders: 2 }} />);

    expect(screen.getByText('Ingresos totales')).toBeInTheDocument();
    expect(screen.getByText('$189.998')).toBeInTheDocument();
    expect(screen.getByText('Cantidad de órdenes')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

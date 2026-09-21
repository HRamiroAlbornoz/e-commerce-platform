import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { TopSellingProductsChart } from '@/features/admin/analytics/components/TopSellingProductsChart';
import type { Product } from '@shared/schemas/product';

describe('TopSellingProductsChart', () => {
  it('renderiza sin errores con una lista de productos (F12.1)', () => {
    const products = [{ id: 'product-1', name: 'Teclado Aurora', unitsSold: 12 } as Product];

    expect(() => render(<TopSellingProductsChart products={products} />)).not.toThrow();
  });

  it('renderiza sin errores con una lista vacia', () => {
    expect(() => render(<TopSellingProductsChart products={[]} />)).not.toThrow();
  });
});

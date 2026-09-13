import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { CartIndicator } from '@/features/cart/components/CartIndicator';
import { useCart } from '@/hooks/useCart';
import { buildCartContextValue } from '@/test/mocks/cartContextValue';

vi.mock('@/hooks/useCart', () => ({ useCart: vi.fn() }));

function renderCartIndicator() {
  const Stub = createRoutesStub([{ path: '/', Component: CartIndicator }]);
  return render(<Stub initialEntries={['/']} />);
}

describe('CartIndicator', () => {
  it('sin items, no muestra ningun numero', () => {
    vi.mocked(useCart).mockReturnValue(buildCartContextValue({ items: [] }));

    renderCartIndicator();

    expect(screen.getByRole('link', { name: 'Carrito' })).toHaveAttribute('href', '/cart');
  });

  it('suma las cantidades de todas las lineas, no cuenta lineas', () => {
    vi.mocked(useCart).mockReturnValue(
      buildCartContextValue({
        items: [
          { productId: 'product-1', quantity: 2 },
          { productId: 'product-2', quantity: 3 },
        ],
      }),
    );

    renderCartIndicator();

    expect(screen.getByRole('link', { name: 'Carrito (5)' })).toBeInTheDocument();
  });
});

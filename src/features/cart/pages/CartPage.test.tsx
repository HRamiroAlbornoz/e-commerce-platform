import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { CartPage } from '@/features/cart/pages/CartPage';
import { useCart } from '@/hooks/useCart';
import { useResolvedCart } from '@/features/cart/hooks/useResolvedCart';
import { buildCartContextValue } from '@/test/mocks/cartContextValue';
import type { Product } from '@shared/schemas/product';

vi.mock('@/hooks/useCart', () => ({ useCart: vi.fn() }));
vi.mock('@/features/cart/hooks/useResolvedCart', () => ({ useResolvedCart: vi.fn() }));

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    name: 'Teclado mecanico X',
    nameLower: 'teclado mecanico x',
    description: 'Descripcion',
    price: 1000,
    stock: 5,
    category: 'keyboard',
    displayColor: 'lime',
    imageUrl: 'https://placehold.co/600x400',
    isActive: true,
    specs: [{ label: 'Switches', value: 'Lineales' }],
    curatorialNote: 'Nota',
    ratingAverage: 0,
    ratingCount: 0,
    orderCount: 0,
    unitsSold: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function renderCartPage() {
  const Stub = createRoutesStub([{ path: '/cart', Component: CartPage }]);
  return render(<Stub initialEntries={['/cart']} />);
}

describe('CartPage', () => {
  it('en loading, muestra el skeleton', () => {
    vi.mocked(useCart).mockReturnValue(buildCartContextValue());
    vi.mocked(useResolvedCart).mockReturnValue({ status: 'loading', retry: vi.fn() });

    const { container } = renderCartPage();

    expect(container.querySelector('.motion-safe\\:animate-pulse')).toBeInTheDocument();
  });

  it('en error, muestra el mensaje y permite reintentar', () => {
    const retry = vi.fn();
    vi.mocked(useCart).mockReturnValue(buildCartContextValue());
    vi.mocked(useResolvedCart).mockReturnValue({
      status: 'error',
      message: 'No pudimos cargar el carrito. Intenta de nuevo.',
      retry,
    });

    renderCartPage();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('con el carrito vacio, muestra el mensaje y un link al catalogo (F5.8)', () => {
    vi.mocked(useCart).mockReturnValue(buildCartContextValue());
    vi.mocked(useResolvedCart).mockReturnValue({
      status: 'success',
      lines: [],
      total: 0,
      retry: vi.fn(),
    });

    renderCartPage();

    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver catalogo' })).toHaveAttribute('href', '/');
  });

  it('muestra las lineas del carrito y el total, y permite cambiar cantidad y quitar', () => {
    const setQuantity = vi.fn();
    const removeItem = vi.fn();
    vi.mocked(useCart).mockReturnValue(buildCartContextValue({ setQuantity, removeItem }));
    vi.mocked(useResolvedCart).mockReturnValue({
      status: 'success',
      lines: [{ product: buildProduct(), quantity: 2, lineTotal: 2000 }],
      total: 2000,
      retry: vi.fn(),
    });

    renderCartPage();

    expect(screen.getByText('Teclado mecanico X')).toBeInTheDocument();
    expect(screen.getAllByText('$2.000')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Sumar uno' }));
    expect(setQuantity).toHaveBeenCalledWith('product-1', 3, 5);

    fireEvent.click(screen.getByRole('button', { name: /quitar/i }));
    expect(removeItem).toHaveBeenCalledWith('product-1');
  });

  it('muestra los productos excluidos al fusionar el carrito, y se puede descartar el aviso (F5.7)', () => {
    const dismissMergeExclusions = vi.fn();
    vi.mocked(useCart).mockReturnValue(
      buildCartContextValue({
        mergeExclusions: [
          { productId: 'product-2', productName: 'Mouse Y', reason: 'out-of-stock' },
        ],
        dismissMergeExclusions,
      }),
    );
    vi.mocked(useResolvedCart).mockReturnValue({
      status: 'success',
      lines: [],
      total: 0,
      retry: vi.fn(),
    });

    renderCartPage();

    expect(screen.getByText(/Mouse Y/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));

    expect(dismissMergeExclusions).toHaveBeenCalledTimes(1);
  });
});

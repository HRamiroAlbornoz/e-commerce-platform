import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { CartLinesSummary } from '@/features/cart/components/CartLinesSummary';
import type { Product } from '@shared/schemas/product';

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

function renderSummary(ui: React.ReactElement) {
  const Stub = createRoutesStub([{ path: '/', Component: () => ui }]);
  return render(<Stub initialEntries={['/']} />);
}

describe('CartLinesSummary', () => {
  it('en loading, muestra el skeleton', () => {
    const { container } = renderSummary(
      <CartLinesSummary
        cart={{ status: 'loading' }}
        onQuantityChange={vi.fn()}
        onRemove={vi.fn()}
        emptyStateDescription="Descripcion"
      />,
    );

    expect(container.querySelector('.motion-safe\\:animate-pulse')).toBeInTheDocument();
  });

  it('en error, muestra el mensaje y permite reintentar', () => {
    const retry = vi.fn();
    renderSummary(
      <CartLinesSummary
        cart={{ status: 'error', message: 'No pudimos cargar el carrito.', retry }}
        onQuantityChange={vi.fn()}
        onRemove={vi.fn()}
        emptyStateDescription="Descripcion"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('con el carrito vacio, muestra la descripcion pedida y un link al catalogo', () => {
    renderSummary(
      <CartLinesSummary
        cart={{ status: 'success', lines: [], total: 0 }}
        onQuantityChange={vi.fn()}
        onRemove={vi.fn()}
        emptyStateDescription="Descripcion particular de esta pantalla."
      />,
    );

    expect(screen.getByText('Descripcion particular de esta pantalla.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver catalogo' })).toHaveAttribute('href', '/');
  });

  it('con lineas, muestra el total y permite cambiar cantidad y quitar', () => {
    const onQuantityChange = vi.fn();
    const onRemove = vi.fn();
    renderSummary(
      <CartLinesSummary
        cart={{
          status: 'success',
          lines: [{ product: buildProduct(), quantity: 2, lineTotal: 2000 }],
          total: 2000,
        }}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
        emptyStateDescription="Descripcion"
      />,
    );

    expect(screen.getAllByText('$2.000')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Sumar uno' }));
    expect(onQuantityChange).toHaveBeenCalledWith('product-1', 3, 5);

    fireEvent.click(screen.getByRole('button', { name: /quitar/i }));
    expect(onRemove).toHaveBeenCalledWith('product-1');
  });

  it('con lineas, muestra children (arriba) y nonEmptyFooter (debajo del total)', () => {
    renderSummary(
      <CartLinesSummary
        cart={{
          status: 'success',
          lines: [{ product: buildProduct(), quantity: 1, lineTotal: 1000 }],
          total: 1000,
        }}
        onQuantityChange={vi.fn()}
        onRemove={vi.fn()}
        emptyStateDescription="Descripcion"
        nonEmptyFooter={<p>Pie de pagina</p>}
      >
        <p>Aviso arriba</p>
      </CartLinesSummary>,
    );

    expect(screen.getByText('Aviso arriba')).toBeInTheDocument();
    expect(screen.getByText('Pie de pagina')).toBeInTheDocument();
  });

  it('nonEmptyFooter no se muestra con el carrito vacio', () => {
    renderSummary(
      <CartLinesSummary
        cart={{ status: 'success', lines: [], total: 0 }}
        onQuantityChange={vi.fn()}
        onRemove={vi.fn()}
        emptyStateDescription="Descripcion"
        nonEmptyFooter={<p>Pie de pagina</p>}
      />,
    );

    expect(screen.queryByText('Pie de pagina')).not.toBeInTheDocument();
  });
});

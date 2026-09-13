import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { ProductCard } from '@/features/products/components/ProductCard';
import { useCart } from '@/hooks/useCart';
import { buildCartContextValue } from '@/test/mocks/cartContextValue';
import type { Product } from '@shared/schemas/product';

vi.mock('@/hooks/useCart', () => ({ useCart: vi.fn() }));

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    name: 'Teclado mecanico X',
    nameLower: 'teclado mecanico x',
    description: 'Descripcion de prueba.',
    price: 89999,
    stock: 3,
    category: 'keyboard',
    displayColor: 'lime',
    imageUrl: 'https://placehold.co/600x400',
    isActive: true,
    specs: [{ label: 'Switches', value: 'Lineales rojos' }],
    curatorialNote: 'Nota curatorial de prueba.',
    ratingAverage: 4.5,
    ratingCount: 12,
    orderCount: 3,
    unitsSold: 5,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

function renderProductCard(product: Product) {
  function CardRoute() {
    return <ProductCard product={product} pieceNumber={1} />;
  }
  const Stub = createRoutesStub([{ path: '/', Component: CardRoute }]);
  return render(<Stub initialEntries={['/']} />);
}

describe('ProductCard', () => {
  it('el boton "Agregar" agrega una unidad al carrito sin navegar al detalle', () => {
    const addItem = vi.fn();
    vi.mocked(useCart).mockReturnValue(buildCartContextValue({ addItem }));

    renderProductCard(buildProduct({ stock: 5 }));
    fireEvent.click(screen.getByRole('button', { name: /agregar/i }));

    expect(addItem).toHaveBeenCalledWith('product-1', 1, 5);
  });

  it('con stock cero, el boton dice "Sin stock" y queda deshabilitado', () => {
    vi.mocked(useCart).mockReturnValue(buildCartContextValue());

    renderProductCard(buildProduct({ stock: 0 }));

    expect(screen.getByRole('button', { name: 'Sin stock' })).toBeDisabled();
  });

  it('sigue siendo un link al detalle del producto', () => {
    vi.mocked(useCart).mockReturnValue(buildCartContextValue());

    renderProductCard(buildProduct());

    expect(screen.getByRole('link')).toHaveAttribute('href', '/products/product-1');
  });
});

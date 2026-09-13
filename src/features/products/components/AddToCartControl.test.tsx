import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AddToCartControl } from '@/features/products/components/AddToCartControl';
import { useCart } from '@/hooks/useCart';
import { buildCartContextValue } from '@/test/mocks/cartContextValue';
import type { Product } from '@shared/schemas/product';

vi.mock('@/hooks/useCart', () => ({ useCart: vi.fn() }));

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

describe('AddToCartControl', () => {
  it('agrega la cantidad seleccionada en el stepper, no siempre 1', () => {
    const addItem = vi.fn();
    vi.mocked(useCart).mockReturnValue(buildCartContextValue({ addItem }));

    render(<AddToCartControl product={buildProduct({ stock: 5 })} />);

    fireEvent.click(screen.getByRole('button', { name: 'Sumar uno' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sumar uno' }));
    fireEvent.click(screen.getByRole('button', { name: 'Agregar al carrito' }));

    expect(addItem).toHaveBeenCalledWith('product-1', 3, 5);
  });

  it('sin stock, no muestra el selector de cantidad y deshabilita el boton', () => {
    vi.mocked(useCart).mockReturnValue(buildCartContextValue());

    render(<AddToCartControl product={buildProduct({ stock: 0 })} />);

    expect(screen.queryByRole('group', { name: /cantidad/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar al carrito' })).toBeDisabled();
  });
});

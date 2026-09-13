import { describe, expect, it } from 'vitest';
import { mergeGuestCart } from '@/features/cart/utils/mergeGuestCart';
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

describe('mergeGuestCart', () => {
  it('un producto presente en los dos carritos queda con la cantidad mayor, no la suma (ADR 0004)', () => {
    const result = mergeGuestCart(
      [{ productId: 'product-1', quantity: 3 }],
      [{ productId: 'product-1', quantity: 5 }],
      [buildProduct({ stock: 10 })],
    );

    expect(result.items).toEqual([{ productId: 'product-1', quantity: 5 }]);
    expect(result.exclusions).toEqual([]);
  });

  it('un producto solo en el carrito de invitado se conserva', () => {
    const result = mergeGuestCart(
      [{ productId: 'product-1', quantity: 2 }],
      [],
      [buildProduct({ stock: 10 })],
    );

    expect(result.items).toEqual([{ productId: 'product-1', quantity: 2 }]);
  });

  it('excluye un producto inactivo y explica por que (F5.7)', () => {
    const result = mergeGuestCart(
      [{ productId: 'product-1', quantity: 2 }],
      [],
      [buildProduct({ isActive: false })],
    );

    expect(result.items).toEqual([]);
    expect(result.exclusions).toEqual([
      { productId: 'product-1', productName: 'Teclado mecanico X', reason: 'inactive' },
    ]);
  });

  it('excluye un producto sin stock y explica por que (F5.7)', () => {
    const result = mergeGuestCart(
      [{ productId: 'product-1', quantity: 2 }],
      [],
      [buildProduct({ stock: 0 })],
    );

    expect(result.exclusions).toEqual([
      { productId: 'product-1', productName: 'Teclado mecanico X', reason: 'out-of-stock' },
    ]);
  });

  it('excluye un producto que ya no existe en el catalogo', () => {
    const result = mergeGuestCart([{ productId: 'borrado', quantity: 1 }], [], []);

    expect(result.items).toEqual([]);
    expect(result.exclusions).toEqual([
      { productId: 'borrado', productName: 'borrado', reason: 'inactive' },
    ]);
  });

  it('topea la cantidad fusionada al stock disponible', () => {
    const result = mergeGuestCart(
      [{ productId: 'product-1', quantity: 9 }],
      [{ productId: 'product-1', quantity: 8 }],
      [buildProduct({ stock: 3 })],
    );

    expect(result.items).toEqual([{ productId: 'product-1', quantity: 3 }]);
  });

  it('con los dos carritos vacios no hay items ni exclusiones', () => {
    const result = mergeGuestCart([], [], []);

    expect(result).toEqual({ items: [], exclusions: [] });
  });
});

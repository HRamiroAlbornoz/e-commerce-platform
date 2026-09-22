import { describe, expect, it } from 'vitest';
import {
  canHardDeleteProduct,
  hardDeleteUnavailableReason,
} from '@/features/admin/products/components/AdminProductRow';
import type { Product } from '@shared/schemas/product';

function buildProduct(
  overrides: Partial<Pick<Product, 'orderCount' | 'ratingCount'>> = {},
): Product {
  return {
    id: 'p1',
    name: 'Teclado Aurora',
    nameLower: 'teclado aurora',
    description: 'Descripcion',
    price: 100,
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

describe('canHardDeleteProduct', () => {
  it('permite el borrado definitivo sin ventas ni resenas (ADR 0005)', () => {
    expect(canHardDeleteProduct(buildProduct({ orderCount: 0, ratingCount: 0 }))).toBe(true);
  });

  it('lo bloquea si tiene al menos una venta', () => {
    expect(canHardDeleteProduct(buildProduct({ orderCount: 1, ratingCount: 0 }))).toBe(false);
  });

  it('lo bloquea si tiene al menos una resena', () => {
    expect(canHardDeleteProduct(buildProduct({ orderCount: 0, ratingCount: 1 }))).toBe(false);
  });
});

describe('hardDeleteUnavailableReason', () => {
  it('explica ventas y resenas cuando tiene ambas', () => {
    expect(hardDeleteUnavailableReason(buildProduct({ orderCount: 3, ratingCount: 5 }))).toBe(
      'Tiene 3 ventas y 5 reseñas registradas',
    );
  });

  it('explica solo ventas cuando no tiene resenas', () => {
    expect(hardDeleteUnavailableReason(buildProduct({ orderCount: 2, ratingCount: 0 }))).toBe(
      'Tiene 2 ventas registradas',
    );
  });

  it('explica solo resenas cuando no tiene ventas', () => {
    expect(hardDeleteUnavailableReason(buildProduct({ orderCount: 0, ratingCount: 4 }))).toBe(
      'Tiene 4 reseñas registradas',
    );
  });
});

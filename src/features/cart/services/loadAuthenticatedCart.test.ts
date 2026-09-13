import { describe, expect, it, vi, beforeEach } from 'vitest';
import { loadAuthenticatedCart } from '@/features/cart/services/loadAuthenticatedCart';
import { getCart } from '@/features/cart/services/getCart';
import { setCart } from '@/features/cart/services/setCart';
import { getProductsByIds } from '@/features/products/services/getProductsByIds';
import { clearGuestCart } from '@/features/cart/utils/guestCartStorage';
import type { Product } from '@shared/schemas/product';

vi.mock('@/features/cart/services/getCart', () => ({ getCart: vi.fn() }));
vi.mock('@/features/cart/services/setCart', () => ({ setCart: vi.fn() }));
vi.mock('@/features/products/services/getProductsByIds', () => ({ getProductsByIds: vi.fn() }));
vi.mock('@/features/cart/utils/guestCartStorage', () => ({ clearGuestCart: vi.fn() }));

function buildProduct(id: string, overrides: Partial<Product> = {}): Product {
  return {
    id,
    name: `Producto ${id}`,
    nameLower: `producto ${id}`,
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

describe('loadAuthenticatedCart', () => {
  beforeEach(() => {
    vi.mocked(getCart).mockReset();
    vi.mocked(setCart).mockReset().mockResolvedValue(undefined);
    vi.mocked(getProductsByIds).mockReset();
    vi.mocked(clearGuestCart).mockReset();
  });

  it('sin carrito de invitado, solo trae el carrito de Firestore y no toca el catalogo', async () => {
    vi.mocked(getCart).mockResolvedValue([{ productId: 'product-1', quantity: 2 }]);

    const result = await loadAuthenticatedCart('user-1', []);

    expect(result).toEqual({ items: [{ productId: 'product-1', quantity: 2 }], exclusions: [] });
    expect(getProductsByIds).not.toHaveBeenCalled();
    expect(setCart).not.toHaveBeenCalled();
    expect(clearGuestCart).not.toHaveBeenCalled();
  });

  it('con carrito de invitado, fusiona con el de Firestore y persiste el resultado (ADR 0004)', async () => {
    vi.mocked(getCart).mockResolvedValue([{ productId: 'product-1', quantity: 1 }]);
    vi.mocked(getProductsByIds).mockResolvedValue([buildProduct('product-1', { stock: 10 })]);

    const result = await loadAuthenticatedCart('user-1', [{ productId: 'product-1', quantity: 3 }]);

    expect(result.items).toEqual([{ productId: 'product-1', quantity: 3 }]);
    expect(setCart).toHaveBeenCalledWith('user-1', [{ productId: 'product-1', quantity: 3 }]);
  });

  it('borra el carrito de invitado recien despues de que Firestore confirmo la escritura', async () => {
    const callOrder: string[] = [];
    vi.mocked(getCart).mockResolvedValue([]);
    vi.mocked(getProductsByIds).mockResolvedValue([buildProduct('product-1', { stock: 10 })]);
    vi.mocked(setCart).mockImplementation(() => {
      callOrder.push('setCart');
      return Promise.resolve();
    });
    vi.mocked(clearGuestCart).mockImplementation(() => {
      callOrder.push('clearGuestCart');
    });

    await loadAuthenticatedCart('user-1', [{ productId: 'product-1', quantity: 1 }]);

    expect(callOrder).toEqual(['setCart', 'clearGuestCart']);
  });
});

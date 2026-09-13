import { describe, expect, it, vi } from 'vitest';
import { getCart } from '@/features/cart/services/getCart';

const { docMock, getDocMock } = vi.hoisted(() => {
  const withConverterMock = vi.fn(() => 'cart-ref-with-converter');
  return {
    docMock: vi.fn(() => ({ withConverter: withConverterMock })),
    getDocMock: vi.fn(),
  };
});

vi.mock('firebase/firestore', () => ({
  doc: docMock,
  getDoc: getDocMock,
}));

vi.mock('@/lib/firebase/client', () => ({ db: {} }));
vi.mock('@/lib/firebase/converters/cart', () => ({ cartConverter: {} }));

describe('getCart', () => {
  it('pide el documento correcto por uid', async () => {
    getDocMock.mockResolvedValue({
      metadata: { fromCache: false },
      exists: () => false,
      data: () => undefined,
    });

    await getCart('user-1');

    expect(docMock).toHaveBeenCalledWith({}, 'carts', 'user-1');
  });

  it('devuelve los items cuando el carrito existe', async () => {
    const items = [{ productId: 'product-1', quantity: 2 }];
    getDocMock.mockResolvedValue({
      metadata: { fromCache: false },
      exists: () => true,
      data: () => ({ items, updatedAt: new Date() }),
    });

    await expect(getCart('user-1')).resolves.toEqual(items);
  });

  it('devuelve un carrito vacio cuando el usuario todavia no tiene uno', async () => {
    getDocMock.mockResolvedValue({
      metadata: { fromCache: false },
      exists: () => false,
      data: () => undefined,
    });

    await expect(getCart('user-1')).resolves.toEqual([]);
  });

  it('rechaza si la respuesta viene de la cache local, no del servidor', async () => {
    getDocMock.mockResolvedValue({
      metadata: { fromCache: true },
      exists: () => false,
      data: () => undefined,
    });

    await expect(getCart('user-1')).rejects.toThrow();
  });
});

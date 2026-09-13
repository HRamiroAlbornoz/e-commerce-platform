import { describe, expect, it, vi } from 'vitest';
import { setCart } from '@/features/cart/services/setCart';

const { docMock, setDocMock, serverTimestampMock } = vi.hoisted(() => {
  const withConverterMock = vi.fn(() => 'cart-ref-with-converter');
  return {
    docMock: vi.fn(() => ({ withConverter: withConverterMock })),
    setDocMock: vi.fn().mockResolvedValue(undefined),
    serverTimestampMock: vi.fn(() => 'server-timestamp'),
  };
});

vi.mock('firebase/firestore', () => ({
  doc: docMock,
  setDoc: setDocMock,
  serverTimestamp: serverTimestampMock,
}));

vi.mock('@/lib/firebase/client', () => ({ db: {} }));
vi.mock('@/lib/firebase/converters/cart', () => ({ cartConverter: {} }));

describe('setCart', () => {
  it('escribe los items del carrito con un timestamp del servidor', async () => {
    const items = [{ productId: 'product-1', quantity: 2 }];

    await setCart('user-1', items);

    expect(docMock).toHaveBeenCalledWith({}, 'carts', 'user-1');
    expect(setDocMock).toHaveBeenCalledWith('cart-ref-with-converter', {
      items,
      updatedAt: 'server-timestamp',
    });
  });
});

import { describe, expect, it, vi } from 'vitest';
import { getOrderById } from '@/features/orders/services/getOrderById';

const { docMock, getDocMock } = vi.hoisted(() => {
  const withConverterMock = vi.fn(() => 'order-ref-with-converter');
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
vi.mock('@/lib/firebase/converters/order', () => ({ orderConverter: {} }));

function buildFirebaseError(code: string, message: string): Error {
  return Object.assign(new Error(message), { code, name: 'FirebaseError' });
}

describe('getOrderById', () => {
  it('pide el documento correcto por id', async () => {
    getDocMock.mockResolvedValue({ metadata: { fromCache: false }, exists: () => false, data: () => undefined });

    await getOrderById('order-1');

    expect(docMock).toHaveBeenCalledWith({}, 'orders', 'order-1');
  });

  it('devuelve la orden cuando existe', async () => {
    const order = { id: 'order-1' };
    getDocMock.mockResolvedValue({ metadata: { fromCache: false }, exists: () => true, data: () => order });

    await expect(getOrderById('order-1')).resolves.toEqual(order);
  });

  it('devuelve null cuando la orden no existe', async () => {
    getDocMock.mockResolvedValue({ metadata: { fromCache: false }, exists: () => false, data: () => undefined });

    await expect(getOrderById('order-1')).resolves.toBeNull();
  });

  it('devuelve null cuando Firestore deniega el acceso, sin distinguirlo de "no existe" (F7.2)', async () => {
    getDocMock.mockRejectedValue(buildFirebaseError('permission-denied', 'nope'));

    await expect(getOrderById('order-1')).resolves.toBeNull();
  });

  it('propaga cualquier otro error de Firestore', async () => {
    getDocMock.mockRejectedValue(buildFirebaseError('unavailable', 'red caida'));

    await expect(getOrderById('order-1')).rejects.toThrow();
  });
});

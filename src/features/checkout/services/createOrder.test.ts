import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';
import { createOrder } from '@/features/checkout/services/createOrder';
import type { CreateOrderRequest } from '@shared/schemas/order';

vi.mock('firebase/auth', () => ({ getIdToken: vi.fn().mockResolvedValue('fake-id-token') }));

const fakeUser = {} as User;

const request: CreateOrderRequest = {
  orderRequestId: '11111111-1111-1111-1111-111111111111',
  shipping: {
    fullName: 'Hernán Albornoz',
    address: 'Av. Siempre Viva 742',
    city: 'Springfield',
    postalCode: '1000',
    phone: '1122334455',
  },
  payment: { cardholderName: 'Hernán Albornoz', method: 'card', outcome: 'success' },
  expectedItems: [{ productId: 'product-1', quantity: 1, unitPrice: 29999 }],
};

function mockFetchResponse(status: number, body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

describe('createOrder', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('envia el token y el body correctos a /api/orders/create', async () => {
    mockFetchResponse(200, { orderId: 'order-1' });

    await createOrder(fakeUser, request);

    expect(fetch).toHaveBeenCalledWith('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer fake-id-token' },
      body: JSON.stringify(request),
    });
  });

  it('con una respuesta 200 valida, devuelve el id de la orden', async () => {
    mockFetchResponse(200, { orderId: 'order-1' });

    const result = await createOrder(fakeUser, request);

    expect(result).toEqual({ ok: true, orderId: 'order-1' });
  });

  it('con un error de negocio del servidor, devuelve el mensaje que nombra el producto', async () => {
    mockFetchResponse(409, {
      code: 'OUT_OF_STOCK',
      message: 'Nos quedamos sin stock de "Mousepad PowerPad".',
      details: { productId: 'product-1' },
    });

    const result = await createOrder(fakeUser, request);

    expect(result).toEqual({ ok: false, message: 'Nos quedamos sin stock de "Mousepad PowerPad".' });
  });

  it('con una respuesta de error que no tiene el formato esperado, devuelve un mensaje generico', async () => {
    mockFetchResponse(500, { unexpected: true });

    const result = await createOrder(fakeUser, request);

    expect(result).toEqual({ ok: false, message: 'No pudimos procesar tu compra. Intentá de nuevo.' });
  });

  it('si la red falla, devuelve un mensaje generico en vez de propagar la excepcion', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const result = await createOrder(fakeUser, request);

    expect(result).toEqual({ ok: false, message: 'No pudimos procesar tu compra. Intentá de nuevo.' });
  });
});

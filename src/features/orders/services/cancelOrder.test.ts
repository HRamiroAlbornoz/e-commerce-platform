import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';
import { cancelOrder } from '@/features/orders/services/cancelOrder';

vi.mock('firebase/auth', () => ({ getIdToken: vi.fn().mockResolvedValue('fake-id-token') }));

const fakeUser = {} as User;

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

describe('cancelOrder', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('envia el token y el orderId correctos a /api/orders/cancel', async () => {
    mockFetchResponse(200, { orderId: 'order-1', status: 'cancelled' });

    await cancelOrder(fakeUser, 'order-1');

    expect(fetch).toHaveBeenCalledWith('/api/orders/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer fake-id-token' },
      body: JSON.stringify({ orderId: 'order-1' }),
    });
  });

  it('con una respuesta 200 valida, devuelve ok', async () => {
    mockFetchResponse(200, { orderId: 'order-1', status: 'cancelled' });

    await expect(cancelOrder(fakeUser, 'order-1')).resolves.toEqual({ ok: true });
  });

  it('con un error de negocio del servidor, devuelve el mensaje', async () => {
    mockFetchResponse(409, { code: 'INVALID_STATUS_TRANSITION', message: 'Esta orden ya no se puede cancelar.' });

    const result = await cancelOrder(fakeUser, 'order-1');

    expect(result).toEqual({ ok: false, message: 'Esta orden ya no se puede cancelar.' });
  });

  it('si la red falla, devuelve un mensaje generico en vez de propagar la excepcion', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const result = await cancelOrder(fakeUser, 'order-1');

    expect(result).toEqual({ ok: false, message: 'No pudimos cancelar la orden. Intentá de nuevo.' });
  });
});

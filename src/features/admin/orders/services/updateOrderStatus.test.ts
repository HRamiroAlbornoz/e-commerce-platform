import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';
import { updateOrderStatus } from '@/features/admin/orders/services/updateOrderStatus';

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

describe('updateOrderStatus', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('envia el token, el orderId y el estado correctos a /api/admin/orders/update-status', async () => {
    mockFetchResponse(200, { orderId: 'order-1', status: 'processing' });

    await updateOrderStatus(fakeUser, 'order-1', 'processing');

    expect(fetch).toHaveBeenCalledWith('/api/admin/orders/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer fake-id-token' },
      body: JSON.stringify({ orderId: 'order-1', status: 'processing' }),
    });
  });

  it('con una respuesta 200 valida, devuelve ok', async () => {
    mockFetchResponse(200, { orderId: 'order-1', status: 'processing' });

    await expect(updateOrderStatus(fakeUser, 'order-1', 'processing')).resolves.toEqual({
      ok: true,
    });
  });

  it('con un error de negocio del servidor, devuelve el mensaje', async () => {
    mockFetchResponse(409, {
      code: 'INVALID_STATUS_TRANSITION',
      message: 'Esta orden no puede pasar de "completed" a "processing".',
      retryable: false,
    });

    const result = await updateOrderStatus(fakeUser, 'order-1', 'processing');

    expect(result).toEqual({
      ok: false,
      message: 'Esta orden no puede pasar de "completed" a "processing".',
    });
  });

  it('si la red falla, devuelve un mensaje generico en vez de propagar la excepcion', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const result = await updateOrderStatus(fakeUser, 'order-1', 'cancelled');

    expect(result).toEqual({
      ok: false,
      message: 'No pudimos cambiar el estado de la orden. Intenta de nuevo.',
    });
  });
});

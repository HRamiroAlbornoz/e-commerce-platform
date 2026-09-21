import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOrdersSummary } from '@/features/admin/analytics/hooks/useOrdersSummary';
import { getOrdersSummary } from '@/features/admin/analytics/services/getOrdersSummary';

vi.mock('@/features/admin/analytics/services/getOrdersSummary', () => ({
  getOrdersSummary: vi.fn(),
}));

describe('useOrdersSummary', () => {
  it('arranca en loading y pasa a success con el resumen (F12.1)', async () => {
    vi.mocked(getOrdersSummary).mockResolvedValue({ totalRevenue: 50000, totalOrders: 3 });

    const { result } = renderHook(() => useOrdersSummary());

    expect(result.current.status).toBe('loading');

    await waitFor(() => {
      expect(result.current).toMatchObject({
        status: 'success',
        summary: { totalRevenue: 50000, totalOrders: 3 },
      });
    });
  });

  it('pasa a error con un mensaje amigable si la consulta falla', async () => {
    vi.mocked(getOrdersSummary).mockRejectedValue(new Error('network-error'));

    const { result } = renderHook(() => useOrdersSummary());

    await waitFor(() => {
      expect(result.current).toMatchObject({
        status: 'error',
        message: 'No pudimos cargar el resumen de ventas. Intentá de nuevo.',
      });
    });
  });

  it('el retry vuelve a consultar el servicio', async () => {
    vi.mocked(getOrdersSummary).mockResolvedValue({ totalRevenue: 0, totalOrders: 0 });

    const { result } = renderHook(() => useOrdersSummary());

    await waitFor(() => expect(getOrdersSummary).toHaveBeenCalledTimes(1));

    result.current.retry();

    await waitFor(() => expect(getOrdersSummary).toHaveBeenCalledTimes(2));
  });
});

import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useKeyedAsync } from '@/hooks/useKeyedAsync';

describe('useKeyedAsync', () => {
  it('arranca en loading y pasa a success con el dato', async () => {
    const fetcher = vi.fn().mockResolvedValue('resultado');

    const { result } = renderHook(() => useKeyedAsync('key-1', fetcher, 'Error generico'));

    expect(result.current.status).toBe('loading');

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current).toMatchObject({ status: 'success', data: 'resultado' });
  });

  it('pasa a error con el mensaje provisto si el fetcher falla', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useKeyedAsync('key-1', fetcher, 'Error amigable'));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current).toMatchObject({ status: 'error', message: 'Error amigable' });
  });

  it('vuelve a loading y refetchea cuando cambia la key', async () => {
    const fetcher = vi.fn().mockResolvedValue('a');

    const { result, rerender } = renderHook(
      ({ key }: { key: string }) => useKeyedAsync(key, fetcher, 'Error'),
      {
        initialProps: { key: 'key-a' },
      },
    );

    await waitFor(() => expect(result.current.status).toBe('success'));

    fetcher.mockResolvedValue('b');
    rerender({ key: 'key-b' });

    expect(result.current.status).toBe('loading');

    await waitFor(() => {
      expect(result.current).toMatchObject({ status: 'success', data: 'b' });
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('retry vuelve a llamar al fetcher y puede recuperarse de un error', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce('ok');

    const { result } = renderHook(() => useKeyedAsync('key-1', fetcher, 'Error'));

    await waitFor(() => expect(result.current.status).toBe('error'));

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current).toMatchObject({ status: 'success', data: 'ok' });
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

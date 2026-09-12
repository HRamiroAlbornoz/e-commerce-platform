import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

describe('useDebouncedValue', () => {
  it('mantiene el valor inicial de inmediato', () => {
    const { result } = renderHook(() => useDebouncedValue('teclado', 300));

    expect(result.current).toBe('teclado');
  });

  it('no actualiza el valor mientras no pasa el tiempo de espera', () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'te' },
    });

    rerender({ value: 'tec' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('te');

    vi.useRealTimers();
  });

  it('actualiza al valor mas reciente una vez pasado el tiempo de espera, sin pasar por los valores intermedios', () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'te' },
    });

    rerender({ value: 'tec' });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: 'tecl' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('tecl');

    vi.useRealTimers();
  });
});

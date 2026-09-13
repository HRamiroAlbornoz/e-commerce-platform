import { vi } from 'vitest';
import type { CartContextValue } from '@/contexts/CartContext';

export function buildCartContextValue(overrides: Partial<CartContextValue> = {}): CartContextValue {
  return {
    items: [],
    addItem: vi.fn(),
    setQuantity: vi.fn(),
    removeItem: vi.fn(),
    mergeExclusions: [],
    dismissMergeExclusions: vi.fn(),
    ...overrides,
  };
}

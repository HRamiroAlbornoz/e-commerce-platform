import { describe, expect, it } from 'vitest';
import {
  OrderError,
  orderErrorHttpStatus,
  toOrderErrorResponse,
} from './orderErrors.js';

describe('orderErrorHttpStatus', () => {
  it('mapea cada codigo de negocio al status HTTP correcto', () => {
    expect(orderErrorHttpStatus('UNAUTHENTICATED')).toBe(401);
    expect(orderErrorHttpStatus('INVALID_REQUEST')).toBe(400);
    expect(orderErrorHttpStatus('EMPTY_CART')).toBe(400);
    expect(orderErrorHttpStatus('PRODUCT_UNAVAILABLE')).toBe(409);
    expect(orderErrorHttpStatus('OUT_OF_STOCK')).toBe(409);
    expect(orderErrorHttpStatus('PRICE_CHANGED')).toBe(409);
    expect(orderErrorHttpStatus('CART_CHANGED')).toBe(409);
    expect(orderErrorHttpStatus('ORDER_NOT_FOUND')).toBe(404);
    expect(orderErrorHttpStatus('INVALID_STATUS_TRANSITION')).toBe(409);
    expect(orderErrorHttpStatus('INTERNAL_ERROR')).toBe(500);
  });
});

describe('toOrderErrorResponse', () => {
  it('sin producto asociado, no incluye el campo details', () => {
    const error = new OrderError('EMPTY_CART', 'Tu carrito está vacío.');

    expect(toOrderErrorResponse(error)).toEqual({
      code: 'EMPTY_CART',
      message: 'Tu carrito está vacío.',
    });
  });

  it('con un producto asociado, lo incluye en details', () => {
    const error = new OrderError('OUT_OF_STOCK', 'Nos quedamos sin stock de "X".', 'product-1');

    expect(toOrderErrorResponse(error)).toEqual({
      code: 'OUT_OF_STOCK',
      message: 'Nos quedamos sin stock de "X".',
      details: { productId: 'product-1' },
    });
  });
});

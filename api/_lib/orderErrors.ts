import type { VercelResponse } from '@vercel/node';
import type { OrderErrorCode, OrderErrorResponse } from '../../shared/schemas/order.js';

const ORDER_ERROR_HTTP_STATUS: Record<OrderErrorCode, number> = {
  UNAUTHENTICATED: 401,
  INVALID_REQUEST: 400,
  EMPTY_CART: 400,
  PRODUCT_UNAVAILABLE: 409,
  OUT_OF_STOCK: 409,
  PRICE_CHANGED: 409,
  CART_CHANGED: 409,
  ORDER_NOT_FOUND: 404,
  INVALID_STATUS_TRANSITION: 409,
  INTERNAL_ERROR: 500,
};

export class OrderError extends Error {
  readonly code: OrderErrorCode;
  readonly productId: string | undefined;

  constructor(code: OrderErrorCode, message: string, productId?: string) {
    super(message);
    this.code = code;
    this.productId = productId;
  }
}

export function orderErrorHttpStatus(code: OrderErrorCode): number {
  return ORDER_ERROR_HTTP_STATUS[code];
}

export function toOrderErrorResponse(error: OrderError): OrderErrorResponse {
  return {
    code: error.code,
    message: error.message,
    ...(error.productId ? { details: { productId: error.productId } } : {}),
  };
}

export function logOrderError(requestId: string, error: OrderError): void {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      requestId,
      code: error.code,
      message: error.message,
    }),
  );
}

export function respondWithError(res: VercelResponse, requestId: string, error: OrderError): void {
  logOrderError(requestId, error);
  res.status(orderErrorHttpStatus(error.code)).json(toOrderErrorResponse(error));
}

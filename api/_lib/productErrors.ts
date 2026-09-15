import type { VercelResponse } from '@vercel/node';
import type { ProductErrorCode, ProductErrorResponse } from '../../shared/schemas/product.js';

const PRODUCT_ERROR_HTTP_STATUS: Record<ProductErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  INVALID_REQUEST: 400,
  PRODUCT_NOT_FOUND: 404,
  PRODUCT_HAS_REFERENCES: 409,
  INTERNAL_ERROR: 500,
};

export class ProductError extends Error {
  readonly code: ProductErrorCode;
  readonly details: { orderCount: number; ratingCount: number } | undefined;

  constructor(
    code: ProductErrorCode,
    message: string,
    details?: { orderCount: number; ratingCount: number },
  ) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export function productErrorHttpStatus(code: ProductErrorCode): number {
  return PRODUCT_ERROR_HTTP_STATUS[code];
}

export function toProductErrorResponse(error: ProductError): ProductErrorResponse {
  return {
    code: error.code,
    message: error.message,
    ...(error.details ? { details: error.details } : {}),
  };
}

export function logProductError(requestId: string, error: ProductError): void {
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

export function respondWithError(
  res: VercelResponse,
  requestId: string,
  error: ProductError,
): void {
  logProductError(requestId, error);
  res.status(productErrorHttpStatus(error.code)).json(toProductErrorResponse(error));
}

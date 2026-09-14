import type { VercelResponse } from '@vercel/node';
import type { ReviewErrorCode, ReviewErrorResponse } from '../../shared/schemas/review.js';

const REVIEW_ERROR_HTTP_STATUS: Record<ReviewErrorCode, number> = {
  UNAUTHENTICATED: 401,
  INVALID_REQUEST: 400,
  PRODUCT_NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

export class ReviewError extends Error {
  readonly code: ReviewErrorCode;

  constructor(code: ReviewErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export function reviewErrorHttpStatus(code: ReviewErrorCode): number {
  return REVIEW_ERROR_HTTP_STATUS[code];
}

export function toReviewErrorResponse(error: ReviewError): ReviewErrorResponse {
  return {
    code: error.code,
    message: error.message,
  };
}

export function logReviewError(requestId: string, error: ReviewError): void {
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

export function respondWithError(res: VercelResponse, requestId: string, error: ReviewError): void {
  logReviewError(requestId, error);
  res.status(reviewErrorHttpStatus(error.code)).json(toReviewErrorResponse(error));
}

import type { VercelResponse } from '@vercel/node';
import type { UploadErrorCode, UploadErrorResponse } from '../../shared/schemas/upload.js';

const UPLOAD_ERROR_HTTP_STATUS: Record<UploadErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  INVALID_REQUEST: 400,
  INTERNAL_ERROR: 500,
};

const UPLOAD_ERROR_RETRYABLE: Record<UploadErrorCode, boolean> = {
  UNAUTHENTICATED: false,
  FORBIDDEN: false,
  INVALID_REQUEST: false,
  INTERNAL_ERROR: true,
};

export class UploadError extends Error {
  readonly code: UploadErrorCode;

  constructor(code: UploadErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export function uploadErrorHttpStatus(code: UploadErrorCode): number {
  return UPLOAD_ERROR_HTTP_STATUS[code];
}

export function toUploadErrorResponse(error: UploadError): UploadErrorResponse {
  return {
    code: error.code,
    message: error.message,
    retryable: UPLOAD_ERROR_RETRYABLE[error.code],
  };
}

export function logUploadError(requestId: string, error: UploadError): void {
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

export function respondWithError(res: VercelResponse, requestId: string, error: UploadError): void {
  logUploadError(requestId, error);
  res.status(uploadErrorHttpStatus(error.code)).json(toUploadErrorResponse(error));
}

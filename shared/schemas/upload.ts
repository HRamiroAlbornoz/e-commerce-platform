import { z } from 'zod';

export const IMAGE_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const imageContentTypeSchema = z.enum(IMAGE_CONTENT_TYPES);

export type ImageContentType = z.infer<typeof imageContentTypeSchema>;

export const IMAGE_CONTENT_TYPE_EXTENSIONS: Record<ImageContentType, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const presignUploadRequestSchema = z.object({
  contentType: imageContentTypeSchema,
  fileSize: z.number().int().positive().max(MAX_IMAGE_SIZE_BYTES),
});

export type PresignUploadRequest = z.infer<typeof presignUploadRequestSchema>;

export const presignUploadResponseSchema = z.object({
  uploadUrl: z.url(),
  publicUrl: z.url(),
});

export type PresignUploadResponse = z.infer<typeof presignUploadResponseSchema>;

export const UPLOAD_ERROR_CODES = [
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'INVALID_REQUEST',
  'INTERNAL_ERROR',
] as const;

export const uploadErrorCodeSchema = z.enum(UPLOAD_ERROR_CODES);

export type UploadErrorCode = z.infer<typeof uploadErrorCodeSchema>;

export const uploadErrorResponseSchema = z.object({
  code: uploadErrorCodeSchema,
  message: z.string().min(1),
  retryable: z.boolean(),
});

export type UploadErrorResponse = z.infer<typeof uploadErrorResponseSchema>;

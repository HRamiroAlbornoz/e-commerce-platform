import { z } from 'zod';
import { productIdSchema } from './product.js';

export const reviewInputSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(500),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;

export const reviewSchema = reviewInputSchema.extend({
  userId: z.string().min(1),
  displayName: z.string().min(1).max(120),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Review = z.infer<typeof reviewSchema>;

export const recalculateRatingRequestSchema = z.object({
  productId: productIdSchema,
});

export type RecalculateRatingRequest = z.infer<typeof recalculateRatingRequestSchema>;

export const recalculateRatingResponseSchema = z.object({
  productId: z.string().min(1),
  ratingAverage: z.number().min(0).max(5),
  ratingCount: z.number().int().nonnegative(),
});

export type RecalculateRatingResponse = z.infer<typeof recalculateRatingResponseSchema>;

export const REVIEW_ERROR_CODES = [
  'UNAUTHENTICATED',
  'INVALID_REQUEST',
  'PRODUCT_NOT_FOUND',
  'INTERNAL_ERROR',
] as const;

export const reviewErrorCodeSchema = z.enum(REVIEW_ERROR_CODES);

export type ReviewErrorCode = z.infer<typeof reviewErrorCodeSchema>;

export const reviewErrorResponseSchema = z.object({
  code: reviewErrorCodeSchema,
  message: z.string().min(1),
  retryable: z.boolean(),
});

export type ReviewErrorResponse = z.infer<typeof reviewErrorResponseSchema>;

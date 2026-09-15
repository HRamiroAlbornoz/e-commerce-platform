import { z } from 'zod';

export const PRODUCT_CATEGORIES = [
  'keyboard',
  'mouse',
  'headset',
  'monitor',
  'chair',
  'mousepad',
] as const;

export const productCategorySchema = z.enum(PRODUCT_CATEGORIES);

export type ProductCategory = z.infer<typeof productCategorySchema>;

export const PRODUCT_DISPLAY_COLORS = ['lime', 'magenta', 'cyan', 'amber'] as const;

export const productDisplayColorSchema = z.enum(PRODUCT_DISPLAY_COLORS);

export type ProductDisplayColor = z.infer<typeof productDisplayColorSchema>;

export const productSpecSchema = z.object({
  label: z.string().min(1).max(60),
  value: z.string().min(1).max(120),
});

export type ProductSpec = z.infer<typeof productSpecSchema>;

export const productInputSchema = z.object({
  name: z.string().min(1).max(120),
  nameLower: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  category: productCategorySchema,
  displayColor: productDisplayColorSchema,
  imageUrl: z.url(),
  isActive: z.boolean(),
  specs: z.array(productSpecSchema).min(1).max(12),
  curatorialNote: z.string().min(1).max(600),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export const productSchema = productInputSchema.extend({
  id: z.string().min(1),
  ratingAverage: z.number().min(0).max(5),
  ratingCount: z.number().int().nonnegative(),
  orderCount: z.number().int().nonnegative(),
  unitsSold: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Product = z.infer<typeof productSchema>;

export function toNameLower(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export const productIdSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[A-Za-z0-9_-]+$/);

export const createProductRequestSchema = productInputSchema.omit({
  nameLower: true,
  isActive: true,
});

export type CreateProductRequest = z.infer<typeof createProductRequestSchema>;

export const createProductResponseSchema = z.object({
  productId: z.string().min(1),
});

export type CreateProductResponse = z.infer<typeof createProductResponseSchema>;

export const updateProductRequestSchema = z
  .object({
    productId: productIdSchema,
    changes: productInputSchema.omit({ nameLower: true }).partial(),
  })
  .refine((body) => Object.keys(body.changes).length > 0, {
    message: 'No hay cambios para aplicar.',
    path: ['changes'],
  });

export type UpdateProductRequest = z.infer<typeof updateProductRequestSchema>;

export const updateProductResponseSchema = z.object({
  productId: z.string().min(1),
});

export type UpdateProductResponse = z.infer<typeof updateProductResponseSchema>;

export const deleteProductRequestSchema = z.object({
  productId: productIdSchema,
});

export type DeleteProductRequest = z.infer<typeof deleteProductRequestSchema>;

export const deleteProductResponseSchema = z.object({
  productId: z.string().min(1),
});

export type DeleteProductResponse = z.infer<typeof deleteProductResponseSchema>;

export const PRODUCT_ERROR_CODES = [
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'INVALID_REQUEST',
  'PRODUCT_NOT_FOUND',
  'PRODUCT_HAS_REFERENCES',
  'INTERNAL_ERROR',
] as const;

export const productErrorCodeSchema = z.enum(PRODUCT_ERROR_CODES);

export type ProductErrorCode = z.infer<typeof productErrorCodeSchema>;

export const productErrorResponseSchema = z.object({
  code: productErrorCodeSchema,
  message: z.string().min(1),
  details: z
    .object({
      orderCount: z.number().int().nonnegative(),
      ratingCount: z.number().int().nonnegative(),
    })
    .optional(),
});

export type ProductErrorResponse = z.infer<typeof productErrorResponseSchema>;

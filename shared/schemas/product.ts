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

export const productInputSchema = z.object({
  name: z.string().min(1).max(120),
  nameLower: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  category: productCategorySchema,
  imageUrl: z.url(),
  isActive: z.boolean(),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export const productSchema = productInputSchema.extend({
  id: z.string().min(1),
  ratingAverage: z.number().min(0).max(5),
  ratingCount: z.number().int().nonnegative(),
  orderCount: z.number().int().nonnegative(),
  unitsSold: z.number().int().nonnegative(),
});

export type Product = z.infer<typeof productSchema>;

export function toNameLower(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

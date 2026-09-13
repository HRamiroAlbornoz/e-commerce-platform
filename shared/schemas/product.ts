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

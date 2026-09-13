import { z } from 'zod';

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const guestCartSchema = z.object({
  items: z.array(cartItemSchema),
});

export type GuestCart = z.infer<typeof guestCartSchema>;

export const cartSchema = guestCartSchema.extend({
  updatedAt: z.date(),
});

export type Cart = z.infer<typeof cartSchema>;

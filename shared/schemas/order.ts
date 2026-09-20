import { z } from 'zod';
import { paymentDraftSchema, shippingDetailsSchema } from './checkout.js';

export const SHIPPING_COST = 4999;

export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1).max(120),
  unitPrice: z.number().positive(),
  imageUrl: z.url(),
  quantity: z.number().int().positive(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;

export const ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'] as const;

export const orderStatusSchema = z.enum(ORDER_STATUSES);

export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function isValidOrderStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}

export const orderSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  items: z.array(orderItemSchema).min(1),
  subtotal: z.number().nonnegative(),
  shippingCost: z.number().nonnegative(),
  total: z.number().nonnegative(),
  status: orderStatusSchema,
  shipping: shippingDetailsSchema,
  payment: paymentDraftSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Order = z.infer<typeof orderSchema>;

export const expectedCartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});

export type ExpectedCartItem = z.infer<typeof expectedCartItemSchema>;

export const createOrderRequestSchema = z
  .object({
    orderRequestId: z.uuid(),
    shipping: shippingDetailsSchema,
    payment: paymentDraftSchema,
    expectedItems: z.array(expectedCartItemSchema).min(1),
  })
  .refine((body) => body.payment.outcome === 'success', {
    message: 'No se puede crear una orden con un pago simulado rechazado.',
  });

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

export const createOrderResponseSchema = z.object({
  orderId: z.string().min(1),
});

export type CreateOrderResponse = z.infer<typeof createOrderResponseSchema>;

export const orderIdSchema = z.uuid();

export const cancelOrderRequestSchema = z.object({
  orderId: orderIdSchema,
});

export type CancelOrderRequest = z.infer<typeof cancelOrderRequestSchema>;

export const cancelOrderResponseSchema = z.object({
  orderId: z.string().min(1),
  status: orderStatusSchema,
});

export type CancelOrderResponse = z.infer<typeof cancelOrderResponseSchema>;

export const updateOrderStatusRequestSchema = z.object({
  orderId: orderIdSchema,
  status: orderStatusSchema,
});

export type UpdateOrderStatusRequest = z.infer<typeof updateOrderStatusRequestSchema>;

export const updateOrderStatusResponseSchema = cancelOrderResponseSchema;

export type UpdateOrderStatusResponse = z.infer<typeof updateOrderStatusResponseSchema>;

export const ORDER_ERROR_CODES = [
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'INVALID_REQUEST',
  'EMPTY_CART',
  'PRODUCT_UNAVAILABLE',
  'OUT_OF_STOCK',
  'PRICE_CHANGED',
  'CART_CHANGED',
  'ORDER_NOT_FOUND',
  'INVALID_STATUS_TRANSITION',
  'INTERNAL_ERROR',
] as const;

export const orderErrorCodeSchema = z.enum(ORDER_ERROR_CODES);

export type OrderErrorCode = z.infer<typeof orderErrorCodeSchema>;

export const orderErrorResponseSchema = z.object({
  code: orderErrorCodeSchema,
  message: z.string().min(1),
  details: z.object({ productId: z.string().min(1) }).optional(),
});

export type OrderErrorResponse = z.infer<typeof orderErrorResponseSchema>;

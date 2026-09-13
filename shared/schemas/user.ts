import { z } from 'zod';

export const ROLES = ['customer', 'admin'] as const;

export const roleSchema = z.enum(ROLES);

export type Role = z.infer<typeof roleSchema>;

export const userSchema = z.object({
  uid: z.string().min(1),
  email: z.email(),
  displayName: z.string().min(1).max(80),
  role: roleSchema,
  createdAt: z.date(),
});

export type User = z.infer<typeof userSchema>;

import { z } from 'zod';

export const MIN_PASSWORD_LENGTH = 8;

export const registerFormSchema = z.object({
  displayName: z.string().min(1, 'Ingresá tu nombre.').max(80),
  email: z.email('Ingresá un email válido.'),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const loginFormSchema = z.object({
  email: z.email('Ingresá un email válido.'),
  password: z.string().min(1, 'Ingresá tu contraseña.'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const forgotPasswordFormSchema = z.object({
  email: z.email('Ingresá un email válido.'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

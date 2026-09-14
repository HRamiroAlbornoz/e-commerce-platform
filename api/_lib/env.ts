import { z } from 'zod';

const envSchema = z.object({
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().min(1),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const missingKeys = parsedEnv.error.issues.map((issue) => issue.path.join('.')).join(', ');
  throw new Error(`Variables de entorno invalidas o faltantes: ${missingKeys}`);
}

export const env = parsedEnv.data;

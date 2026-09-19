import { z } from 'zod';

const s3EnvSchema = z.object({
  S3_REGION: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
});

const parsedS3Env = s3EnvSchema.safeParse(process.env);

if (!parsedS3Env.success) {
  const missingKeys = parsedS3Env.error.issues.map((issue) => issue.path.join('.')).join(', ');
  throw new Error(`Variables de entorno de AWS invalidas o faltantes: ${missingKeys}`);
}

export const s3Env = parsedS3Env.data;

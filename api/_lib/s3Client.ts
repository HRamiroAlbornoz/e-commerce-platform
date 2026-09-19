import { S3Client } from '@aws-sdk/client-s3';
import { s3Env } from './s3Env.js';

export const s3Client = new S3Client({
  region: s3Env.S3_REGION,
  credentials: {
    accessKeyId: s3Env.S3_ACCESS_KEY_ID,
    secretAccessKey: s3Env.S3_SECRET_ACCESS_KEY,
  },
});

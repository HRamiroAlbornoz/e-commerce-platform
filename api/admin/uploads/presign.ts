import { randomUUID } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../../_lib/s3Client.js';
import { s3Env } from '../../_lib/s3Env.js';
import { requireAdmin } from '../../_lib/requireAdmin.js';
import { UploadError, respondWithError } from '../../_lib/uploadErrors.js';
import {
  presignUploadRequestSchema,
  IMAGE_CONTENT_TYPE_EXTENSIONS,
  type PresignUploadResponse,
} from '../../../shared/schemas/upload.js';

const PRESIGNED_URL_EXPIRES_IN_SECONDS = 300;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const requestId = randomUUID();

  const auth = await requireAdmin(
    req,
    res,
    requestId,
    (code, message) => new UploadError(code, message),
    respondWithError,
  );
  if (!auth) {
    return;
  }

  const parsedBody = presignUploadRequestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    respondWithError(
      res,
      requestId,
      new UploadError('INVALID_REQUEST', 'El tipo o el tamaño del archivo no son válidos.'),
    );
    return;
  }

  const { contentType } = parsedBody.data;

  try {
    const key = `products/${randomUUID()}${IMAGE_CONTENT_TYPE_EXTENSIONS[contentType]}`;
    const command = new PutObjectCommand({
      Bucket: s3Env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRES_IN_SECONDS,
      signableHeaders: new Set(['content-type']),
    });
    const publicUrl = `https://${s3Env.S3_BUCKET}.s3.${s3Env.S3_REGION}.amazonaws.com/${key}`;

    const response: PresignUploadResponse = { uploadUrl, publicUrl };
    res.status(200).json(response);
  } catch {
    respondWithError(
      res,
      requestId,
      new UploadError('INTERNAL_ERROR', 'No pudimos preparar la subida. Intentá de nuevo.'),
    );
  }
}

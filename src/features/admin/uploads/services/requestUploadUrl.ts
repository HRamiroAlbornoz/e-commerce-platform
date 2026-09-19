import type { User } from 'firebase/auth';
import { postJsonRequest } from '@/lib/apiRequest';
import {
  presignUploadResponseSchema,
  uploadErrorResponseSchema,
  type ImageContentType,
} from '@shared/schemas/upload';

const GENERIC_PRESIGN_ERROR = 'No pudimos preparar la subida. Intentá de nuevo.';

export type RequestUploadUrlResult =
  { ok: true; uploadUrl: string; publicUrl: string } | { ok: false; message: string };

export async function requestUploadUrl(
  user: User,
  contentType: ImageContentType,
  fileSize: number,
): Promise<RequestUploadUrlResult> {
  const result = await postJsonRequest(
    user,
    '/api/admin/uploads/presign',
    { contentType, fileSize },
    presignUploadResponseSchema,
    uploadErrorResponseSchema,
    GENERIC_PRESIGN_ERROR,
  );

  return result.ok ? { ok: true, ...result.data } : result;
}

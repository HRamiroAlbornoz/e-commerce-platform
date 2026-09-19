import { useCallback, useState } from 'react';
import type { User } from 'firebase/auth';
import { requestUploadUrl } from '@/features/admin/uploads/services/requestUploadUrl';
import { uploadFileToS3 } from '@/features/admin/uploads/services/uploadFileToS3';
import { imageContentTypeSchema, MAX_IMAGE_SIZE_BYTES } from '@shared/schemas/upload';

export type ImageUploadState =
  | { status: 'idle' }
  | { status: 'requesting-url' }
  | { status: 'uploading'; progress: number }
  | { status: 'error'; message: string }
  | { status: 'success'; publicUrl: string };

export type ImageUploadOutcome = { ok: true; publicUrl: string } | { ok: false };

const INVALID_TYPE_MESSAGE = 'Formato no soportado. Usá JPG, PNG o WEBP.';
const TOO_LARGE_MESSAGE = 'La imagen no puede superar los 5 MB.';

export function useImageUpload(user: User): {
  state: ImageUploadState;
  upload: (file: File) => Promise<ImageUploadOutcome>;
} {
  const [state, setState] = useState<ImageUploadState>({ status: 'idle' });

  const upload = useCallback(
    async (file: File): Promise<ImageUploadOutcome> => {
      const parsedContentType = imageContentTypeSchema.safeParse(file.type);
      if (!parsedContentType.success) {
        setState({ status: 'error', message: INVALID_TYPE_MESSAGE });
        return { ok: false };
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setState({ status: 'error', message: TOO_LARGE_MESSAGE });
        return { ok: false };
      }

      setState({ status: 'requesting-url' });
      const presignResult = await requestUploadUrl(user, parsedContentType.data, file.size);
      if (!presignResult.ok) {
        setState({ status: 'error', message: presignResult.message });
        return { ok: false };
      }

      setState({ status: 'uploading', progress: 0 });
      const uploadResult = await uploadFileToS3(presignResult.uploadUrl, file, (progress) => {
        setState({ status: 'uploading', progress });
      });
      if (!uploadResult.ok) {
        setState({ status: 'error', message: uploadResult.message });
        return { ok: false };
      }

      setState({ status: 'success', publicUrl: presignResult.publicUrl });
      return { ok: true, publicUrl: presignResult.publicUrl };
    },
    [user],
  );

  return { state, upload };
}

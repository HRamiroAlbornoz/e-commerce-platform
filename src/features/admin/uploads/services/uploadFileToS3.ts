export type UploadFileResult = { ok: true } | { ok: false; message: string };

const EXPIRED_URL_MESSAGE = 'La URL para subir venció. Volvé a intentar.';
const GENERIC_UPLOAD_ERROR = 'No pudimos subir la imagen. Intenta de nuevo.';

export function uploadFileToS3(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<UploadFileResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round(((event.loaded / event.total) * 100) / 5) * 5;
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ ok: true });
        return;
      }
      resolve({
        ok: false,
        message: xhr.status === 403 ? EXPIRED_URL_MESSAGE : GENERIC_UPLOAD_ERROR,
      });
    });

    xhr.addEventListener('error', () => {
      resolve({ ok: false, message: GENERIC_UPLOAD_ERROR });
    });

    xhr.send(file);
  });
}

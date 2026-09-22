import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { uploadFileToS3 } from '@/features/admin/uploads/services/uploadFileToS3';

type Listener = () => void;

class FakeXhr {
  static instances: FakeXhr[] = [];

  status = 0;
  openedWith: { method: string; url: string } | undefined;
  headers: Record<string, string> = {};
  sentBody: unknown;

  private loadListeners: Listener[] = [];
  private errorListeners: Listener[] = [];
  private progressListener: ((event: ProgressEvent) => void) | undefined;

  upload = {
    addEventListener: (event: string, listener: (event: ProgressEvent) => void) => {
      if (event === 'progress') {
        this.progressListener = listener;
      }
    },
  };

  constructor() {
    FakeXhr.instances.push(this);
  }

  open(method: string, url: string): void {
    this.openedWith = { method, url };
  }

  setRequestHeader(name: string, value: string): void {
    this.headers[name] = value;
  }

  addEventListener(event: string, listener: Listener): void {
    if (event === 'load') {
      this.loadListeners.push(listener);
    }
    if (event === 'error') {
      this.errorListeners.push(listener);
    }
  }

  send(body: unknown): void {
    this.sentBody = body;
  }

  emitProgress(loaded: number, total: number): void {
    this.progressListener?.({ lengthComputable: true, loaded, total } as ProgressEvent);
  }

  emitLoad(status: number): void {
    this.status = status;
    this.loadListeners.forEach((listener) => listener());
  }

  emitError(): void {
    this.errorListeners.forEach((listener) => listener());
  }
}

function jpegFile(): File {
  return new File([new Uint8Array(10)], 'foto.jpg', { type: 'image/jpeg' });
}

beforeEach(() => {
  FakeXhr.instances = [];
  vi.stubGlobal('XMLHttpRequest', FakeXhr);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('uploadFileToS3', () => {
  it('hace PUT con el Content-Type del archivo y reporta progreso', async () => {
    const onProgress = vi.fn();
    const resultPromise = uploadFileToS3(
      'https://bucket.s3.amazonaws.com/signed',
      jpegFile(),
      onProgress,
    );

    const xhr = FakeXhr.instances[0];
    expect(xhr?.openedWith).toEqual({
      method: 'PUT',
      url: 'https://bucket.s3.amazonaws.com/signed',
    });
    expect(xhr?.headers['Content-Type']).toBe('image/jpeg');

    xhr?.emitProgress(50, 100);
    expect(onProgress).toHaveBeenCalledWith(50);

    xhr?.emitLoad(200);
    await expect(resultPromise).resolves.toEqual({ ok: true });
  });

  it('con un 403 de S3, resuelve con el mensaje de URL vencida', async () => {
    const resultPromise = uploadFileToS3(
      'https://bucket.s3.amazonaws.com/signed',
      jpegFile(),
      vi.fn(),
    );

    FakeXhr.instances[0]?.emitLoad(403);

    await expect(resultPromise).resolves.toEqual({
      ok: false,
      message: 'La URL para subir venció. Volvé a intentar.',
    });
  });

  it('con un error de red, resuelve con el mensaje generico', async () => {
    const resultPromise = uploadFileToS3(
      'https://bucket.s3.amazonaws.com/signed',
      jpegFile(),
      vi.fn(),
    );

    FakeXhr.instances[0]?.emitError();

    await expect(resultPromise).resolves.toEqual({
      ok: false,
      message: 'No pudimos subir la imagen. Intenta de nuevo.',
    });
  });
});

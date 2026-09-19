import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { User } from 'firebase/auth';
import { useImageUpload } from '@/features/admin/uploads/hooks/useImageUpload';
import { requestUploadUrl } from '@/features/admin/uploads/services/requestUploadUrl';
import { uploadFileToS3 } from '@/features/admin/uploads/services/uploadFileToS3';

vi.mock('@/features/admin/uploads/services/requestUploadUrl', () => ({
  requestUploadUrl: vi.fn(),
}));
vi.mock('@/features/admin/uploads/services/uploadFileToS3', () => ({ uploadFileToS3: vi.fn() }));

const fakeUser = {} as User;

function jpegFile(sizeInBytes = 1000): File {
  const file = new File([new Uint8Array(sizeInBytes)], 'foto.jpg', { type: 'image/jpeg' });
  return file;
}

describe('useImageUpload', () => {
  it('sube un archivo valido: idle -> requesting-url -> uploading -> success', async () => {
    vi.mocked(requestUploadUrl).mockResolvedValue({
      ok: true,
      uploadUrl: 'https://bucket.s3.amazonaws.com/signed',
      publicUrl: 'https://bucket.s3.amazonaws.com/products/abc.jpg',
    });
    vi.mocked(uploadFileToS3).mockImplementation((_url, _file, onProgress) => {
      onProgress(50);
      onProgress(100);
      return Promise.resolve({ ok: true });
    });

    const { result } = renderHook(() => useImageUpload(fakeUser));
    expect(result.current.state).toEqual({ status: 'idle' });

    let outcome;
    await act(async () => {
      outcome = await result.current.upload(jpegFile());
    });

    expect(outcome).toEqual({
      ok: true,
      publicUrl: 'https://bucket.s3.amazonaws.com/products/abc.jpg',
    });
    expect(result.current.state).toEqual({
      status: 'success',
      publicUrl: 'https://bucket.s3.amazonaws.com/products/abc.jpg',
    });
  });

  it('rechaza un tipo de archivo no soportado sin llamar a la funcion (validacion en el cliente)', async () => {
    const { result } = renderHook(() => useImageUpload(fakeUser));
    const heicFile = new File([new Uint8Array(10)], 'foto.heic', { type: 'image/heic' });

    await act(async () => {
      await result.current.upload(heicFile);
    });

    expect(result.current.state).toEqual({
      status: 'error',
      message: 'Formato no soportado. Usá JPG, PNG o WEBP.',
    });
    expect(requestUploadUrl).not.toHaveBeenCalled();
  });

  it('rechaza un archivo demasiado grande sin llamar a la funcion', async () => {
    const { result } = renderHook(() => useImageUpload(fakeUser));
    const oversizedFile = jpegFile(6 * 1024 * 1024);

    await act(async () => {
      await result.current.upload(oversizedFile);
    });

    expect(result.current.state).toEqual({
      status: 'error',
      message: 'La imagen no puede superar los 5 MB.',
    });
    expect(requestUploadUrl).not.toHaveBeenCalled();
  });

  it('si pedir la URL prefirmada falla, el estado queda en error con el mensaje del servicio', async () => {
    vi.mocked(requestUploadUrl).mockResolvedValue({
      ok: false,
      message: 'No pudimos preparar la subida.',
    });

    const { result } = renderHook(() => useImageUpload(fakeUser));

    await act(async () => {
      await result.current.upload(jpegFile());
    });

    expect(result.current.state).toEqual({
      status: 'error',
      message: 'No pudimos preparar la subida.',
    });
    expect(uploadFileToS3).not.toHaveBeenCalled();
  });

  it('si la subida a S3 falla, el estado queda en error con el mensaje del servicio', async () => {
    vi.mocked(requestUploadUrl).mockResolvedValue({
      ok: true,
      uploadUrl: 'https://bucket.s3.amazonaws.com/signed',
      publicUrl: 'https://bucket.s3.amazonaws.com/products/abc.jpg',
    });
    vi.mocked(uploadFileToS3).mockResolvedValue({
      ok: false,
      message: 'La URL para subir venció.',
    });

    const { result } = renderHook(() => useImageUpload(fakeUser));

    await act(async () => {
      await result.current.upload(jpegFile());
    });

    await waitFor(() => {
      expect(result.current.state).toEqual({
        status: 'error',
        message: 'La URL para subir venció.',
      });
    });
  });
});

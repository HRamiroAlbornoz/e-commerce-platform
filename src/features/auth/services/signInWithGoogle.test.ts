import { describe, expect, it, vi } from 'vitest';
import { FirebaseError } from 'firebase/app';
import { signInWithGoogle } from '@/features/auth/services/signInWithGoogle';
import { createUserDocument } from '@/features/auth/services/createUserDocument';

const { signInWithPopupMock, docMock, getDocMock } = vi.hoisted(() => ({
  signInWithPopupMock: vi.fn(),
  docMock: vi.fn(() => ({ withConverter: vi.fn(() => 'user-ref') })),
  getDocMock: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: signInWithPopupMock,
}));

vi.mock('firebase/firestore', () => ({
  doc: docMock,
  getDoc: getDocMock,
}));

vi.mock('@/lib/firebase/client', () => ({ auth: {}, db: {} }));
vi.mock('@/lib/firebase/converters/user', () => ({ userConverter: {} }));

vi.mock('@/features/auth/services/createUserDocument', () => ({
  createUserDocument: vi.fn(),
}));

describe('signInWithGoogle', () => {
  it('crea el documento de usuario cuando es la primera vez que entra con Google', async () => {
    signInWithPopupMock.mockResolvedValue({
      user: { uid: 'uid-1', email: 'cliente@gmail.com', displayName: 'Cliente Google' },
    });
    getDocMock.mockResolvedValue({ metadata: { fromCache: false }, exists: () => false });

    const result = await signInWithGoogle();

    expect(result).toEqual({ ok: true });
    expect(createUserDocument).toHaveBeenCalledWith('uid-1', 'cliente@gmail.com', 'Cliente Google');
  });

  it('no crea el documento si ya existe (usuario que ya se registro antes)', async () => {
    signInWithPopupMock.mockResolvedValue({
      user: { uid: 'uid-1', email: 'cliente@gmail.com', displayName: 'Cliente Google' },
    });
    getDocMock.mockResolvedValue({ metadata: { fromCache: false }, exists: () => true });

    const result = await signInWithGoogle();

    expect(result).toEqual({ ok: true });
    expect(createUserDocument).not.toHaveBeenCalled();
  });

  it('usa el email como nombre si Google no informa displayName', async () => {
    signInWithPopupMock.mockResolvedValue({
      user: { uid: 'uid-1', email: 'cliente@gmail.com', displayName: null },
    });
    getDocMock.mockResolvedValue({ metadata: { fromCache: false }, exists: () => false });

    await signInWithGoogle();

    expect(createUserDocument).toHaveBeenCalledWith('uid-1', 'cliente@gmail.com', 'cliente@gmail.com');
  });

  it('falla de forma controlada si Google no entrega un email', async () => {
    signInWithPopupMock.mockResolvedValue({
      user: { uid: 'uid-1', email: null, displayName: null },
    });
    getDocMock.mockResolvedValue({ metadata: { fromCache: false }, exists: () => false });

    const result = await signInWithGoogle();

    expect(result.ok).toBe(false);
    expect(createUserDocument).not.toHaveBeenCalled();
  });

  it('falla de forma controlada si la confirmacion del documento viene de la cache local', async () => {
    signInWithPopupMock.mockResolvedValue({
      user: { uid: 'uid-1', email: 'cliente@gmail.com', displayName: 'Cliente Google' },
    });
    getDocMock.mockResolvedValue({ metadata: { fromCache: true }, exists: () => false });

    const result = await signInWithGoogle();

    expect(result.ok).toBe(false);
    expect(createUserDocument).not.toHaveBeenCalled();
  });

  it('devuelve un mensaje amigable si el usuario cierra el popup', async () => {
    signInWithPopupMock.mockRejectedValue(
      new FirebaseError('auth/popup-closed-by-user', 'Popup closed'),
    );

    const result = await signInWithGoogle();

    expect(result).toEqual({
      ok: false,
      message: 'Cerraste la ventana de Google antes de terminar.',
    });
  });
});

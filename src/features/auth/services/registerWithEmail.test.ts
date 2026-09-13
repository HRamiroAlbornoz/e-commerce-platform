import { describe, expect, it, vi } from 'vitest';
import { FirebaseError } from 'firebase/app';
import { registerWithEmail } from '@/features/auth/services/registerWithEmail';
import { createUserDocument } from '@/features/auth/services/createUserDocument';

const { createUserWithEmailAndPasswordMock, updateProfileMock } = vi.hoisted(() => ({
  createUserWithEmailAndPasswordMock: vi.fn(),
  updateProfileMock: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: createUserWithEmailAndPasswordMock,
  updateProfile: updateProfileMock,
}));

vi.mock('@/lib/firebase/client', () => ({ auth: {} }));

vi.mock('@/features/auth/services/createUserDocument', () => ({
  createUserDocument: vi.fn(),
}));

describe('registerWithEmail', () => {
  it('crea la cuenta, actualiza el nombre y crea el documento de usuario', async () => {
    createUserWithEmailAndPasswordMock.mockResolvedValue({ user: { uid: 'uid-1' } });

    const result = await registerWithEmail({
      email: 'nueva@clack.com',
      password: 'contrasena123',
      displayName: 'Nueva Cliente',
    });

    expect(result).toEqual({ ok: true });
    expect(updateProfileMock).toHaveBeenCalledWith({ uid: 'uid-1' }, { displayName: 'Nueva Cliente' });
    expect(createUserDocument).toHaveBeenCalledWith('uid-1', 'nueva@clack.com', 'Nueva Cliente');
  });

  it('devuelve el error asociado al campo email cuando ya existe una cuenta', async () => {
    createUserWithEmailAndPasswordMock.mockRejectedValue(
      new FirebaseError('auth/email-already-in-use', 'Email already in use'),
    );

    const result = await registerWithEmail({
      email: 'existente@clack.com',
      password: 'contrasena123',
      displayName: 'Cliente',
    });

    expect(result).toEqual({
      ok: false,
      field: 'email',
      message: 'Ya existe una cuenta con este email.',
    });
  });

  it('devuelve un mensaje generico sin campo para otros errores de Firebase', async () => {
    createUserWithEmailAndPasswordMock.mockRejectedValue(
      new FirebaseError('auth/network-request-failed', 'Network error'),
    );

    const result = await registerWithEmail({
      email: 'cliente@clack.com',
      password: 'contrasena123',
      displayName: 'Cliente',
    });

    expect(result).toEqual({
      ok: false,
      message: 'No pudimos conectar. Revisá tu conexión e intentá de nuevo.',
    });
  });

  it('devuelve un mensaje generico cuando el error no viene de Firebase', async () => {
    createUserWithEmailAndPasswordMock.mockRejectedValue(new Error('boom'));

    const result = await registerWithEmail({
      email: 'cliente@clack.com',
      password: 'contrasena123',
      displayName: 'Cliente',
    });

    expect(result).toEqual({ ok: false, message: 'Ocurrió un error. Intentá de nuevo.' });
  });
});

import { describe, expect, it, vi } from 'vitest';
import { FirebaseError } from 'firebase/app';
import { loginWithEmail } from '@/features/auth/services/loginWithEmail';

const { signInWithEmailAndPasswordMock } = vi.hoisted(() => ({
  signInWithEmailAndPasswordMock: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: signInWithEmailAndPasswordMock,
}));

vi.mock('@/lib/firebase/client', () => ({ auth: {} }));

const GENERIC_MESSAGE = 'El email o la contraseña son incorrectos.';

describe('loginWithEmail', () => {
  it('devuelve ok cuando las credenciales son correctas', async () => {
    signInWithEmailAndPasswordMock.mockResolvedValue({});

    await expect(loginWithEmail({ email: 'a@clack.com', password: '12345678' })).resolves.toEqual({
      ok: true,
    });
  });

  it('nunca revela si el email existe: contraseña incorrecta da el mismo mensaje que usuario inexistente', async () => {
    signInWithEmailAndPasswordMock.mockRejectedValueOnce(
      new FirebaseError('auth/wrong-password', 'Wrong password'),
    );
    const wrongPasswordResult = await loginWithEmail({ email: 'a@clack.com', password: 'mala' });

    signInWithEmailAndPasswordMock.mockRejectedValueOnce(
      new FirebaseError('auth/user-not-found', 'User not found'),
    );
    const noUserResult = await loginWithEmail({ email: 'no-existe@clack.com', password: 'x' });

    expect(wrongPasswordResult).toEqual({ ok: false, message: GENERIC_MESSAGE });
    expect(noUserResult).toEqual({ ok: false, message: GENERIC_MESSAGE });
  });

  it('muestra un mensaje especifico ante demasiados intentos', async () => {
    signInWithEmailAndPasswordMock.mockRejectedValue(
      new FirebaseError('auth/too-many-requests', 'Too many requests'),
    );

    const result = await loginWithEmail({ email: 'a@clack.com', password: 'x' });

    expect(result).toEqual({
      ok: false,
      message: 'Demasiados intentos. Esperá un momento e intentá de nuevo.',
    });
  });

  it('devuelve el mensaje generico cuando el error no viene de Firebase', async () => {
    signInWithEmailAndPasswordMock.mockRejectedValue(new Error('boom'));

    const result = await loginWithEmail({ email: 'a@clack.com', password: 'x' });

    expect(result).toEqual({ ok: false, message: GENERIC_MESSAGE });
  });
});

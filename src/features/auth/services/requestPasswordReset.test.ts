import { describe, expect, it, vi } from 'vitest';
import { FirebaseError } from 'firebase/app';
import { requestPasswordReset } from '@/features/auth/services/requestPasswordReset';

const { sendPasswordResetEmailMock } = vi.hoisted(() => ({
  sendPasswordResetEmailMock: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  sendPasswordResetEmail: sendPasswordResetEmailMock,
}));

vi.mock('@/lib/firebase/client', () => ({ auth: {} }));

describe('requestPasswordReset', () => {
  it('confirma el envio cuando la cuenta existe', async () => {
    sendPasswordResetEmailMock.mockResolvedValue(undefined);

    await expect(requestPasswordReset('existe@clack.com')).resolves.toEqual({ ok: true });
  });

  it('confirma el envio igual cuando la cuenta no existe, para no revelarlo', async () => {
    sendPasswordResetEmailMock.mockRejectedValue(
      new FirebaseError('auth/user-not-found', 'User not found'),
    );

    await expect(requestPasswordReset('no-existe@clack.com')).resolves.toEqual({ ok: true });
  });

  it('devuelve un error real ante una falla de conexion', async () => {
    sendPasswordResetEmailMock.mockRejectedValue(new Error('network down'));

    await expect(requestPasswordReset('cliente@clack.com')).resolves.toEqual({
      ok: false,
      message: 'No pudimos enviar el correo. Intentá de nuevo.',
    });
  });
});

import { sendPasswordResetEmail } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase/client';
import type { AuthResult } from '@/features/auth/types/authResult';

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { ok: true };
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'auth/user-not-found') {
      return { ok: true };
    }

    return { ok: false, message: 'No pudimos enviar el correo. Intentá de nuevo.' };
  }
}

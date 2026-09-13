import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase/client';
import { getAuthErrorMessage } from '@/lib/firebase/authErrorMessages';
import type { AuthResult } from '@/features/auth/types/authResult';

const GENERIC_LOGIN_ERROR = 'El email o la contraseña son incorrectos.';

const LOGIN_VISIBLE_ERROR_CODES = ['auth/too-many-requests', 'auth/network-request-failed'];

type LoginInput = {
  email: string;
  password: string;
};

export async function loginWithEmail({ email, password }: LoginInput): Promise<AuthResult> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { ok: true };
  } catch (error) {
    if (error instanceof FirebaseError && LOGIN_VISIBLE_ERROR_CODES.includes(error.code)) {
      return { ok: false, message: getAuthErrorMessage(error.code) };
    }

    return { ok: false, message: GENERIC_LOGIN_ERROR };
  }
}

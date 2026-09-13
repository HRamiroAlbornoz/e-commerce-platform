import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase/client';
import { createUserDocument } from '@/features/auth/services/createUserDocument';
import { getAuthErrorMessage } from '@/lib/firebase/authErrorMessages';
import type { AuthResult } from '@/features/auth/types/authResult';

type RegisterInput = {
  email: string;
  password: string;
  displayName: string;
};

export async function registerWithEmail({
  email,
  password,
  displayName,
}: RegisterInput): Promise<AuthResult> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await Promise.all([
      updateProfile(credential.user, { displayName }),
      createUserDocument(credential.user.uid, email, displayName),
    ]);
    return { ok: true };
  } catch (error) {
    if (!(error instanceof FirebaseError)) {
      return { ok: false, message: getAuthErrorMessage('') };
    }

    if (error.code === 'auth/email-already-in-use') {
      return { ok: false, message: getAuthErrorMessage(error.code), field: 'email' };
    }

    return { ok: false, message: getAuthErrorMessage(error.code) };
  }
}

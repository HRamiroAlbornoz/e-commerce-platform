import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { auth, db } from '@/lib/firebase/client';
import { assertFromServer } from '@/lib/firebase/assertFromServer';
import { createUserDocument } from '@/features/auth/services/createUserDocument';
import { userConverter } from '@/lib/firebase/converters/user';
import { getAuthErrorMessage } from '@/lib/firebase/authErrorMessages';
import type { AuthResult } from '@/features/auth/types/authResult';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    const userRef = doc(db, 'users', credential.user.uid).withConverter(userConverter);
    const snapshot = await getDoc(userRef);
    assertFromServer(snapshot, 'No pudimos confirmar tu cuenta con el servidor.');

    if (!snapshot.exists()) {
      if (!credential.user.email) {
        return { ok: false, message: 'No pudimos obtener tu email de Google. Intentá de nuevo.' };
      }

      const displayName = credential.user.displayName ?? credential.user.email;
      await createUserDocument(credential.user.uid, credential.user.email, displayName);
    }

    return { ok: true };
  } catch (error) {
    const code = error instanceof FirebaseError ? error.code : '';
    return { ok: false, message: getAuthErrorMessage(code) };
  }
}

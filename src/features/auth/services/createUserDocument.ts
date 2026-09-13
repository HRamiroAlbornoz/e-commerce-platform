import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { userConverter } from '@/lib/firebase/converters/user';

export async function createUserDocument(
  uid: string,
  email: string,
  displayName: string,
): Promise<void> {
  const userRef = doc(db, 'users', uid).withConverter(userConverter);

  await setDoc(userRef, {
    uid,
    email,
    displayName,
    role: 'customer',
    createdAt: serverTimestamp(),
  });
}

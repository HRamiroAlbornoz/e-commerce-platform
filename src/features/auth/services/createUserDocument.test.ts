import { describe, expect, it, vi } from 'vitest';
import { createUserDocument } from '@/features/auth/services/createUserDocument';

const { docMock, setDocMock, serverTimestampMock } = vi.hoisted(() => {
  const withConverterMock = vi.fn(() => 'user-ref-with-converter');
  return {
    docMock: vi.fn(() => ({ withConverter: withConverterMock })),
    setDocMock: vi.fn(),
    serverTimestampMock: vi.fn(() => 'server-timestamp'),
  };
});

vi.mock('firebase/firestore', () => ({
  doc: docMock,
  setDoc: setDocMock,
  serverTimestamp: serverTimestampMock,
}));

vi.mock('@/lib/firebase/client', () => ({ db: {} }));
vi.mock('@/lib/firebase/converters/user', () => ({ userConverter: {} }));

describe('createUserDocument', () => {
  it('escribe el documento con role customer y la marca de tiempo del servidor', async () => {
    await createUserDocument('uid-1', 'ana@clack.com', 'Ana');

    expect(docMock).toHaveBeenCalledWith({}, 'users', 'uid-1');
    expect(setDocMock).toHaveBeenCalledWith('user-ref-with-converter', {
      uid: 'uid-1',
      email: 'ana@clack.com',
      displayName: 'Ana',
      role: 'customer',
      createdAt: 'server-timestamp',
    });
  });
});

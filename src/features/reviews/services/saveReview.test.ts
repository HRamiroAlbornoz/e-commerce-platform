import { describe, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';
import { saveReview } from '@/features/reviews/services/saveReview';

const { docMock, setDocMock, serverTimestampMock } = vi.hoisted(() => {
  const withConverterMock = vi.fn(() => 'review-ref-with-converter');
  return {
    docMock: vi.fn(() => ({ withConverter: withConverterMock })),
    setDocMock: vi.fn().mockResolvedValue(undefined),
    serverTimestampMock: vi.fn(() => 'server-timestamp'),
  };
});

vi.mock('firebase/firestore', () => ({
  doc: docMock,
  setDoc: setDocMock,
  serverTimestamp: serverTimestampMock,
}));

vi.mock('@/lib/firebase/client', () => ({ db: {} }));
vi.mock('@/lib/firebase/converters/review', () => ({ reviewConverter: {} }));

function buildUser(overrides: Partial<User> = {}): User {
  return { uid: 'user-1', displayName: 'Hernán', ...overrides } as User;
}

describe('saveReview', () => {
  it('escribe la reseña en products/{productId}/reviews/{uid}', async () => {
    await saveReview(buildUser(), 'product-1', { rating: 5, comment: 'Excelente' });

    expect(docMock).toHaveBeenCalledWith({}, 'products', 'product-1', 'reviews', 'user-1');
  });

  it('al crear por primera vez, usa un timestamp del servidor como createdAt', async () => {
    await saveReview(buildUser(), 'product-1', { rating: 5, comment: 'Excelente' });

    expect(setDocMock).toHaveBeenCalledWith('review-ref-with-converter', {
      userId: 'user-1',
      displayName: 'Hernán',
      rating: 5,
      comment: 'Excelente',
      createdAt: 'server-timestamp',
      updatedAt: 'server-timestamp',
    });
  });

  it('al editar, conserva el createdAt original en vez de generar uno nuevo', async () => {
    const originalCreatedAt = new Date('2026-01-01');

    await saveReview(buildUser(), 'product-1', { rating: 3, comment: 'Cambié de opinión' }, originalCreatedAt);

    expect(setDocMock).toHaveBeenCalledWith(
      'review-ref-with-converter',
      expect.objectContaining({ createdAt: originalCreatedAt, updatedAt: 'server-timestamp' }),
    );
  });

  it('si el usuario no tiene displayName, usa un nombre genérico', async () => {
    await saveReview(buildUser({ displayName: null }), 'product-1', { rating: 4, comment: 'Bien' });

    expect(setDocMock).toHaveBeenCalledWith(
      'review-ref-with-converter',
      expect.objectContaining({ displayName: 'Usuario' }),
    );
  });
});

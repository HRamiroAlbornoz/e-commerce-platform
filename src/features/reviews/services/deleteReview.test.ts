import { describe, expect, it, vi } from 'vitest';
import { deleteReview } from '@/features/reviews/services/deleteReview';

const { docMock, deleteDocMock } = vi.hoisted(() => ({
  docMock: vi.fn(() => 'review-ref'),
  deleteDocMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('firebase/firestore', () => ({
  doc: docMock,
  deleteDoc: deleteDocMock,
}));

vi.mock('@/lib/firebase/client', () => ({ db: {} }));

describe('deleteReview', () => {
  it('borra el documento products/{productId}/reviews/{uid}', async () => {
    await deleteReview('product-1', 'user-1');

    expect(docMock).toHaveBeenCalledWith({}, 'products', 'product-1', 'reviews', 'user-1');
    expect(deleteDocMock).toHaveBeenCalledWith('review-ref');
  });
});

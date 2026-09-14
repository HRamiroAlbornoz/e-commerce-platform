import { useState } from 'react';
import { Link, useParams } from 'react-router';
import type { AuthContextValue } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { useProduct } from '@/features/products/hooks/useProduct';
import { useProductReviews } from '@/features/reviews/hooks/useProductReviews';
import { ReviewForm } from '@/features/reviews/components/ReviewForm';
import { ReviewListItem } from '@/features/reviews/components/ReviewListItem';
import { ReviewsSkeleton } from '@/features/reviews/components/ReviewsSkeleton';
import { DeleteReviewModal } from '@/features/reviews/components/DeleteReviewModal';
import { recalculateProductRating } from '@/features/reviews/services/recalculateProductRating';
import { DestructiveTriggerButton } from '@/components/ui/DestructiveTriggerButton';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { buildRedirectState } from '@/routes/redirectState';
import type { Product } from '@shared/schemas/product';
import type { Review } from '@shared/schemas/review';

type ProductReviewsSectionProps = {
  product: Product;
  auth: AuthContextValue;
  reviews: Review[];
  retry: () => void;
};

function ProductReviewsSection({ product, auth, reviews, retry }: ProductReviewsSectionProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const ratingCount = reviews.length;
  const ratingAverage =
    ratingCount > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / ratingCount : 0;
  const myReview =
    auth.status === 'authenticated' ? (reviews.find((review) => review.userId === auth.user.uid) ?? null) : null;

  function handleChanged(): void {
    retry();
    if (auth.status === 'authenticated') {
      void recalculateProductRating(auth.user, product.id);
    }
  }

  return (
    <>
      <p className="font-body text-sm text-ink/70 dark:text-bone/70">
        {ratingCount > 0 ? `${ratingAverage.toFixed(1)} · ${ratingCount} reseñas` : 'Todavia sin reseñas'}
      </p>

      {auth.status === 'authenticated' ? (
        <div className="flex flex-col gap-4 border-t border-ink/15 pt-8 dark:border-bone/15">
          <ReviewForm
            key={myReview?.userId ?? 'new'}
            productId={product.id}
            user={auth.user}
            existingReview={myReview}
            onSaved={handleChanged}
          />

          {myReview ? (
            <div>
              <DestructiveTriggerButton onClick={() => setIsDeleteModalOpen(true)}>
                Borrar mi reseña
              </DestructiveTriggerButton>
            </div>
          ) : null}

          {isDeleteModalOpen && myReview ? (
            <DeleteReviewModal
              productId={product.id}
              productName={product.name}
              user={auth.user}
              onClose={() => setIsDeleteModalOpen(false)}
              onDeleted={() => {
                setIsDeleteModalOpen(false);
                handleChanged();
              }}
            />
          ) : null}
        </div>
      ) : null}

      {auth.status === 'anonymous' ? (
        <p className="font-body border-t border-ink/15 pt-8 text-sm text-ink/80 dark:border-bone/15 dark:text-bone/80">
          <Link
            to="/login"
            state={buildRedirectState(`/products/${product.id}/reviews`)}
            className="underline decoration-1 underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:focus-visible:outline-field-cyan"
          >
            Iniciá sesión
          </Link>{' '}
          para dejar tu reseña.
        </p>
      ) : null}

      <div className="border-t border-ink/15 pt-8 dark:border-bone/15">
        {ratingCount === 0 ? (
          <EmptyState
            title="Todavía no hay reseñas"
            description="Sé la primera persona en opinar sobre este producto."
          />
        ) : (
          <ul className="divide-y divide-dotted divide-ink/30 dark:divide-bone/30">
            {reviews.map((review) => (
              <ReviewListItem key={review.userId} review={review} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export function ProductReviewsPage() {
  const { id } = useParams<{ id: string }>();
  const auth = useAuth();
  const productDetail = useProduct(id);
  const reviewsState = useProductReviews(id);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 md:px-8 md:py-16">
      {productDetail.status === 'loading' ? <ReviewsSkeleton /> : null}

      {productDetail.status === 'not-found' ? (
        <EmptyState
          title="Producto no encontrado"
          description="Este producto no existe o ya no está disponible."
        />
      ) : null}

      {productDetail.status === 'error' ? (
        <ErrorState message={productDetail.message} onRetry={productDetail.retry} />
      ) : null}

      {productDetail.status === 'success' ? (
        <>
          <div className="flex flex-col gap-1">
            <Link
              to={`/products/${productDetail.product.id}`}
              className="font-body text-xs tracking-widest text-ink/70 uppercase hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:text-bone/70 dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
            >
              Volver al producto
            </Link>
            <h2 className="font-display text-3xl text-ink dark:text-bone">
              Reseñas de {productDetail.product.name}
            </h2>
          </div>

          {reviewsState.status === 'loading' ? <ReviewsSkeleton /> : null}
          {reviewsState.status === 'error' ? (
            <ErrorState message={reviewsState.message} onRetry={reviewsState.retry} />
          ) : null}
          {reviewsState.status === 'success' ? (
            <ProductReviewsSection
              product={productDetail.product}
              auth={auth}
              reviews={reviewsState.reviews}
              retry={reviewsState.retry}
            />
          ) : null}
        </>
      ) : null}
    </main>
  );
}

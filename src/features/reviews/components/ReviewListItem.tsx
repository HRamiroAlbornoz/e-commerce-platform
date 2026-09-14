import { RatingDisplay } from '@/features/reviews/components/RatingDisplay';
import { formatDate } from '@/lib/formatDate';
import type { Review } from '@shared/schemas/review';

type ReviewListItemProps = {
  review: Review;
};

export function ReviewListItem({ review }: ReviewListItemProps) {
  return (
    <li className="flex flex-col gap-2 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-body text-sm font-medium text-ink dark:text-bone">
          {review.displayName}
        </p>
        <p className="font-body text-xs text-ink/70 dark:text-bone/70">
          {formatDate(review.updatedAt)}
        </p>
      </div>
      <RatingDisplay rating={review.rating} />
      <p className="font-body text-sm text-ink/80 dark:text-bone/80">{review.comment}</p>
    </li>
  );
}

const SEGMENT_COUNT = 5;
const SEGMENTS = Array.from({ length: SEGMENT_COUNT }, (_, index) => index + 1);

type RatingDisplayProps = {
  rating: number;
};

export function RatingDisplay({ rating }: RatingDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <div role="img" aria-label={`Calificación: ${rating} de ${SEGMENT_COUNT}`} className="flex gap-0.5">
        {SEGMENTS.map((segment) => (
          <span
            key={segment}
            aria-hidden="true"
            className={
              segment <= rating
                ? 'h-3 w-3 bg-ink dark:bg-bone'
                : 'h-3 w-3 border border-ink/50 dark:border-bone/40'
            }
          />
        ))}
      </div>
      <span className="font-body text-sm text-ink dark:text-bone">
        {rating}/{SEGMENT_COUNT}
      </span>
    </div>
  );
}

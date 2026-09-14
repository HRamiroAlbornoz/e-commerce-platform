function ReviewRowSkeleton() {
  return (
    <li className="flex flex-col gap-2 py-4" aria-hidden="true">
      <div className="flex items-center justify-between gap-2">
        <div className="motion-safe:animate-pulse h-4 w-24 bg-ink/10 dark:bg-bone/10" />
        <div className="motion-safe:animate-pulse h-3 w-16 bg-ink/10 dark:bg-bone/10" />
      </div>
      <div className="motion-safe:animate-pulse h-3 w-28 bg-ink/10 dark:bg-bone/10" />
      <div className="motion-safe:animate-pulse h-4 w-full bg-ink/10 dark:bg-bone/10" />
    </li>
  );
}

export function ReviewsSkeleton() {
  return (
    <ul className="divide-y divide-dotted divide-ink/30 dark:divide-bone/30">
      <ReviewRowSkeleton />
      <ReviewRowSkeleton />
      <ReviewRowSkeleton />
    </ul>
  );
}

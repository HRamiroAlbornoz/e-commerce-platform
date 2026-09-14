function OrderRowSkeleton() {
  return (
    <li className="flex items-center justify-between gap-6 py-6" aria-hidden="true">
      <div className="flex flex-col gap-2">
        <div className="motion-safe:animate-pulse h-5 w-32 bg-ink/10 dark:bg-bone/10" />
        <div className="motion-safe:animate-pulse h-3 w-20 bg-ink/10 dark:bg-bone/10" />
      </div>
      <div className="flex items-center gap-6">
        <div className="motion-safe:animate-pulse h-5 w-20 bg-ink/10 dark:bg-bone/10" />
        <div className="motion-safe:animate-pulse h-5 w-16 bg-ink/10 dark:bg-bone/10" />
      </div>
    </li>
  );
}

export function OrdersSkeleton() {
  return (
    <ul className="divide-y divide-dotted divide-ink/30 dark:divide-bone/30">
      <OrderRowSkeleton />
      <OrderRowSkeleton />
      <OrderRowSkeleton />
    </ul>
  );
}

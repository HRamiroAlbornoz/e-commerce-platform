function CartLineSkeleton() {
  return (
    <li className="flex gap-4 py-6" aria-hidden="true">
      <span className="motion-safe:animate-pulse w-1 shrink-0 bg-ink/10 dark:bg-bone/10" />
      <div className="flex flex-1 items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="motion-safe:animate-pulse h-5 w-40 bg-ink/10 dark:bg-bone/10" />
          <div className="motion-safe:animate-pulse h-3 w-24 bg-ink/10 dark:bg-bone/10" />
        </div>
        <div className="motion-safe:animate-pulse h-11 w-28 bg-ink/10 dark:bg-bone/10" />
      </div>
    </li>
  );
}

export function CartSkeleton() {
  return (
    <ul className="divide-y divide-dotted divide-ink/30 dark:divide-bone/30">
      <CartLineSkeleton />
      <CartLineSkeleton />
      <CartLineSkeleton />
    </ul>
  );
}

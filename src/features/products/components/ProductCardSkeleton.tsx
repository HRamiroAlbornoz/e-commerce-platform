export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col" aria-hidden="true">
      <div className="motion-safe:animate-pulse aspect-square bg-ink/10 dark:bg-bone/10" />
      <div className="flex flex-1 flex-col gap-2 pt-4">
        <div className="motion-safe:animate-pulse h-5 w-3/4 bg-ink/10 dark:bg-bone/10" />
        <div className="motion-safe:animate-pulse h-4 w-full bg-ink/10 dark:bg-bone/10" />
        <div className="motion-safe:animate-pulse mt-auto h-5 w-1/3 bg-ink/10 pt-2 dark:bg-bone/10" />
      </div>
    </div>
  );
}

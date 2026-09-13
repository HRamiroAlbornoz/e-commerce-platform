export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2" aria-hidden="true">
      <div className="motion-safe:animate-pulse min-h-96 bg-ink/10 md:min-h-144 dark:bg-bone/10" />
      <div className="flex flex-col gap-4 border-b border-ink/15 bg-bone px-6 py-10 md:border-r md:px-12 dark:border-bone/15">
        <div className="motion-safe:animate-pulse h-8 w-3/4 bg-ink/10" />
        <div className="motion-safe:animate-pulse h-4 w-full bg-ink/10" />
        <div className="motion-safe:animate-pulse h-4 w-2/3 bg-ink/10" />
        <div className="mt-4 flex flex-col gap-3">
          <div className="motion-safe:animate-pulse h-4 w-full bg-ink/10" />
          <div className="motion-safe:animate-pulse h-4 w-full bg-ink/10" />
          <div className="motion-safe:animate-pulse h-4 w-full bg-ink/10" />
        </div>
        <div className="motion-safe:animate-pulse mt-auto h-8 w-1/3 bg-ink/10" />
      </div>
    </div>
  );
}

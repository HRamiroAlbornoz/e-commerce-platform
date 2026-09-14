export function OrderDetailSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div className="motion-safe:animate-pulse h-8 w-48 bg-ink/10 dark:bg-bone/10" />
        <div className="motion-safe:animate-pulse h-5 w-24 bg-ink/10 dark:bg-bone/10" />
      </div>

      <div className="border-t border-ink/15 pt-8 dark:border-bone/15">
        <ul className="divide-y divide-dotted divide-ink/30 dark:divide-bone/30">
          {[0, 1].map((key) => (
            <li key={key} className="flex items-center justify-between gap-6 py-6">
              <div className="flex flex-col gap-2">
                <div className="motion-safe:animate-pulse h-5 w-32 bg-ink/10 dark:bg-bone/10" />
                <div className="motion-safe:animate-pulse h-3 w-20 bg-ink/10 dark:bg-bone/10" />
              </div>
              <div className="motion-safe:animate-pulse h-5 w-16 bg-ink/10 dark:bg-bone/10" />
            </li>
          ))}
        </ul>

        <div className="mt-2 flex flex-col gap-2 border-t border-ink/15 pt-6 dark:border-bone/15">
          <div className="motion-safe:animate-pulse h-4 w-full bg-ink/10 dark:bg-bone/10" />
          <div className="motion-safe:animate-pulse h-4 w-full bg-ink/10 dark:bg-bone/10" />
          <div className="motion-safe:animate-pulse h-7 w-full bg-ink/10 dark:bg-bone/10" />
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-ink/15 pt-8 dark:border-bone/15">
        <div className="motion-safe:animate-pulse h-4 w-full bg-ink/10 dark:bg-bone/10" />
        <div className="motion-safe:animate-pulse h-4 w-full bg-ink/10 dark:bg-bone/10" />
        <div className="motion-safe:animate-pulse h-4 w-2/3 bg-ink/10 dark:bg-bone/10" />
      </div>
    </div>
  );
}

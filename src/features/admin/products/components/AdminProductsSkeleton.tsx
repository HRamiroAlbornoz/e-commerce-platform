const SKELETON_ROW_COUNT = 6;

export function AdminProductsSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <div key={index} className="motion-safe:animate-pulse h-10 w-full bg-ink/10 dark:bg-bone/10" />
      ))}
    </div>
  );
}

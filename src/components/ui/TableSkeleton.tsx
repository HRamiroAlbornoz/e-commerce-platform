const DEFAULT_ROW_COUNT = 6;

type TableSkeletonProps = {
  rows?: number;
};

export function TableSkeleton({ rows = DEFAULT_ROW_COUNT }: TableSkeletonProps) {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="motion-safe:animate-pulse h-10 w-full bg-ink/10 dark:bg-bone/10"
        />
      ))}
    </div>
  );
}

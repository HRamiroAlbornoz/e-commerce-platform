const SKELETON_FIELD_COUNT = 5;

export function AdminProductFormSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      {Array.from({ length: SKELETON_FIELD_COUNT }, (_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <div className="motion-safe:animate-pulse h-3 w-24 bg-ink/10 dark:bg-bone/10" />
          <div className="motion-safe:animate-pulse h-8 w-full bg-ink/10 dark:bg-bone/10" />
        </div>
      ))}
    </div>
  );
}

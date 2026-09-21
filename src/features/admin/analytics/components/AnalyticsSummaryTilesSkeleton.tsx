import { ANALYTICS_SUMMARY_CLASSES } from '@/features/admin/analytics/components/AnalyticsSummaryTiles';

export function AnalyticsSummaryTilesSkeleton() {
  return (
    <div className={ANALYTICS_SUMMARY_CLASSES} aria-hidden="true">
      <div className="flex flex-col gap-3 sm:pr-8">
        <div className="h-3 w-32 bg-ink/10 motion-safe:animate-pulse dark:bg-bone/10" />
        <div className="h-8 w-24 bg-ink/10 motion-safe:animate-pulse dark:bg-bone/10" />
      </div>
      <div className="flex flex-col gap-3 sm:pl-8">
        <div className="h-3 w-32 bg-ink/10 motion-safe:animate-pulse dark:bg-bone/10" />
        <div className="h-8 w-16 bg-ink/10 motion-safe:animate-pulse dark:bg-bone/10" />
      </div>
    </div>
  );
}

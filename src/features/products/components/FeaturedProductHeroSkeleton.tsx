import { FEATURED_PRODUCT_HERO_LAYOUT_CLASSES } from '@/features/products/components/FeaturedProductHero';

export function FeaturedProductHeroSkeleton() {
  return (
    <div className={FEATURED_PRODUCT_HERO_LAYOUT_CLASSES} aria-hidden="true">
      <div className="motion-safe:animate-pulse h-64 bg-ink/10 md:h-auto md:min-h-144 dark:bg-bone/10" />
      <div className="flex flex-col gap-4 bg-bone px-6 py-10">
        <div className="motion-safe:animate-pulse h-8 w-3/4 bg-ink/10" />
        <div className="motion-safe:animate-pulse h-4 w-full bg-ink/10" />
        <div className="motion-safe:animate-pulse h-4 w-2/3 bg-ink/10" />
        <div className="motion-safe:animate-pulse mt-auto h-8 w-1/3 bg-ink/10" />
      </div>
    </div>
  );
}

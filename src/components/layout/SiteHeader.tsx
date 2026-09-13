import { AuthNav } from '@/features/auth/components/AuthNav';
import { CartIndicator } from '@/features/cart/components/CartIndicator';

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between border-b border-ink/15 px-4 py-6 md:px-8 lg:px-12 dark:border-bone/15">
      <h1 className="font-display text-xl tracking-widest text-ink uppercase dark:text-bone">
        CLACK
      </h1>
      <div className="flex items-center gap-4">
        <CartIndicator />
        <AuthNav />
      </div>
    </header>
  );
}

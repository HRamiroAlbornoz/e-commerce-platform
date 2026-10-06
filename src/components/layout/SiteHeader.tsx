import { Link } from 'react-router';
import { AuthNav } from '@/features/auth/components/AuthNav';
import { CartIndicator } from '@/features/cart/components/CartIndicator';

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between border-b border-ink/15 px-4 py-6 md:px-8 lg:px-12 dark:border-bone/15">
      <h1 className="font-display text-xl tracking-widest text-ink uppercase dark:text-bone">
        <Link
          to="/"
          className="hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
        >
          CLACK
        </Link>
      </h1>
      <div className="flex items-center gap-4">
        <CartIndicator />
        <AuthNav />
      </div>
    </header>
  );
}

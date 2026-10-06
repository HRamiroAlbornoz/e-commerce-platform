import { Link, Outlet } from 'react-router';
import { LogoutButton } from '@/features/auth/components/LogoutButton';

export function PrivateLayout() {
  return (
    <div className="min-h-screen bg-bone dark:bg-ink">
      <header className="flex items-center justify-between border-b border-ink/15 px-4 py-6 md:px-8 lg:px-12 dark:border-bone/15">
        <Link
          to="/"
          className="font-display text-xl tracking-widest text-ink uppercase hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:text-bone dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
        >
          CLACK
        </Link>
        <LogoutButton />
      </header>
      <Outlet />
    </div>
  );
}

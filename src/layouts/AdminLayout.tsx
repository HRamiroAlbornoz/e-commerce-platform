import { Link, Outlet } from 'react-router';
import { LogoutButton } from '@/features/auth/components/LogoutButton';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-bone dark:bg-ink">
      <header className="flex items-center justify-between border-b border-ink/15 px-4 py-6 md:px-8 lg:px-12 dark:border-bone/15">
        <Link
          to="/admin/products"
          className="font-display text-xl tracking-widest text-ink uppercase dark:text-bone"
        >
          CLACK admin
        </Link>
        <LogoutButton />
      </header>
      <Outlet />
    </div>
  );
}

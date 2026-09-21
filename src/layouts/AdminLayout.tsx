import { Link, NavLink, Outlet } from 'react-router';
import { LogoutButton } from '@/features/auth/components/LogoutButton';

const NAV_LINK_CLASSES =
  'font-body border-b text-xs font-medium tracking-widest uppercase hover:border-field-magenta hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:hover:border-field-cyan dark:hover:text-field-cyan';

function navLinkClassName({ isActive }: { isActive: boolean }): string {
  const stateClasses = isActive
    ? 'border-ink text-ink dark:border-bone dark:text-bone'
    : 'border-transparent text-ink/70 dark:text-bone/70';
  return `${NAV_LINK_CLASSES} ${stateClasses}`;
}

const ADMIN_NAV_LINKS = [
  { to: '/admin/products', label: 'Productos' },
  { to: '/admin/orders', label: 'Órdenes' },
  { to: '/admin/analytics', label: 'Analytics' },
];

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-bone dark:bg-ink">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 px-4 py-6 md:px-8 lg:px-12 dark:border-bone/15">
        <div className="flex flex-wrap items-center gap-6">
          <Link
            to="/admin/products"
            className="font-display text-xl tracking-widest text-ink uppercase dark:text-bone"
          >
            CLACK admin
          </Link>
          <nav className="flex gap-4" aria-label="Secciones de administración">
            {ADMIN_NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClassName}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <LogoutButton />
      </header>
      <Outlet />
    </div>
  );
}

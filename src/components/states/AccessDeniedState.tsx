import { Link } from 'react-router';
import { SiteHeader } from '@/components/layout/SiteHeader';

export function AccessDeniedState() {
  return (
    <div className="min-h-screen bg-bone dark:bg-ink">
      <SiteHeader />
      <main className="flex flex-col items-center gap-4 px-6 py-24 text-center">
        <h2 className="font-display text-2xl text-ink dark:text-bone">Acceso restringido</h2>
        <p className="font-body max-w-md text-sm text-ink/70 dark:text-bone/70">
          Tu cuenta no tiene permisos de administrador para ver esta página.
        </p>
        <Link
          to="/"
          className="font-body text-xs text-ink/70 underline decoration-1 underline-offset-2 hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:text-bone/70 dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
        >
          Volver al catálogo
        </Link>
      </main>
    </div>
  );
}

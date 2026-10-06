import { Link } from 'react-router';

export function NotFoundState() {
  return (
    <main className="flex flex-col items-center gap-4 px-6 py-24 text-center">
      <h2 className="font-display text-2xl text-ink dark:text-bone">Página no encontrada</h2>
      <p className="font-body max-w-md text-sm text-ink/70 dark:text-bone/70">
        La dirección que buscas no existe o cambió.
      </p>
      <Link
        to="/"
        className="font-body text-xs text-ink/70 underline decoration-1 underline-offset-2 hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:text-bone/70 dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
      >
        Volver a la tienda
      </Link>
    </main>
  );
}

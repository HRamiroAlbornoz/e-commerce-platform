import { Outlet } from 'react-router';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-bone dark:bg-ink">
      <header className="border-b border-ink/15 px-4 py-6 md:px-8 lg:px-12 dark:border-bone/15">
        <h1 className="font-display text-xl tracking-widest text-ink uppercase dark:text-bone">
          CLACK
        </h1>
      </header>
      <Outlet />
    </div>
  );
}

import type { ReactNode } from 'react';
import { useRedirectWhenAuthenticated } from '@/features/auth/hooks/useRedirectWhenAuthenticated';

type AuthPageLayoutProps = {
  title: string;
  redirectTo: string;
  children: ReactNode;
};

export function AuthPageLayout({ title, redirectTo, children }: AuthPageLayoutProps) {
  useRedirectWhenAuthenticated(redirectTo);

  return (
    <main className="mx-auto flex max-w-md flex-col gap-8 px-4 py-16 md:py-24">
      <h1 className="font-display text-3xl text-ink dark:text-bone">{title}</h1>
      <div className="flex flex-col gap-8 border-t border-ink/15 pt-8 dark:border-bone/15">
        {children}
      </div>
    </main>
  );
}

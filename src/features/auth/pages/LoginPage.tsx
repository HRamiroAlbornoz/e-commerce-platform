import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { AuthPageLayout } from '@/features/auth/components/AuthPageLayout';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton';
import { buildRedirectState, getRedirectPath } from '@/routes/redirectState';

type LoginMode = 'login' | 'forgot-password';

export function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('login');
  const location = useLocation();
  const redirectTo = getRedirectPath(location.state);

  return (
    <AuthPageLayout
      title={mode === 'login' ? 'Iniciar sesión' : 'Recuperar contraseña'}
      redirectTo={redirectTo}
    >
      {mode === 'login' ? (
        <>
          <LoginForm onForgotPassword={() => setMode('forgot-password')} />
          <div className="flex flex-col gap-4 border-t border-ink/15 pt-8 dark:border-bone/15">
            <GoogleSignInButton />
          </div>
          <p className="font-body text-sm text-ink/70 dark:text-bone/70">
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              state={buildRedirectState(redirectTo)}
              className="underline decoration-1 underline-offset-2 hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
            >
              Crea una
            </Link>
          </p>
        </>
      ) : (
        <ForgotPasswordForm onBackToLogin={() => setMode('login')} />
      )}
    </AuthPageLayout>
  );
}

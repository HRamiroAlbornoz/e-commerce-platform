import { Link, useLocation } from 'react-router';
import { AuthPageLayout } from '@/features/auth/components/AuthPageLayout';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton';
import { buildRedirectState, getRedirectPath } from '@/routes/redirectState';

export function RegisterPage() {
  const location = useLocation();
  const redirectTo = getRedirectPath(location.state);

  return (
    <AuthPageLayout title="Crear cuenta" redirectTo={redirectTo}>
      <RegisterForm />
      <div className="flex flex-col gap-4 border-t border-ink/15 pt-8 dark:border-bone/15">
        <GoogleSignInButton />
      </div>
      <p className="font-body text-sm text-ink/70 dark:text-bone/70">
        ¿Ya tienes cuenta?{' '}
        <Link
          to="/login"
          state={buildRedirectState(redirectTo)}
          className="underline decoration-1 underline-offset-2 hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
        >
          Inicia sesión
        </Link>
      </p>
    </AuthPageLayout>
  );
}

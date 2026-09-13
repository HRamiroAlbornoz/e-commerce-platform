import { Link } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { LogoutButton, AUTH_NAV_LINK_CLASSES } from '@/features/auth/components/LogoutButton';

export function AuthNav() {
  const auth = useAuth();

  if (auth.status === 'loading') {
    return null;
  }

  if (auth.status === 'anonymous') {
    return (
      <Link to="/login" className={AUTH_NAV_LINK_CLASSES}>
        Iniciar sesión
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link to="/account" className={AUTH_NAV_LINK_CLASSES}>
        Mi cuenta
      </Link>
      <LogoutButton />
    </div>
  );
}

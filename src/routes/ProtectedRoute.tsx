import { Outlet } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { RedirectToLogin } from '@/routes/RedirectToLogin';

export function ProtectedRoute() {
  const auth = useAuth();

  if (auth.status === 'loading') {
    return null;
  }

  if (auth.status === 'anonymous') {
    return <RedirectToLogin />;
  }

  return <Outlet />;
}

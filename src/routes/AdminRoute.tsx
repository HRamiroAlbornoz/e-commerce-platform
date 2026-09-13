import { Outlet } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { RedirectToLogin } from '@/routes/RedirectToLogin';
import { AccessDeniedState } from '@/components/states/AccessDeniedState';

export function AdminRoute() {
  const auth = useAuth();

  if (auth.status === 'loading') {
    return null;
  }

  if (auth.status === 'anonymous') {
    return <RedirectToLogin />;
  }

  if (auth.role !== 'admin') {
    return <AccessDeniedState />;
  }

  return <Outlet />;
}

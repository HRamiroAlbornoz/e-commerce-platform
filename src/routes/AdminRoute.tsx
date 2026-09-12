import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/hooks/useAuth';

export function AdminRoute() {
  const auth = useAuth();

  if (auth.status === 'loading') {
    return null;
  }

  if (auth.status === 'anonymous') {
    return <Navigate to="/login" replace />;
  }

  if (auth.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

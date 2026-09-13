import { Navigate, useLocation } from 'react-router';
import { buildRedirectState } from '@/routes/redirectState';

export function RedirectToLogin() {
  const location = useLocation();
  const from = location.pathname + location.search;

  return <Navigate to="/login" replace state={buildRedirectState(from)} />;
}

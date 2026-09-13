import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';

export function useLogout(): () => Promise<void> {
  const auth = useAuth();
  const navigate = useNavigate();

  return async function logout() {
    void navigate('/', { replace: true });
    await auth.logout();
  };
}

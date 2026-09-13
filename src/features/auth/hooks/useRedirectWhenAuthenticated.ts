import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';

export function useRedirectWhenAuthenticated(to: string): void {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.status === 'authenticated') {
      void navigate(to, { replace: true });
    }
  }, [auth.status, to, navigate]);
}

import { Outlet } from 'react-router';
import { useAuth } from '@/hooks/useAuth';

export function PrivateLayout() {
  const auth = useAuth();

  return (
    <div>
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <p className="font-semibold">CLACK</p>
        <button type="button" onClick={() => void auth.logout()}>
          Cerrar sesion
        </button>
      </header>
      <Outlet />
    </div>
  );
}

import { useLogout } from '@/features/auth/hooks/useLogout';

export const AUTH_NAV_LINK_CLASSES =
  'font-body text-xs font-medium tracking-widest uppercase text-ink hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:text-bone dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan';

export function LogoutButton() {
  const logout = useLogout();

  return (
    <button type="button" onClick={() => void logout()} className={AUTH_NAV_LINK_CLASSES}>
      Cerrar sesión
    </button>
  );
}

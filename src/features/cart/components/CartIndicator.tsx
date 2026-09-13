import { Link } from 'react-router';
import { useCart } from '@/hooks/useCart';
import { AUTH_NAV_LINK_CLASSES } from '@/features/auth/components/LogoutButton';

export function CartIndicator() {
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link to="/cart" className={AUTH_NAV_LINK_CLASSES}>
      <span className="tabular-nums">{itemCount > 0 ? `Carrito (${itemCount})` : 'Carrito'}</span>
    </Link>
  );
}

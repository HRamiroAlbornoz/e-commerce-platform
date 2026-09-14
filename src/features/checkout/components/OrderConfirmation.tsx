import { Link } from 'react-router';
import { BUTTON_CLASSES } from '@/components/ui/Button';

type OrderConfirmationProps = {
  orderId: string;
};

export function OrderConfirmation({ orderId }: OrderConfirmationProps) {
  const shortOrderId = orderId.slice(-8).toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      <p className="font-display text-2xl text-ink dark:text-bone">¡Gracias por tu compra!</p>
      <p className="font-body text-sm text-ink/80 dark:text-bone/80">
        Tu pedido #{shortOrderId} fue confirmado. Vas a recibir el envío a la dirección indicada.
      </p>
      <Link to="/orders" className={BUTTON_CLASSES}>
        Ver mis órdenes
      </Link>
    </div>
  );
}

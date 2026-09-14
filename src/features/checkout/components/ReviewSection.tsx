import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/features/products/utils/formatPrice';

type ReviewSectionProps = {
  total: number;
};

export function ReviewSection({ total }: ReviewSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-display text-xl text-ink dark:text-bone">Revisión final</p>
      <p className="font-body text-sm text-ink/80 dark:text-bone/80">
        Revisá el envío y el pago arriba. El total a confirmar es {formatPrice(total)}.
      </p>
      <Button>Confirmar compra</Button>
    </div>
  );
}

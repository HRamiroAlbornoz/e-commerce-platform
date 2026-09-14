import type { ShippingDetails } from '@shared/schemas/checkout';
import { CheckoutSummaryCard } from '@/features/checkout/components/CheckoutSummaryCard';

type ShippingSummaryProps = {
  shipping: ShippingDetails;
  onEdit: () => void;
};

export function ShippingSummary({ shipping, onEdit }: ShippingSummaryProps) {
  return (
    <CheckoutSummaryCard title="Envío" onEdit={onEdit}>
      <p className="font-body text-sm text-ink/80 dark:text-bone/80">{shipping.fullName}</p>
      <p className="font-body text-sm text-ink/80 dark:text-bone/80">
        {shipping.address}, {shipping.city}, {shipping.postalCode}
      </p>
      <p className="font-body text-sm text-ink/80 dark:text-bone/80">{shipping.phone}</p>
    </CheckoutSummaryCard>
  );
}

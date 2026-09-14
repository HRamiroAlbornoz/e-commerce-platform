import type { PaymentDraft } from '@shared/schemas/checkout';
import { CheckoutSummaryCard } from '@/features/checkout/components/CheckoutSummaryCard';

const OUTCOME_LABELS: Record<PaymentDraft['outcome'], string> = {
  success: 'Aprobado',
  error: 'Rechazado',
};

type PaymentSummaryProps = {
  payment: PaymentDraft;
  onEdit: () => void;
};

export function PaymentSummary({ payment, onEdit }: PaymentSummaryProps) {
  return (
    <CheckoutSummaryCard title="Pago" onEdit={onEdit}>
      <p className="font-body text-sm text-ink/80 dark:text-bone/80">{payment.cardholderName}</p>
      <p className="font-body text-sm text-ink/80 dark:text-bone/80">
        Resultado simulado: {OUTCOME_LABELS[payment.outcome]}
      </p>
    </CheckoutSummaryCard>
  );
}

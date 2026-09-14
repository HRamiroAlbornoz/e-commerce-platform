import { useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/InlineError';
import { cancelOrder } from '@/features/orders/services/cancelOrder';
import { formatOrderNumber } from '@/features/orders/utils/formatOrderNumber';
import type { SubmitState } from '@/lib/asyncSubmitState';
import type { Order } from '@shared/schemas/order';

type CancelOrderModalProps = {
  order: Order;
  user: User;
  onClose: () => void;
  onCancelled: () => void;
};

export function CancelOrderModal({ order, user, onClose, onCancelled }: CancelOrderModalProps) {
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const isSubmitting = submitState.status === 'submitting';

  async function handleConfirm(): Promise<void> {
    setSubmitState({ status: 'submitting' });
    const result = await cancelOrder(user, order.id);

    if (result.ok) {
      onCancelled();
      return;
    }

    setSubmitState({ status: 'error', message: result.message });
  }

  return (
    <Modal
      title={`Cancelar orden #${formatOrderNumber(order.id)}`}
      onClose={onClose}
      closeDisabled={isSubmitting}
      initialFocusRef={backButtonRef}
    >
      <p className="font-body text-sm text-ink/80 dark:text-bone/80">
        Esta acción no se puede deshacer. El stock de cada producto de esta orden vuelve a sumarse.
      </p>

      <div aria-live="polite">
        <InlineError message={submitState.status === 'error' ? submitState.message : null} />
      </div>

      <div className="flex flex-wrap justify-end gap-4">
        <button
          ref={backButtonRef}
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="font-body border-b border-transparent text-xs font-medium tracking-widest text-ink uppercase hover:border-field-magenta hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta disabled:cursor-not-allowed disabled:opacity-40 dark:text-bone dark:hover:border-field-cyan dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
        >
          Volver
        </button>
        <Button
          onClick={() => void handleConfirm()}
          disabled={isSubmitting}
          isLoading={isSubmitting}
          loadingLabel="Cancelando…"
        >
          Confirmar cancelación
        </Button>
      </div>
    </Modal>
  );
}

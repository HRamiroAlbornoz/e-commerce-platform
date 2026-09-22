import type { CheckoutStep } from '@shared/schemas/checkout';
import {
  getStepVisibility,
  type CheckoutDraftState,
} from '@/features/checkout/state/checkoutDraftReducer';

const STEP_LABELS: Record<CheckoutStep, string> = {
  shipping: 'Envío',
  payment: 'Pago',
  review: 'Revisión',
};

const STEP_ORDER: CheckoutStep[] = ['shipping', 'payment', 'review'];

type CheckoutStepIndicatorProps = {
  draft: CheckoutDraftState;
  onEditShipping: () => void;
  onEditPayment: () => void;
};

export function CheckoutStepIndicator({
  draft,
  onEditShipping,
  onEditPayment,
}: CheckoutStepIndicatorProps) {
  const editHandlers: Record<CheckoutStep, (() => void) | null> = {
    shipping: getStepVisibility(draft, 'shipping') === 'summary' ? onEditShipping : null,
    payment: getStepVisibility(draft, 'payment') === 'summary' ? onEditPayment : null,
    review: null,
  };

  return (
    <ol className="sticky top-0 z-10 -mx-4 flex gap-6 border-b border-ink/15 bg-bone px-4 py-3 dark:border-bone/15 dark:bg-ink md:static md:mx-0 md:flex-col md:gap-4 md:border-b-0 md:bg-transparent md:px-0 md:py-0">
      {STEP_ORDER.map((step) => {
        const isActive = draft.activeStep === step;
        const editHandler = editHandlers[step];
        const isReached = getStepVisibility(draft, step) !== 'hidden';
        const textClasses = isReached ? 'text-ink dark:text-bone' : 'text-ink/40 dark:text-bone/40';

        return (
          <li key={step} aria-current={isActive ? 'step' : undefined}>
            {editHandler ? (
              <button
                type="button"
                onClick={editHandler}
                className={`font-body text-xs font-medium tracking-widest uppercase underline decoration-1 underline-offset-2 hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan ${textClasses}`}
              >
                {STEP_LABELS[step]}
              </button>
            ) : (
              <span
                className={`font-body text-xs font-medium tracking-widest uppercase ${textClasses} ${isActive ? 'underline decoration-field-magenta decoration-2 underline-offset-2 dark:decoration-field-cyan' : ''}`}
              >
                {STEP_LABELS[step]}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

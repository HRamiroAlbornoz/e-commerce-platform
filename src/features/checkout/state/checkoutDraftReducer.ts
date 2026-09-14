import type { CheckoutStep, PaymentDraft, ShippingDetails } from '@shared/schemas/checkout';

export type CheckoutDraftState = {
  shipping: ShippingDetails | null;
  payment: PaymentDraft | null;
  activeStep: CheckoutStep;
};

export type CheckoutDraftAction =
  | { type: 'SUBMIT_SHIPPING'; shipping: ShippingDetails }
  | { type: 'SUBMIT_PAYMENT'; payment: PaymentDraft }
  | { type: 'EDIT_SHIPPING' }
  | { type: 'EDIT_PAYMENT' };

export const INITIAL_CHECKOUT_DRAFT_STATE: CheckoutDraftState = {
  shipping: null,
  payment: null,
  activeStep: 'shipping',
};

export type CheckoutStepVisibility = 'form' | 'summary' | 'hidden';

export function getStepVisibility(
  state: CheckoutDraftState,
  step: CheckoutStep,
): CheckoutStepVisibility {
  switch (step) {
    case 'shipping':
      return state.activeStep === 'shipping' ? 'form' : 'summary';

    case 'payment':
      if (state.shipping === null) {
        return 'hidden';
      }
      if (state.activeStep === 'payment') {
        return 'form';
      }
      return state.payment === null ? 'hidden' : 'summary';

    case 'review':
      return state.activeStep === 'review' ? 'summary' : 'hidden';
  }
}

export function checkoutDraftReducer(
  state: CheckoutDraftState,
  action: CheckoutDraftAction,
): CheckoutDraftState {
  switch (action.type) {
    case 'SUBMIT_SHIPPING':
      return {
        ...state,
        shipping: action.shipping,
        activeStep: state.payment ? 'review' : 'payment',
      };

    case 'SUBMIT_PAYMENT':
      return { ...state, payment: action.payment, activeStep: 'review' };

    case 'EDIT_SHIPPING':
      return { ...state, activeStep: 'shipping' };

    case 'EDIT_PAYMENT':
      return { ...state, activeStep: 'payment' };

    default:
      return state;
  }
}

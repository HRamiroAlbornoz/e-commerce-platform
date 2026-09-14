import { useEffect, useReducer, useRef } from 'react';
import type { PaymentDraft, ShippingDetails } from '@shared/schemas/checkout';
import {
  checkoutDraftReducer,
  INITIAL_CHECKOUT_DRAFT_STATE,
  type CheckoutDraftState,
} from '@/features/checkout/state/checkoutDraftReducer';
import { readCheckoutDraft, writeCheckoutDraft } from '@/features/checkout/state/checkoutDraftStorage';

export type UseCheckoutDraftResult = CheckoutDraftState & {
  submitShipping: (shipping: ShippingDetails) => void;
  submitPayment: (payment: PaymentDraft) => void;
  editShipping: () => void;
  editPayment: () => void;
};

export function useCheckoutDraft(uid: string): UseCheckoutDraftResult {
  const [state, dispatch] = useReducer(checkoutDraftReducer, INITIAL_CHECKOUT_DRAFT_STATE, () =>
    readCheckoutDraft(uid),
  );

  const isInitialRenderRef = useRef(true);

  useEffect(() => {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      return;
    }
    writeCheckoutDraft(uid, state);
  }, [uid, state]);

  function submitShipping(shipping: ShippingDetails): void {
    dispatch({ type: 'SUBMIT_SHIPPING', shipping });
  }

  function submitPayment(payment: PaymentDraft): void {
    dispatch({ type: 'SUBMIT_PAYMENT', payment });
  }

  function editShipping(): void {
    dispatch({ type: 'EDIT_SHIPPING' });
  }

  function editPayment(): void {
    dispatch({ type: 'EDIT_PAYMENT' });
  }

  return { ...state, submitShipping, submitPayment, editShipping, editPayment };
}

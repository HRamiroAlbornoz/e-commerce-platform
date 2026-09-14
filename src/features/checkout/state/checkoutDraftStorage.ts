import { checkoutDraftSchema } from '@shared/schemas/checkout';
import { INITIAL_CHECKOUT_DRAFT_STATE, type CheckoutDraftState } from './checkoutDraftReducer';

function checkoutDraftStorageKey(uid: string): string {
  return `clack:checkout-draft:${uid}`;
}

export function readCheckoutDraft(uid: string): CheckoutDraftState {
  const raw = localStorage.getItem(checkoutDraftStorageKey(uid));

  if (!raw) {
    return INITIAL_CHECKOUT_DRAFT_STATE;
  }

  try {
    const result = checkoutDraftSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : INITIAL_CHECKOUT_DRAFT_STATE;
  } catch {
    return INITIAL_CHECKOUT_DRAFT_STATE;
  }
}

export function writeCheckoutDraft(uid: string, state: CheckoutDraftState): void {
  try {
    localStorage.setItem(checkoutDraftStorageKey(uid), JSON.stringify(state));
  } catch {
    return;
  }
}

export function clearCheckoutDraft(uid: string): void {
  try {
    localStorage.removeItem(checkoutDraftStorageKey(uid));
  } catch {
    return;
  }
}

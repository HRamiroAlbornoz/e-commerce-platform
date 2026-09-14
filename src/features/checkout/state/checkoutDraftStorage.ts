import { checkoutDraftSchema } from '@shared/schemas/checkout';
import { safeStorageGet, safeStorageRemove, safeStorageSet } from '@/lib/webStorage';
import { createFreshCheckoutDraftState, type CheckoutDraftState } from './checkoutDraftReducer';

function checkoutDraftStorageKey(uid: string): string {
  return `clack:checkout-draft:${uid}`;
}

export function readCheckoutDraft(uid: string): CheckoutDraftState {
  const raw = safeStorageGet(localStorage, checkoutDraftStorageKey(uid));

  if (!raw) {
    return createFreshCheckoutDraftState();
  }

  try {
    const result = checkoutDraftSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : createFreshCheckoutDraftState();
  } catch {
    return createFreshCheckoutDraftState();
  }
}

export function writeCheckoutDraft(uid: string, state: CheckoutDraftState): void {
  safeStorageSet(localStorage, checkoutDraftStorageKey(uid), JSON.stringify(state));
}

export function clearCheckoutDraft(uid: string): void {
  safeStorageRemove(localStorage, checkoutDraftStorageKey(uid));
}

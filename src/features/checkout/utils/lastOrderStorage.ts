import { safeStorageGet, safeStorageSet } from '@/lib/webStorage';

function lastOrderStorageKey(uid: string): string {
  return `clack:last-order-id:${uid}`;
}

export function readLastOrderId(uid: string): string | null {
  return safeStorageGet(sessionStorage, lastOrderStorageKey(uid));
}

export function writeLastOrderId(uid: string, orderId: string): void {
  safeStorageSet(sessionStorage, lastOrderStorageKey(uid), orderId);
}

export function safeStorageGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function safeStorageSet(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    return;
  }
}

export function safeStorageRemove(storage: Storage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    return;
  }
}

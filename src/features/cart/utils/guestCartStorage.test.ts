import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearGuestCart,
  readGuestCart,
  writeGuestCart,
} from '@/features/cart/utils/guestCartStorage';

const STORAGE_KEY = 'clack:guest-cart';

describe('guestCartStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sin nada guardado, arranca con el carrito vacio', () => {
    expect(readGuestCart()).toEqual([]);
  });

  it('guarda y vuelve a leer el mismo carrito (sobrevive una recarga, F5.4)', () => {
    const items = [{ productId: 'product-1', quantity: 2 }];
    writeGuestCart(items);

    expect(readGuestCart()).toEqual(items);
  });

  it('si el JSON guardado esta corrupto, arranca con el carrito vacio en vez de fallar (F5.5)', () => {
    localStorage.setItem(STORAGE_KEY, '{esto no es json valido');

    expect(readGuestCart()).toEqual([]);
  });

  it('si el esquema guardado es de una version vieja, arranca con el carrito vacio (F5.5)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ products: ['product-1'] }));

    expect(readGuestCart()).toEqual([]);
  });

  it('clearGuestCart borra el carrito guardado', () => {
    writeGuestCart([{ productId: 'product-1', quantity: 1 }]);
    clearGuestCart();

    expect(readGuestCart()).toEqual([]);
  });
});

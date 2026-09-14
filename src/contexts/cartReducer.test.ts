import { describe, expect, it } from 'vitest';
import { cartReducer, INITIAL_CART_STATE, type CartState } from '@/contexts/cartReducer';

function stateWith(items: CartState['items']): CartState {
  return { items };
}

describe('cartReducer', () => {
  it('ADD_ITEM agrega un producto nuevo con la cantidad pedida', () => {
    const result = cartReducer(INITIAL_CART_STATE, {
      type: 'ADD_ITEM',
      productId: 'product-1',
      quantity: 2,
      stock: 10,
    });

    expect(result.items).toEqual([{ productId: 'product-1', quantity: 2 }]);
  });

  it('ADD_ITEM sobre un producto ya presente acumula la cantidad, no reemplaza', () => {
    const state = stateWith([{ productId: 'product-1', quantity: 2 }]);
    const result = cartReducer(state, {
      type: 'ADD_ITEM',
      productId: 'product-1',
      quantity: 3,
      stock: 10,
    });

    expect(result.items).toEqual([{ productId: 'product-1', quantity: 5 }]);
  });

  it('ADD_ITEM nunca supera el stock disponible', () => {
    const state = stateWith([{ productId: 'product-1', quantity: 8 }]);
    const result = cartReducer(state, {
      type: 'ADD_ITEM',
      productId: 'product-1',
      quantity: 5,
      stock: 10,
    });

    expect(result.items).toEqual([{ productId: 'product-1', quantity: 10 }]);
  });

  it('SET_QUANTITY cambia la cantidad de la linea indicada', () => {
    const state = stateWith([
      { productId: 'product-1', quantity: 2 },
      { productId: 'product-2', quantity: 1 },
    ]);
    const result = cartReducer(state, {
      type: 'SET_QUANTITY',
      productId: 'product-1',
      quantity: 5,
      stock: 10,
    });

    expect(result.items).toEqual([
      { productId: 'product-1', quantity: 5 },
      { productId: 'product-2', quantity: 1 },
    ]);
  });

  it('SET_QUANTITY topea al stock disponible', () => {
    const state = stateWith([{ productId: 'product-1', quantity: 2 }]);
    const result = cartReducer(state, {
      type: 'SET_QUANTITY',
      productId: 'product-1',
      quantity: 99,
      stock: 4,
    });

    expect(result.items).toEqual([{ productId: 'product-1', quantity: 4 }]);
  });

  it('SET_QUANTITY nunca baja de 1: no existe una linea en cantidad cero', () => {
    const state = stateWith([{ productId: 'product-1', quantity: 2 }]);
    const result = cartReducer(state, {
      type: 'SET_QUANTITY',
      productId: 'product-1',
      quantity: 0,
      stock: 10,
    });

    expect(result.items).toEqual([{ productId: 'product-1', quantity: 1 }]);
  });

  it('REMOVE_ITEM elimina la linea indicada y deja el resto intacto', () => {
    const state = stateWith([
      { productId: 'product-1', quantity: 2 },
      { productId: 'product-2', quantity: 1 },
    ]);
    const result = cartReducer(state, { type: 'REMOVE_ITEM', productId: 'product-1' });

    expect(result.items).toEqual([{ productId: 'product-2', quantity: 1 }]);
  });

  it('REMOVE_ITEM sobre un producto que no esta en el carrito no rompe ni cambia nada', () => {
    const state = stateWith([{ productId: 'product-1', quantity: 2 }]);
    const result = cartReducer(state, { type: 'REMOVE_ITEM', productId: 'no-existe' });

    expect(result.items).toEqual(state.items);
  });

  it('REPLACE reemplaza el carrito entero (usado al cargar o fusionar)', () => {
    const state = stateWith([{ productId: 'product-1', quantity: 2 }]);
    const nextItems = [{ productId: 'product-2', quantity: 1 }];
    const result = cartReducer(state, { type: 'REPLACE', items: nextItems });

    expect(result.items).toEqual(nextItems);
  });

  it('CLEAR vacia el carrito (usado al confirmar una orden)', () => {
    const state = stateWith([
      { productId: 'product-1', quantity: 2 },
      { productId: 'product-2', quantity: 1 },
    ]);
    const result = cartReducer(state, { type: 'CLEAR' });

    expect(result.items).toEqual([]);
  });
});

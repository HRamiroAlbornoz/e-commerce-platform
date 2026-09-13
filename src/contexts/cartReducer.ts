import type { CartItem } from '@shared/schemas/cart';

export type CartState = { items: CartItem[] };

export type CartAction =
  | { type: 'ADD_ITEM'; productId: string; quantity: number; stock: number }
  | { type: 'SET_QUANTITY'; productId: string; quantity: number; stock: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'REPLACE'; items: CartItem[] };

export const INITIAL_CART_STATE: CartState = { items: [] };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find((item) => item.productId === action.productId);
      const quantity = Math.min((existingItem?.quantity ?? 0) + action.quantity, action.stock);

      if (!existingItem) {
        return { items: [...state.items, { productId: action.productId, quantity }] };
      }

      return {
        items: state.items.map((item) =>
          item.productId === action.productId ? { ...item, quantity } : item,
        ),
      };
    }

    case 'SET_QUANTITY': {
      const quantity = Math.max(1, Math.min(action.quantity, action.stock));

      return {
        items: state.items.map((item) =>
          item.productId === action.productId ? { ...item, quantity } : item,
        ),
      };
    }

    case 'REMOVE_ITEM':
      return { items: state.items.filter((item) => item.productId !== action.productId) };

    case 'REPLACE':
      return { items: action.items };

    default:
      return state;
  }
}

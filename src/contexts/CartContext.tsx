import { createContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cartReducer, INITIAL_CART_STATE, type CartState } from '@/contexts/cartReducer';
import { readGuestCart, writeGuestCart } from '@/features/cart/utils/guestCartStorage';
import { setCart } from '@/features/cart/services/setCart';
import { loadAuthenticatedCart } from '@/features/cart/services/loadAuthenticatedCart';
import type { MergeExclusion } from '@/features/cart/utils/mergeGuestCart';

export type CartContextValue = CartState & {
  addItem: (productId: string, quantity: number, stock: number) => void;
  setQuantity: (productId: string, quantity: number, stock: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  mergeExclusions: MergeExclusion[];
  dismissMergeExclusions: () => void;
};

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const authenticatedUid = auth.status === 'authenticated' ? auth.user.uid : null;

  const [state, dispatch] = useReducer(cartReducer, INITIAL_CART_STATE, () => ({
    items: readGuestCart(),
  }));
  const [mergeExclusions, setMergeExclusions] = useState<MergeExclusion[]>([]);

  const itemsRef = useRef(state.items);
  const mergedUidRef = useRef<string | null>(null);
  const mergeInFlightRef = useRef(false);
  const skipNextPersistRef = useRef(false);

  useEffect(() => {
    itemsRef.current = state.items;
  }, [state.items]);

  useEffect(() => {
    if (authenticatedUid === null) {
      const wasAuthenticated = mergedUidRef.current !== null;
      mergedUidRef.current = null;

      if (wasAuthenticated) {
        dispatch({ type: 'REPLACE', items: readGuestCart() });
        setMergeExclusions([]);
      }

      return;
    }

    if (mergedUidRef.current === authenticatedUid) {
      return;
    }

    mergedUidRef.current = authenticatedUid;
    mergeInFlightRef.current = true;
    let isCurrentMerge = true;

    loadAuthenticatedCart(authenticatedUid, itemsRef.current)
      .then((result) => {
        if (!isCurrentMerge) {
          return;
        }
        skipNextPersistRef.current = true;
        dispatch({ type: 'REPLACE', items: result.items });
        setMergeExclusions(result.exclusions);
      })
      .catch(() => {
        return;
      })
      .finally(() => {
        mergeInFlightRef.current = false;
      });

    return () => {
      isCurrentMerge = false;
    };
  }, [authenticatedUid]);

  useEffect(() => {
    if (auth.status === 'loading' || mergeInFlightRef.current) {
      return;
    }

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    if (authenticatedUid === null) {
      writeGuestCart(state.items);
      return;
    }

    void setCart(authenticatedUid, state.items).catch(() => {
      return;
    });
  }, [state.items, auth.status, authenticatedUid]);

  function addItem(productId: string, quantity: number, stock: number): void {
    dispatch({ type: 'ADD_ITEM', productId, quantity, stock });
  }

  function setQuantity(productId: string, quantity: number, stock: number): void {
    dispatch({ type: 'SET_QUANTITY', productId, quantity, stock });
  }

  function removeItem(productId: string): void {
    dispatch({ type: 'REMOVE_ITEM', productId });
  }

  function clearCart(): void {
    dispatch({ type: 'CLEAR' });
  }

  function dismissMergeExclusions(): void {
    setMergeExclusions([]);
  }

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        setQuantity,
        removeItem,
        clearCart,
        mergeExclusions,
        dismissMergeExclusions,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

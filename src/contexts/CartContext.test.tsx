import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { User } from 'firebase/auth';
import { CartProvider } from '@/contexts/CartContext';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { loadAuthenticatedCart } from '@/features/cart/services/loadAuthenticatedCart';
import { setCart } from '@/features/cart/services/setCart';
import { readGuestCart, writeGuestCart } from '@/features/cart/utils/guestCartStorage';
import type { AuthContextValue, AuthState } from '@/contexts/AuthContext';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('@/features/cart/services/loadAuthenticatedCart', () => ({ loadAuthenticatedCart: vi.fn() }));
vi.mock('@/features/cart/services/setCart', () => ({ setCart: vi.fn() }));
vi.mock('@/features/cart/utils/guestCartStorage', () => ({
  readGuestCart: vi.fn(() => []),
  writeGuestCart: vi.fn(),
}));

const fakeUser = { uid: 'user-1' } as User;

function mockAuth(state: AuthState): void {
  const value: AuthContextValue = { ...state, logout: vi.fn() };
  vi.mocked(useAuth).mockReturnValue(value);
}

function TestConsumer() {
  const cart = useCart();
  return (
    <div>
      <p data-testid="items">{JSON.stringify(cart.items)}</p>
      <button onClick={() => cart.addItem('product-1', 1, 5)}>agregar</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <CartProvider>
      <TestConsumer />
    </CartProvider>,
  );
}

describe('CartProvider', () => {
  beforeEach(() => {
    vi.mocked(readGuestCart).mockReturnValue([]);
    vi.mocked(writeGuestCart).mockReset();
    vi.mocked(setCart).mockReset().mockResolvedValue(undefined);
    vi.mocked(loadAuthenticatedCart).mockReset();
  });

  it('de invitado, agregar un item lo persiste en localStorage, no en Firestore', async () => {
    mockAuth({ status: 'anonymous' });

    renderWithProvider();
    fireEvent.click(screen.getByRole('button', { name: 'agregar' }));

    await waitFor(() => {
      expect(writeGuestCart).toHaveBeenCalledWith([{ productId: 'product-1', quantity: 1 }]);
    });
    expect(setCart).not.toHaveBeenCalled();
  });

  it('al iniciar sesion con un carrito de invitado, dispara la fusion una sola vez', async () => {
    vi.mocked(readGuestCart).mockReturnValue([{ productId: 'product-1', quantity: 1 }]);
    vi.mocked(loadAuthenticatedCart).mockResolvedValue({
      items: [{ productId: 'product-1', quantity: 4 }],
      exclusions: [],
    });
    mockAuth({ status: 'authenticated', user: fakeUser, role: 'customer' });

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('items')).toHaveTextContent(
        JSON.stringify([{ productId: 'product-1', quantity: 4 }]),
      );
    });
    expect(loadAuthenticatedCart).toHaveBeenCalledTimes(1);
    expect(loadAuthenticatedCart).toHaveBeenCalledWith('user-1', [{ productId: 'product-1', quantity: 1 }]);
    expect(setCart).not.toHaveBeenCalled();
  });

  it('un resultado de fusion que llega tarde, para un uid que ya no es el actual, no se aplica', async () => {
    let resolveMerge: (result: { items: { productId: string; quantity: number }[]; exclusions: [] }) => void = () => {
      return;
    };
    const pendingMerge = new Promise<{ items: { productId: string; quantity: number }[]; exclusions: [] }>(
      (resolve) => {
        resolveMerge = resolve;
      },
    );
    vi.mocked(loadAuthenticatedCart).mockReturnValueOnce(pendingMerge);
    mockAuth({ status: 'authenticated', user: fakeUser, role: 'customer' });

    const { rerender } = renderWithProvider();
    await waitFor(() => expect(loadAuthenticatedCart).toHaveBeenCalledTimes(1));

    vi.mocked(readGuestCart).mockReturnValue([]);
    mockAuth({ status: 'anonymous' });
    rerender(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('items')).toHaveTextContent('[]'));

    resolveMerge({ items: [{ productId: 'stale-result', quantity: 9 }], exclusions: [] });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.getByTestId('items')).toHaveTextContent('[]');
  });

  it('al cerrar sesion, vuelve al carrito de invitado y deja de escribir en Firestore', async () => {
    vi.mocked(loadAuthenticatedCart).mockResolvedValue({
      items: [{ productId: 'product-1', quantity: 4 }],
      exclusions: [],
    });
    mockAuth({ status: 'authenticated', user: fakeUser, role: 'customer' });

    const { rerender } = renderWithProvider();
    await waitFor(() => expect(loadAuthenticatedCart).toHaveBeenCalledTimes(1));

    vi.mocked(readGuestCart).mockReturnValue([]);
    mockAuth({ status: 'anonymous' });
    rerender(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('items')).toHaveTextContent('[]');
    });
  });
});

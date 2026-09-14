import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { User } from 'firebase/auth';
import { CancelOrderModal } from '@/features/orders/components/CancelOrderModal';
import { cancelOrder } from '@/features/orders/services/cancelOrder';
import type { Order } from '@shared/schemas/order';

vi.mock('@/features/orders/services/cancelOrder', () => ({ cancelOrder: vi.fn() }));

const fakeUser = {} as User;

const orderFixture: Order = {
  id: 'aaaa1111-bbbb-2222-cccc-333344445555',
  userId: 'user-1',
  items: [
    { productId: 'product-1', name: 'Teclado Aurora', unitPrice: 89999, imageUrl: 'https://placehold.co/600x400', quantity: 1 },
  ],
  subtotal: 89999,
  shippingCost: 4999,
  total: 94998,
  status: 'pending',
  shipping: {
    fullName: 'Hernán Albornoz',
    address: 'Av. Siempre Viva 742',
    city: 'Springfield',
    postalCode: '1000',
    phone: '1122334455',
  },
  payment: { cardholderName: 'Hernán Albornoz', method: 'card', outcome: 'success' },
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

function renderModal(onCancelled = vi.fn(), onClose = vi.fn()) {
  return {
    onCancelled,
    onClose,
    ...render(
      <CancelOrderModal order={orderFixture} user={fakeUser} onClose={onClose} onCancelled={onCancelled} />,
    ),
  };
}

describe('CancelOrderModal', () => {
  it('nombra la orden en el titulo (F7.6)', () => {
    renderModal();

    expect(screen.getByRole('dialog', { name: /44445555/ })).toBeInTheDocument();
  });

  it('el foco inicial va al boton seguro "Volver", no al destructivo', () => {
    renderModal();

    expect(screen.getByRole('button', { name: 'Volver' })).toHaveFocus();
  });

  it('"Volver" cierra el modal sin llamar al servidor', () => {
    const { onClose } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(cancelOrder).not.toHaveBeenCalled();
  });

  it('confirmar cancela la orden y avisa al padre', async () => {
    vi.mocked(cancelOrder).mockResolvedValue({ ok: true });
    const { onCancelled } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar cancelación' }));

    await waitFor(() => expect(onCancelled).toHaveBeenCalledTimes(1));
    expect(cancelOrder).toHaveBeenCalledWith(fakeUser, orderFixture.id);
  });

  it('si el servidor rechaza la cancelacion, muestra el motivo sin cerrar el modal', async () => {
    vi.mocked(cancelOrder).mockResolvedValue({
      ok: false,
      message: 'Esta orden ya no se puede cancelar.',
    });
    const { onCancelled } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar cancelación' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Esta orden ya no se puede cancelar.');
    });
    expect(onCancelled).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

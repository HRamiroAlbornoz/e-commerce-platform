import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { User } from 'firebase/auth';
import { ReviewSection } from '@/features/checkout/components/ReviewSection';
import { createOrder } from '@/features/checkout/services/createOrder';
import type { PaymentDraft, ShippingDetails } from '@shared/schemas/checkout';
import type { Product } from '@shared/schemas/product';
import type { CartLine } from '@/features/cart/hooks/useResolvedCart';

vi.mock('@/features/checkout/services/createOrder', () => ({ createOrder: vi.fn() }));

const fakeUser = {} as User;

const shipping: ShippingDetails = {
  fullName: 'Hernán Albornoz',
  address: 'Av. Siempre Viva 742',
  city: 'Springfield',
  postalCode: '1000',
  phone: '1122334455',
};

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    name: 'Mousepad PowerPad',
    nameLower: 'mousepad powerpad',
    description: 'Descripcion',
    price: 29999,
    stock: 5,
    category: 'mousepad',
    displayColor: 'magenta',
    imageUrl: 'https://placehold.co/600x400',
    isActive: true,
    specs: [{ label: 'Tamaño', value: 'XL' }],
    curatorialNote: 'Nota',
    ratingAverage: 0,
    ratingCount: 0,
    orderCount: 0,
    unitsSold: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const cartLines: CartLine[] = [{ product: buildProduct(), quantity: 2, lineTotal: 59998 }];

function renderReviewSection(payment: PaymentDraft, onOrderCreated = vi.fn()) {
  return {
    onOrderCreated,
    ...render(
      <ReviewSection
        shipping={shipping}
        payment={payment}
        cartLines={cartLines}
        subtotal={59998}
        orderRequestId="order-request-1"
        user={fakeUser}
        onOrderCreated={onOrderCreated}
      />,
    ),
  };
}

describe('ReviewSection', () => {
  it('muestra el envio y el total (subtotal + envio fijo), redondeado a dos decimales', () => {
    renderReviewSection({ cardholderName: 'Hernán Albornoz', method: 'card', outcome: 'success' });

    expect(screen.getByText(/64.997/)).toBeInTheDocument();
  });

  it('con el pago rechazado, confirmar no llama al servidor y muestra el motivo (F6.9)', () => {
    renderReviewSection({ cardholderName: 'Hernán Albornoz', method: 'card', outcome: 'error' });

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar compra' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/rechazado/i);
    expect(createOrder).not.toHaveBeenCalled();
  });

  it('con el pago aprobado, confirma la compra con los datos revisados y reporta el id', async () => {
    vi.mocked(createOrder).mockResolvedValue({ ok: true, orderId: 'order-abc' });
    const { onOrderCreated } = renderReviewSection({
      cardholderName: 'Hernán Albornoz',
      method: 'card',
      outcome: 'success',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar compra' }));

    await waitFor(() => expect(onOrderCreated).toHaveBeenCalledWith('order-abc'));
    expect(createOrder).toHaveBeenCalledWith(fakeUser, {
      orderRequestId: 'order-request-1',
      shipping,
      payment: { cardholderName: 'Hernán Albornoz', method: 'card', outcome: 'success' },
      expectedItems: [{ productId: 'product-1', quantity: 2, unitPrice: 29999 }],
    });
  });

  it('si el servidor rechaza la compra, muestra el motivo y no reporta ningun id', async () => {
    vi.mocked(createOrder).mockResolvedValue({
      ok: false,
      message: 'Nos quedamos sin stock de "Mousepad PowerPad".',
    });
    const { onOrderCreated } = renderReviewSection({
      cardholderName: 'Hernán Albornoz',
      method: 'card',
      outcome: 'success',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar compra' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Nos quedamos sin stock de "Mousepad PowerPad".');
    });
    expect(onOrderCreated).not.toHaveBeenCalled();
  });
});

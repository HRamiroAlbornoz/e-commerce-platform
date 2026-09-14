import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CheckoutStepIndicator } from '@/features/checkout/components/CheckoutStepIndicator';
import type { CheckoutDraftState } from '@/features/checkout/state/checkoutDraftReducer';
import type { PaymentDraft, ShippingDetails } from '@shared/schemas/checkout';

const shipping: ShippingDetails = {
  fullName: 'Hernán Albornoz',
  address: 'Av. Siempre Viva 742',
  city: 'Springfield',
  postalCode: '1000',
  phone: '1122334455',
};

const payment: PaymentDraft = { cardholderName: 'Hernán Albornoz', method: 'card', outcome: 'success' };

function draftWith(overrides: Partial<CheckoutDraftState>): CheckoutDraftState {
  return { shipping: null, payment: null, activeStep: 'shipping', ...overrides };
}

describe('CheckoutStepIndicator', () => {
  it('en el paso de envio, ningun paso es clickeable todavia', () => {
    render(
      <CheckoutStepIndicator
        draft={draftWith({})}
        onEditShipping={vi.fn()}
        onEditPayment={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Envío' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pago' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Revisión' })).not.toBeInTheDocument();
  });

  it('en el paso de pago, envio ya completado se puede volver a editar', () => {
    const onEditShipping = vi.fn();
    render(
      <CheckoutStepIndicator
        draft={draftWith({ shipping, activeStep: 'payment' })}
        onEditShipping={onEditShipping}
        onEditPayment={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Envío' }));
    expect(onEditShipping).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Pago' })).not.toBeInTheDocument();
  });

  it('en revision, se puede volver a editar tanto envio como pago, pero revision nunca es clickeable', () => {
    const onEditShipping = vi.fn();
    const onEditPayment = vi.fn();
    render(
      <CheckoutStepIndicator
        draft={draftWith({ shipping, payment, activeStep: 'review' })}
        onEditShipping={onEditShipping}
        onEditPayment={onEditPayment}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Envío' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pago' }));

    expect(onEditShipping).toHaveBeenCalledTimes(1);
    expect(onEditPayment).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Revisión' })).not.toBeInTheDocument();
  });
});

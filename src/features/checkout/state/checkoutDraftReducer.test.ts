import { describe, expect, it } from 'vitest';
import {
  checkoutDraftReducer,
  getStepVisibility,
  INITIAL_CHECKOUT_DRAFT_STATE,
  type CheckoutDraftState,
} from '@/features/checkout/state/checkoutDraftReducer';
import type { PaymentDraft, ShippingDetails } from '@shared/schemas/checkout';

const shipping: ShippingDetails = {
  fullName: 'Hernán Albornoz',
  address: 'Av. Siempre Viva 742',
  city: 'Springfield',
  postalCode: '1000',
  phone: '1122334455',
};

const payment: PaymentDraft = {
  cardholderName: 'Hernán Albornoz',
  method: 'card',
  outcome: 'success',
};

function stateWith(overrides: Partial<CheckoutDraftState>): CheckoutDraftState {
  return { ...INITIAL_CHECKOUT_DRAFT_STATE, ...overrides };
}

describe('checkoutDraftReducer', () => {
  it('arranca en el paso de envio, sin envio ni pago', () => {
    expect(INITIAL_CHECKOUT_DRAFT_STATE).toEqual({
      shipping: null,
      payment: null,
      activeStep: 'shipping',
      orderRequestId: '',
    });
  });

  it('SUBMIT_SHIPPING guarda el envio y avanza a pago cuando el pago todavia no existe', () => {
    const result = checkoutDraftReducer(INITIAL_CHECKOUT_DRAFT_STATE, {
      type: 'SUBMIT_SHIPPING',
      shipping,
    });

    expect(result).toEqual({ shipping, payment: null, activeStep: 'payment', orderRequestId: '' });
  });

  it('SUBMIT_SHIPPING salta directo a revision si el pago ya estaba completo (F6.2)', () => {
    const state = stateWith({ payment, activeStep: 'shipping' });
    const result = checkoutDraftReducer(state, { type: 'SUBMIT_SHIPPING', shipping });

    expect(result).toEqual({ shipping, payment, activeStep: 'review', orderRequestId: '' });
  });

  it('SUBMIT_PAYMENT guarda el pago y avanza a revision', () => {
    const state = stateWith({ shipping, activeStep: 'payment' });
    const result = checkoutDraftReducer(state, { type: 'SUBMIT_PAYMENT', payment });

    expect(result).toEqual({ shipping, payment, activeStep: 'review', orderRequestId: '' });
  });

  it('EDIT_SHIPPING vuelve al paso de envio sin borrar los datos ya cargados', () => {
    const state = stateWith({ shipping, payment, activeStep: 'review' });
    const result = checkoutDraftReducer(state, { type: 'EDIT_SHIPPING' });

    expect(result).toEqual({ shipping, payment, activeStep: 'shipping', orderRequestId: '' });
  });

  it('EDIT_PAYMENT vuelve al paso de pago sin borrar los datos ya cargados', () => {
    const state = stateWith({ shipping, payment, activeStep: 'review' });
    const result = checkoutDraftReducer(state, { type: 'EDIT_PAYMENT' });

    expect(result).toEqual({ shipping, payment, activeStep: 'payment', orderRequestId: '' });
  });

  it('RESET vuelve al estado inicial con el orderRequestId nuevo que se le pasa', () => {
    const state = stateWith({ shipping, payment, activeStep: 'review', orderRequestId: 'old-id' });
    const result = checkoutDraftReducer(state, { type: 'RESET', orderRequestId: 'new-id' });

    expect(result).toEqual({
      shipping: null,
      payment: null,
      activeStep: 'shipping',
      orderRequestId: 'new-id',
    });
  });
});

describe('getStepVisibility', () => {
  it('envio siempre se ve, como formulario mientras es el paso activo', () => {
    expect(getStepVisibility(INITIAL_CHECKOUT_DRAFT_STATE, 'shipping')).toBe('form');
  });

  it('envio se ve como resumen apenas deja de ser el paso activo', () => {
    const state = stateWith({ shipping, activeStep: 'payment' });
    expect(getStepVisibility(state, 'shipping')).toBe('summary');
  });

  it('pago esta oculto hasta que el envio este completo', () => {
    expect(getStepVisibility(INITIAL_CHECKOUT_DRAFT_STATE, 'payment')).toBe('hidden');
  });

  it('pago se ve como formulario en cuanto es el paso activo', () => {
    const state = stateWith({ shipping, activeStep: 'payment' });
    expect(getStepVisibility(state, 'payment')).toBe('form');
  });

  it('pago se ve como resumen una vez completo y ya no activo', () => {
    const state = stateWith({ shipping, payment, activeStep: 'review' });
    expect(getStepVisibility(state, 'payment')).toBe('summary');
  });

  it('revision esta oculta salvo que sea el paso activo', () => {
    const state = stateWith({ shipping, payment, activeStep: 'payment' });
    expect(getStepVisibility(state, 'review')).toBe('hidden');
  });

  it('revision se ve una vez que envio y pago estan completos', () => {
    const state = stateWith({ shipping, payment, activeStep: 'review' });
    expect(getStepVisibility(state, 'review')).toBe('summary');
  });
});

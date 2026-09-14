import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearCheckoutDraft,
  readCheckoutDraft,
  writeCheckoutDraft,
} from '@/features/checkout/state/checkoutDraftStorage';
import type { CheckoutDraftState } from '@/features/checkout/state/checkoutDraftReducer';

const UID = 'user-1';
const OTHER_UID = 'user-2';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const freshDraftShape = {
  shipping: null,
  payment: null,
  activeStep: 'shipping',
  orderRequestId: expect.stringMatching(UUID_PATTERN),
};

const filledState: CheckoutDraftState = {
  shipping: {
    fullName: 'Hernán Albornoz',
    address: 'Av. Siempre Viva 742',
    city: 'Springfield',
    postalCode: '1000',
    phone: '1122334455',
  },
  payment: { cardholderName: 'Hernán Albornoz', method: 'card', outcome: 'success' },
  activeStep: 'review',
  orderRequestId: '11111111-1111-4111-8111-111111111111',
};

describe('checkoutDraftStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sin nada guardado, arranca en el estado inicial con un orderRequestId nuevo', () => {
    expect(readCheckoutDraft(UID)).toEqual(freshDraftShape);
  });

  it('guarda y vuelve a leer el mismo borrador (sobrevive una recarga, F6.3)', () => {
    writeCheckoutDraft(UID, filledState);

    expect(readCheckoutDraft(UID)).toEqual(filledState);
  });

  it('el borrador de un usuario no se filtra al de otro usuario en el mismo navegador', () => {
    writeCheckoutDraft(UID, filledState);

    expect(readCheckoutDraft(OTHER_UID)).toEqual(freshDraftShape);
  });

  it('si el JSON guardado esta corrupto, vuelve al estado inicial en vez de fallar', () => {
    localStorage.setItem(`clack:checkout-draft:${UID}`, '{esto no es json valido');

    expect(readCheckoutDraft(UID)).toEqual(freshDraftShape);
  });

  it('si el esquema guardado es de una version vieja, vuelve al estado inicial', () => {
    localStorage.setItem(`clack:checkout-draft:${UID}`, JSON.stringify({ foo: 'bar' }));

    expect(readCheckoutDraft(UID)).toEqual(freshDraftShape);
  });

  it('si el borrador guardado viola el invariante paso/datos (ej. edicion manual), vuelve al estado inicial', () => {
    localStorage.setItem(
      `clack:checkout-draft:${UID}`,
      JSON.stringify({
        shipping: null,
        payment: null,
        activeStep: 'review',
        orderRequestId: '11111111-1111-1111-1111-111111111111',
      }),
    );

    expect(readCheckoutDraft(UID)).toEqual(freshDraftShape);
  });

  it('si el orderRequestId guardado no es un uuid valido, vuelve al estado inicial', () => {
    localStorage.setItem(
      `clack:checkout-draft:${UID}`,
      JSON.stringify({ shipping: null, payment: null, activeStep: 'shipping', orderRequestId: 'no-es-un-uuid' }),
    );

    expect(readCheckoutDraft(UID)).toEqual(freshDraftShape);
  });

  it('clearCheckoutDraft borra solo el borrador del uid indicado', () => {
    writeCheckoutDraft(UID, filledState);
    writeCheckoutDraft(OTHER_UID, filledState);

    clearCheckoutDraft(UID);

    expect(readCheckoutDraft(UID)).toEqual(freshDraftShape);
    expect(readCheckoutDraft(OTHER_UID)).toEqual(filledState);
  });
});

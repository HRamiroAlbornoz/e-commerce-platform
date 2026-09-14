import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCheckoutDraft } from '@/features/checkout/hooks/useCheckoutDraft';
import { readCheckoutDraft } from '@/features/checkout/state/checkoutDraftStorage';
import type { PaymentDraft, ShippingDetails } from '@shared/schemas/checkout';

const UID = 'user-1';

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

describe('useCheckoutDraft', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('arranca leyendo el borrador ya guardado para ese uid', () => {
    const { result: seed } = renderHook(() => useCheckoutDraft(UID));
    act(() => seed.current.submitShipping(shipping));

    const { result } = renderHook(() => useCheckoutDraft(UID));

    expect(result.current.shipping).toEqual(shipping);
    expect(result.current.activeStep).toBe('payment');
  });

  it('cada cambio de estado se persiste para ese uid (sobrevive una recarga, F6.3)', () => {
    const { result } = renderHook(() => useCheckoutDraft(UID));

    act(() => result.current.submitShipping(shipping));
    act(() => result.current.submitPayment(payment));

    expect(readCheckoutDraft(UID)).toEqual({ shipping, payment, activeStep: 'review' });
  });

  it('editShipping vuelve al paso de envio sin perder el pago ya cargado', () => {
    const { result } = renderHook(() => useCheckoutDraft(UID));

    act(() => result.current.submitShipping(shipping));
    act(() => result.current.submitPayment(payment));
    act(() => result.current.editShipping());

    expect(result.current.activeStep).toBe('shipping');
    expect(result.current.payment).toEqual(payment);
  });
});

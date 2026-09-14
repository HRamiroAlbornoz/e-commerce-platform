import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ShippingSummary } from '@/features/checkout/components/ShippingSummary';
import type { ShippingDetails } from '@shared/schemas/checkout';

const shipping: ShippingDetails = {
  fullName: 'Hernán Albornoz',
  address: 'Av. Siempre Viva 742',
  city: 'Springfield',
  postalCode: '1000',
  phone: '1122334455',
};

describe('ShippingSummary', () => {
  it('muestra los datos de envio ya cargados', () => {
    render(<ShippingSummary shipping={shipping} onEdit={vi.fn()} />);

    expect(screen.getByText(shipping.fullName)).toBeInTheDocument();
    expect(screen.getByText(shipping.phone)).toBeInTheDocument();
  });

  it('editar dispara el callback para volver al formulario', () => {
    const onEdit = vi.fn();
    render(<ShippingSummary shipping={shipping} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

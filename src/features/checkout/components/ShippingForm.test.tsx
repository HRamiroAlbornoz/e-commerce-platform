import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ShippingForm } from '@/features/checkout/components/ShippingForm';
import type { ShippingDetails } from '@shared/schemas/checkout';

const shipping: ShippingDetails = {
  fullName: 'Hernán Albornoz',
  address: 'Av. Siempre Viva 742',
  city: 'Springfield',
  postalCode: '1000',
  phone: '1122334455',
};

function fillValidForm() {
  fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: shipping.fullName } });
  fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: shipping.address } });
  fireEvent.change(screen.getByLabelText('Ciudad'), { target: { value: shipping.city } });
  fireEvent.change(screen.getByLabelText('Código postal'), { target: { value: shipping.postalCode } });
  fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: shipping.phone } });
}

describe('ShippingForm', () => {
  it('con todos los campos completos, llama a onSubmit con los datos ingresados', async () => {
    const onSubmit = vi.fn();
    render(<ShippingForm defaultValues={null} onSubmit={onSubmit} />);

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Continuar a pago' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(shipping));
  });

  it('con la direccion vacia, muestra el error puntual y no llama a onSubmit (F6.4)', async () => {
    const onSubmit = vi.fn();
    render(<ShippingForm defaultValues={null} onSubmit={onSubmit} />);

    fillValidForm();
    fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continuar a pago' }));

    await waitFor(() => {
      expect(screen.getByText('Ingresá la dirección.')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('precarga los campos con un envio ya guardado, para editarlo sin perder lo tipeado (F6.2)', () => {
    render(<ShippingForm defaultValues={shipping} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('Nombre completo')).toHaveValue(shipping.fullName);
    expect(screen.getByLabelText('Dirección')).toHaveValue(shipping.address);
  });
});

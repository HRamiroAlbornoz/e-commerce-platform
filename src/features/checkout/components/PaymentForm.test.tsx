import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PaymentForm } from '@/features/checkout/components/PaymentForm';
import type { PaymentDraft } from '@shared/schemas/checkout';

describe('PaymentForm', () => {
  it('por defecto, el resultado simulado es Aprobado y se puede confirmar con solo el nombre del titular', async () => {
    const onSubmit = vi.fn();
    render(<PaymentForm defaultValues={null} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Nombre del titular'), {
      target: { value: 'Hernán Albornoz' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Revisar compra' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        cardholderName: 'Hernán Albornoz',
        method: 'card',
        outcome: 'success',
      } satisfies PaymentDraft),
    );
  });

  it('se puede elegir forzar el resultado a Rechazado, para probar el camino infeliz', async () => {
    const onSubmit = vi.fn();
    render(<PaymentForm defaultValues={null} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Nombre del titular'), {
      target: { value: 'Hernán Albornoz' },
    });
    fireEvent.click(screen.getByRole('radio', { name: 'Rechazado' }));
    fireEvent.click(screen.getByRole('button', { name: 'Revisar compra' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ outcome: 'error' }),
      ),
    );
  });

  it('sin nombre del titular, muestra el error puntual y no llama a onSubmit (F6.4)', async () => {
    const onSubmit = vi.fn();
    render(<PaymentForm defaultValues={null} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Revisar compra' }));

    await waitFor(() => {
      expect(screen.getByText('Ingresá el nombre del titular.')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

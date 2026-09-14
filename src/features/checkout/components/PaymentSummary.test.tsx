import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PaymentSummary } from '@/features/checkout/components/PaymentSummary';
import type { PaymentDraft } from '@shared/schemas/checkout';

describe('PaymentSummary', () => {
  it('traduce el resultado simulado a texto legible', () => {
    const payment: PaymentDraft = { cardholderName: 'Hernán Albornoz', method: 'card', outcome: 'error' };
    render(<PaymentSummary payment={payment} onEdit={vi.fn()} />);

    expect(screen.getByText('Resultado simulado: Rechazado')).toBeInTheDocument();
  });

  it('editar dispara el callback para volver al formulario', () => {
    const onEdit = vi.fn();
    const payment: PaymentDraft = { cardholderName: 'Hernán Albornoz', method: 'card', outcome: 'success' };
    render(<PaymentSummary payment={payment} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CheckoutSummaryCard } from '@/features/checkout/components/CheckoutSummaryCard';

describe('CheckoutSummaryCard', () => {
  it('muestra el titulo y el contenido', () => {
    render(
      <CheckoutSummaryCard title="Envío" onEdit={vi.fn()}>
        <p>Detalle</p>
      </CheckoutSummaryCard>,
    );

    expect(screen.getByText('Envío')).toBeInTheDocument();
    expect(screen.getByText('Detalle')).toBeInTheDocument();
  });

  it('editar dispara el callback', () => {
    const onEdit = vi.fn();
    render(
      <CheckoutSummaryCard title="Pago" onEdit={onEdit}>
        <p>Detalle</p>
      </CheckoutSummaryCard>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

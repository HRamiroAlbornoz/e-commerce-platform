import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewSection } from '@/features/checkout/components/ReviewSection';

describe('ReviewSection', () => {
  it('muestra el total a confirmar, redondeado a dos decimales', () => {
    render(<ReviewSection total={89997} />);

    expect(screen.getByText(/89.997/)).toBeInTheDocument();
  });

  it('muestra el boton de confirmar compra', () => {
    render(<ReviewSection total={1000} />);

    expect(screen.getByRole('button', { name: 'Confirmar compra' })).toBeInTheDocument();
  });
});

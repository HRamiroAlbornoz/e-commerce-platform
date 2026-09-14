import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { OrderConfirmation } from '@/features/checkout/components/OrderConfirmation';

function renderOrderConfirmation(orderId: string) {
  const Stub = createRoutesStub([{ path: '/checkout', Component: () => <OrderConfirmation orderId={orderId} /> }]);
  return render(<Stub initialEntries={['/checkout']} />);
}

describe('OrderConfirmation', () => {
  it('muestra los ultimos 8 caracteres del id en mayuscula como numero de pedido', () => {
    renderOrderConfirmation('aaaa1111-bbbb-2222-cccc-333344445555');

    expect(screen.getByText(/44445555/)).toBeInTheDocument();
  });

  it('ofrece un link hacia mis ordenes (F6.10)', () => {
    renderOrderConfirmation('aaaa1111-bbbb-2222-cccc-333344445555');

    expect(screen.getByRole('link', { name: 'Ver mis órdenes' })).toHaveAttribute('href', '/orders');
  });
});

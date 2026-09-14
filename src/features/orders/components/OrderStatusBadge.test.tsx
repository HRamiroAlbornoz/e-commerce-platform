import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import type { OrderStatus } from '@shared/schemas/order';

describe('OrderStatusBadge', () => {
  it.each([
    ['pending', 'Pendiente'],
    ['processing', 'En proceso'],
    ['completed', 'Completada'],
    ['cancelled', 'Cancelada'],
  ] satisfies [OrderStatus, string][])('muestra siempre el texto del estado %s (F7.5)', (status, label) => {
    render(<OrderStatusBadge status={status} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('cada estado tiene una clase distinta, no solo un color (F7.5)', () => {
    const { unmount: unmountPending } = render(<OrderStatusBadge status="pending" />);
    const pendingClass = screen.getByText('Pendiente').className;
    unmountPending();

    const { unmount: unmountCancelled } = render(<OrderStatusBadge status="cancelled" />);
    const cancelledClass = screen.getByText('Cancelada').className;
    unmountCancelled();

    const { unmount: unmountCompleted } = render(<OrderStatusBadge status="completed" />);
    const completedClass = screen.getByText('Completada').className;
    unmountCompleted();

    expect(new Set([pendingClass, cancelledClass, completedClass]).size).toBe(3);
  });
});

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { NotFoundState } from '@/components/states/NotFoundState';

describe('NotFoundState', () => {
  it('ofrece un enlace para volver a la tienda desde una URL inexistente', () => {
    const Stub = createRoutesStub([{ path: '/no-existe', Component: NotFoundState }]);
    render(<Stub initialEntries={['/no-existe']} />);

    expect(screen.getByRole('link', { name: 'Volver a la tienda' })).toHaveAttribute('href', '/');
  });
});

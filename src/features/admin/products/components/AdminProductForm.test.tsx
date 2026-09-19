import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import type { User } from 'firebase/auth';
import { AdminProductForm } from '@/features/admin/products/components/AdminProductForm';
import { useImageUpload } from '@/features/admin/uploads/hooks/useImageUpload';

vi.mock('@/features/admin/uploads/hooks/useImageUpload', () => ({ useImageUpload: vi.fn() }));

const fakeUser = {} as User;

function renderForm() {
  const Stub = createRoutesStub([
    {
      path: '/admin/products/new',
      Component: () => <AdminProductForm user={fakeUser} existingProduct={null} />,
    },
  ]);
  return render(<Stub initialEntries={['/admin/products/new']} />);
}

describe('AdminProductForm', () => {
  it('mientras una imagen se esta subiendo, el boton de guardar queda deshabilitado (no se guarda con la imagen vieja)', () => {
    vi.mocked(useImageUpload).mockReturnValue({
      state: { status: 'uploading', progress: 50 },
      upload: vi.fn(),
    });

    renderForm();

    expect(screen.getByRole('button', { name: 'Guardando…' })).toBeDisabled();
  });

  it('con la subida de imagen en idle, el boton de guardar esta habilitado', () => {
    vi.mocked(useImageUpload).mockReturnValue({
      state: { status: 'idle' },
      upload: vi.fn(),
    });

    renderForm();

    expect(screen.getByRole('button', { name: 'Crear producto' })).not.toBeDisabled();
  });
});

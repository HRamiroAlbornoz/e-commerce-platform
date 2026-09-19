import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ImageUploadField } from '@/features/admin/products/components/ImageUploadField';
import type { ImageUploadState } from '@/features/admin/uploads/hooks/useImageUpload';

describe('ImageUploadField', () => {
  it('en edicion, muestra la imagen actual como preview sin pedir una nueva subida', () => {
    render(
      <ImageUploadField
        currentImageUrl="https://bucket.s3.amazonaws.com/products/actual.jpg"
        state={{ status: 'idle' }}
        onFileSelected={vi.fn()}
        error={undefined}
      />,
    );

    expect(screen.getByAltText('Vista previa de la imagen del producto')).toHaveAttribute(
      'src',
      'https://bucket.s3.amazonaws.com/products/actual.jpg',
    );
  });

  it('mientras sube, deshabilita el input y muestra la barra de progreso (F10.5)', () => {
    render(
      <ImageUploadField
        currentImageUrl=""
        state={{ status: 'uploading', progress: 40 }}
        onFileSelected={vi.fn()}
        error={undefined}
      />,
    );

    expect(screen.getByLabelText('Imagen')).toBeDisabled();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');
  });

  it('al elegir un archivo, llama a onFileSelected con ese archivo', () => {
    const onFileSelected = vi.fn();

    render(
      <ImageUploadField
        currentImageUrl=""
        state={{ status: 'idle' }}
        onFileSelected={onFileSelected}
        error={undefined}
      />,
    );

    const file = new File([new Uint8Array(10)], 'foto.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('Imagen'), { target: { files: [file] } });

    expect(onFileSelected).toHaveBeenCalledWith(file);
  });

  it('cuando la subida falla, muestra el mensaje del estado, no el error de validacion del form (F10.6)', () => {
    const state: ImageUploadState = {
      status: 'error',
      message: 'La URL para subir venció. Volvé a intentar.',
    };

    render(
      <ImageUploadField
        currentImageUrl=""
        state={state}
        onFileSelected={vi.fn()}
        error="URL inválida"
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'La URL para subir venció. Volvé a intentar.',
    );
  });
});

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EditableNumberCell } from '@/features/admin/products/components/EditableNumberCell';

describe('EditableNumberCell', () => {
  it('no llama a onSave si el valor no cambio al perder el foco', () => {
    const onSave = vi.fn();
    render(<EditableNumberCell value={100} label="Precio — Teclado" min={0} step={1} disabled={false} onSave={onSave} />);

    const input = screen.getByLabelText('Precio — Teclado');
    fireEvent.blur(input);

    expect(onSave).not.toHaveBeenCalled();
  });

  it('guarda el nuevo valor cuando cambia y el guardado tiene exito', async () => {
    const onSave = vi.fn().mockResolvedValue(150);
    render(<EditableNumberCell value={100} label="Precio — Teclado" min={0} step={1} disabled={false} onSave={onSave} />);

    const input = screen.getByLabelText('Precio — Teclado');
    fireEvent.change(input, { target: { value: '150' } });
    fireEvent.blur(input);

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(150));
    expect(input).toHaveValue(150);
  });

  it('muestra el valor normalizado por el servidor, no el que tipeo el usuario, cuando difieren', async () => {
    const onSave = vi.fn().mockResolvedValue(150.68);
    render(<EditableNumberCell value={100} label="Precio — Teclado" min={0} step={0.01} disabled={false} onSave={onSave} />);

    const input = screen.getByLabelText('Precio — Teclado');
    fireEvent.change(input, { target: { value: '150.678' } });
    fireEvent.blur(input);

    expect(onSave).toHaveBeenCalledWith(150.678);
    await waitFor(() => expect(input).toHaveValue(150.68));
  });

  it('revierte al valor anterior y explica el error cuando el guardado falla (F9.5)', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('El servidor rechazó el cambio.'));
    render(<EditableNumberCell value={100} label="Stock — Teclado" min={0} step={1} disabled={false} onSave={onSave} />);

    const input = screen.getByLabelText('Stock — Teclado');
    fireEvent.change(input, { target: { value: '200' } });
    fireEvent.blur(input);

    await waitFor(() => expect(input).toHaveValue(100));
    expect(screen.getByRole('alert')).toHaveTextContent('El servidor rechazó el cambio.');
  });

  it('con un valor invalido, revierte y no llama a onSave', () => {
    const onSave = vi.fn();
    render(<EditableNumberCell value={100} label="Stock — Teclado" min={0} step={1} disabled={false} onSave={onSave} />);

    const input = screen.getByLabelText('Stock — Teclado');
    fireEvent.change(input, { target: { value: '-5' } });
    fireEvent.blur(input);

    expect(onSave).not.toHaveBeenCalled();
    expect(input).toHaveValue(100);
    expect(screen.getByRole('alert')).toHaveTextContent('Ingresá un valor válido.');
  });

  it('deshabilitada mientras otra accion de la fila esta en curso', () => {
    render(
      <EditableNumberCell value={100} label="Precio — Teclado" min={0} step={1} disabled onSave={vi.fn()} />,
    );

    expect(screen.getByLabelText('Precio — Teclado')).toBeDisabled();
  });
});

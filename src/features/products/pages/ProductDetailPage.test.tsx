import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage';
import { getProductById } from '@/features/products/services/getProductById';
import type { Product } from '@shared/schemas/product';

vi.mock('@/features/products/services/getProductById', () => ({
  getProductById: vi.fn(),
}));

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    name: 'Teclado mecanico X',
    nameLower: 'teclado mecanico x',
    description: 'Descripcion de prueba.',
    price: 89999,
    stock: 3,
    category: 'keyboard',
    displayColor: 'lime',
    imageUrl: 'https://placehold.co/600x400',
    isActive: true,
    specs: [
      { label: 'Switches', value: 'Lineales rojos' },
      { label: 'Formato', value: 'TKL' },
    ],
    curatorialNote: 'Nota curatorial de prueba.',
    ratingAverage: 4.5,
    ratingCount: 12,
    orderCount: 3,
    unitsSold: 5,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

function renderProductDetailPage(id = 'product-1') {
  const Stub = createRoutesStub([{ path: '/products/:id', Component: ProductDetailPage }]);
  return render(<Stub initialEntries={[`/products/${id}`]} />);
}

describe('ProductDetailPage', () => {
  beforeEach(() => {
    vi.mocked(getProductById).mockReset();
  });

  it('muestra nombre, descripcion, specs, precio y nota curatorial cuando carga el producto', async () => {
    vi.mocked(getProductById).mockResolvedValue(buildProduct());

    renderProductDetailPage();

    await waitFor(() => screen.getByText('Teclado mecanico X'));

    expect(screen.getByText('Descripcion de prueba.')).toBeInTheDocument();
    expect(screen.getByText('Nota curatorial de prueba.')).toBeInTheDocument();
    expect(screen.getByText('Switches')).toBeInTheDocument();
    expect(screen.getByText('Lineales rojos')).toBeInTheDocument();
    expect(screen.getByText('$89.999')).toBeInTheDocument();
  });

  it('muestra un link a las reseñas cuando hay al menos una', async () => {
    vi.mocked(getProductById).mockResolvedValue(buildProduct({ ratingCount: 12, ratingAverage: 4.5 }));

    renderProductDetailPage();

    const reviewsLink = await screen.findByRole('link', { name: /4\.5.*12 reseñas/i });
    expect(reviewsLink).toHaveAttribute('href', '/products/product-1/reviews');
  });

  it('muestra "todavia sin reseñas" cuando no hay ninguna', async () => {
    vi.mocked(getProductById).mockResolvedValue(buildProduct({ ratingCount: 0 }));

    renderProductDetailPage();

    await waitFor(() => screen.getByText(/todavia sin reseñas/i));
  });

  it('muestra la pantalla de no encontrado cuando el producto no existe', async () => {
    vi.mocked(getProductById).mockResolvedValue(null);

    renderProductDetailPage('missing-id');

    await waitFor(() => screen.getByText('Producto no encontrado'));
  });

  it('muestra un error con reintentar si la consulta falla', async () => {
    vi.mocked(getProductById).mockRejectedValue(new Error('network-error'));

    renderProductDetailPage();

    await waitFor(() => {
      expect(screen.getByText('No pudimos cargar el producto. Intenta de nuevo.')).toBeInTheDocument();
    });
  });

  it('con stock cero, deshabilita agregar al carrito y no muestra el selector de cantidad', async () => {
    vi.mocked(getProductById).mockResolvedValue(buildProduct({ stock: 0 }));

    renderProductDetailPage();

    await waitFor(() => screen.getByText('Sin stock'));

    expect(screen.getByRole('button', { name: /agregar al carrito/i })).toBeDisabled();
    expect(screen.queryByRole('group', { name: /cantidad/i })).not.toBeInTheDocument();
  });

  it('el selector de cantidad no deja superar el stock disponible', async () => {
    vi.mocked(getProductById).mockResolvedValue(buildProduct({ stock: 2 }));

    renderProductDetailPage();

    await waitFor(() => screen.getByRole('group', { name: /cantidad/i }));

    const increaseButton = screen.getByRole('button', { name: /sumar uno/i });
    const decreaseButton = screen.getByRole('button', { name: /restar uno/i });

    expect(decreaseButton).toBeDisabled();

    fireEvent.click(increaseButton);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(increaseButton).toBeDisabled();
    expect(decreaseButton).not.toBeDisabled();
  });
});

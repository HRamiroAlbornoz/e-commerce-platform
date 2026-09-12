import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { CatalogPage } from '@/features/products/pages/CatalogPage';
import { getActiveProducts } from '@/features/products/services/getActiveProducts';
import type { Product } from '@shared/schemas/product';

vi.mock('@/features/products/services/getActiveProducts', () => ({
  getActiveProducts: vi.fn(),
}));

function buildProduct(overrides: Partial<Product>): Product {
  return {
    id: 'product-1',
    name: 'Teclado mecanico X',
    nameLower: 'teclado mecanico x',
    description: 'Descripcion de prueba.',
    price: 10000,
    stock: 5,
    category: 'keyboard',
    displayColor: 'lime',
    imageUrl: 'https://placehold.co/600x400',
    isActive: true,
    ratingAverage: 4,
    ratingCount: 1,
    orderCount: 0,
    unitsSold: 0,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

const keyboardFixture = buildProduct({ id: 'kb-1', name: 'Teclado mecanico X' });
const mouseFixture = buildProduct({
  id: 'mouse-1',
  name: 'Mouse ergonomico Y',
  nameLower: 'mouse ergonomico y',
  category: 'mouse',
});

function renderCatalogPage(initialPath = '/') {
  const Stub = createRoutesStub([{ path: '/', Component: CatalogPage }]);
  return render(<Stub initialEntries={[initialPath]} />);
}

describe('CatalogPage', () => {
  beforeEach(() => {
    vi.mocked(getActiveProducts).mockReset();
  });

  it('lee la categoria inicial de la URL y consulta con ese filtro', async () => {
    vi.mocked(getActiveProducts).mockResolvedValue([keyboardFixture]);

    renderCatalogPage('/?category=keyboard');

    await waitFor(() => screen.getByText('Teclado mecanico X'));
    expect(getActiveProducts).toHaveBeenCalledWith({ category: 'keyboard', searchTerm: '' });
  });

  it('descarta una categoria invalida en la URL en vez de romper', async () => {
    vi.mocked(getActiveProducts).mockResolvedValue([keyboardFixture, mouseFixture]);

    renderCatalogPage('/?category=laptop');

    await waitFor(() => {
      expect(getActiveProducts).toHaveBeenCalledWith({ category: undefined, searchTerm: '' });
    });
  });

  it('al elegir una categoria en el riel, refetchea con ese filtro', async () => {
    vi.mocked(getActiveProducts).mockResolvedValue([keyboardFixture, mouseFixture]);

    renderCatalogPage('/');
    await waitFor(() => screen.getByText('Teclado mecanico X'));

    fireEvent.click(screen.getByRole('button', { name: /^mouse$/i }));

    await waitFor(() => {
      expect(getActiveProducts).toHaveBeenLastCalledWith({ category: 'mouse', searchTerm: '' });
    });
  });

  it('espera a que el usuario termine de escribir antes de consultar por nombre', async () => {
    vi.mocked(getActiveProducts).mockResolvedValue([keyboardFixture]);

    renderCatalogPage('/');
    await waitFor(() => screen.getByText('Teclado mecanico X'));

    const searchInput = screen.getByRole('searchbox', { name: /buscar productos por nombre/i });
    fireEvent.change(searchInput, { target: { value: 't' } });
    fireEvent.change(searchInput, { target: { value: 'te' } });
    fireEvent.change(searchInput, { target: { value: 'tec' } });

    await waitFor(() => {
      expect(getActiveProducts).toHaveBeenLastCalledWith({
        category: undefined,
        searchTerm: 'tec',
      });
    });

    expect(getActiveProducts).toHaveBeenCalledTimes(2);
  });

  it('distingue sin resultados de busqueda de catalogo sin productos', async () => {
    vi.mocked(getActiveProducts).mockResolvedValue([]);

    renderCatalogPage('/?q=zzz');

    await waitFor(() => screen.getByText('Sin resultados'));
  });

  it('muestra el mensaje de catalogo vacio cuando no hay filtro activo', async () => {
    vi.mocked(getActiveProducts).mockResolvedValue([]);

    renderCatalogPage('/');

    await waitFor(() => screen.getByText('Todavia no hay productos'));
  });
});

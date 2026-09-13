import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { CatalogPage } from '@/features/products/pages/CatalogPage';
import { getActiveProducts, type ProductsPage } from '@/features/products/services/getActiveProducts';
import { useCart } from '@/hooks/useCart';
import { buildCartContextValue } from '@/test/mocks/cartContextValue';
import type { Product } from '@shared/schemas/product';

vi.mock('@/features/products/services/getActiveProducts', () => ({
  getActiveProducts: vi.fn(),
}));

vi.mock('@/hooks/useCart', () => ({ useCart: vi.fn() }));

vi.mocked(useCart).mockReturnValue(buildCartContextValue());

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
    specs: [{ label: 'Switches', value: 'Lineales rojos' }],
    curatorialNote: 'Nota curatorial de prueba.',
    ratingAverage: 4,
    ratingCount: 1,
    orderCount: 0,
    unitsSold: 0,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

function buildPage(products: Product[], overrides: Partial<ProductsPage> = {}): ProductsPage {
  return { products, lastDoc: null, hasNextPage: false, ...overrides };
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
    vi.mocked(getActiveProducts).mockResolvedValue(buildPage([keyboardFixture]));

    renderCatalogPage('/?category=keyboard');

    await waitFor(() => screen.getByText('Teclado mecanico X'));
    expect(getActiveProducts).toHaveBeenCalledWith({ category: 'keyboard', searchTerm: '' });
  });

  it('descarta una categoria invalida en la URL en vez de romper', async () => {
    vi.mocked(getActiveProducts).mockResolvedValue(buildPage([keyboardFixture, mouseFixture]));

    renderCatalogPage('/?category=laptop');

    await waitFor(() => {
      expect(getActiveProducts).toHaveBeenCalledWith({ category: undefined, searchTerm: '' });
    });
  });

  it('al elegir una categoria en el riel, refetchea con ese filtro', async () => {
    vi.mocked(getActiveProducts).mockResolvedValue(buildPage([keyboardFixture, mouseFixture]));

    renderCatalogPage('/');
    await waitFor(() => screen.getByText('Teclado mecanico X'));

    fireEvent.click(screen.getByRole('button', { name: /^mouse$/i }));

    await waitFor(() => {
      expect(getActiveProducts).toHaveBeenLastCalledWith({ category: 'mouse', searchTerm: '' });
    });
  });

  it('espera a que el usuario termine de escribir antes de consultar por nombre', async () => {
    vi.mocked(getActiveProducts).mockResolvedValue(buildPage([keyboardFixture]));

    renderCatalogPage('/');
    await waitFor(() => screen.getByText('Teclado mecanico X'));

    const searchInput = screen.getByRole('searchbox', { name: /buscar productos por nombre/i });
    fireEvent.change(searchInput, { target: { value: 't' } });
    fireEvent.change(searchInput, { target: { value: 'te' } });
    fireEvent.change(searchInput, { target: { value: 'tec' } });

    await waitFor(() => {
      expect(getActiveProducts).toHaveBeenLastCalledWith({ category: undefined, searchTerm: 'tec' });
    });

    expect(getActiveProducts).toHaveBeenCalledTimes(2);
  });

  it('distingue sin resultados de busqueda de catalogo sin productos', async () => {
    vi.mocked(getActiveProducts).mockResolvedValue(buildPage([]));

    renderCatalogPage('/?q=zzz');

    await waitFor(() => screen.getByText('Sin resultados'));
  });

  it('muestra el mensaje de catalogo vacio cuando no hay filtro activo', async () => {
    vi.mocked(getActiveProducts).mockResolvedValue(buildPage([]));

    renderCatalogPage('/');

    await waitFor(() => screen.getByText('Todavia no hay productos'));
  });

  it('no muestra controles de paginacion cuando todo entra en una sola pagina', async () => {
    vi.mocked(getActiveProducts).mockResolvedValue(buildPage([keyboardFixture], { hasNextPage: false }));

    renderCatalogPage('/');

    await waitFor(() => screen.getByText('Teclado mecanico X'));
    expect(screen.queryByRole('navigation', { name: /paginacion/i })).not.toBeInTheDocument();
  });

  it('siguiente avanza de pagina, y volver a la primera no repite la consulta', async () => {
    const lastDoc = { id: 'cursor-1' } as never;
    vi.mocked(getActiveProducts)
      .mockResolvedValueOnce(buildPage([keyboardFixture], { hasNextPage: true, lastDoc }))
      .mockResolvedValueOnce(buildPage([mouseFixture], { hasNextPage: false }));

    renderCatalogPage('/');
    await waitFor(() => screen.getByText('Teclado mecanico X'));

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

    await waitFor(() => screen.getByText('Mouse ergonomico Y'));
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    await waitFor(() => screen.getByText('Teclado mecanico X'));

    expect(getActiveProducts).toHaveBeenCalledTimes(2);
  });

  it('cambiar de categoria vuelve a la primera pagina', async () => {
    vi.mocked(getActiveProducts).mockResolvedValue(
      buildPage([keyboardFixture], { hasNextPage: true, lastDoc: {} as never }),
    );

    renderCatalogPage('/?page=2');
    await waitFor(() => screen.getByText('Teclado mecanico X'));

    fireEvent.click(screen.getByRole('button', { name: /^mouse$/i }));

    await waitFor(() => {
      expect(getActiveProducts).toHaveBeenLastCalledWith({ category: 'mouse', searchTerm: '' });
    });
  });
});

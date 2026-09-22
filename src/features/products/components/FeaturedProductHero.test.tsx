import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { FeaturedProductHero } from '@/features/products/components/FeaturedProductHero';
import { useCart } from '@/hooks/useCart';
import { buildCartContextValue } from '@/test/mocks/cartContextValue';
import type { Product } from '@shared/schemas/product';

vi.mock('@/hooks/useCart', () => ({ useCart: vi.fn() }));

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    name: 'Teclado Aurora',
    nameLower: 'teclado aurora',
    description: 'Descripcion de prueba.',
    price: 89999,
    stock: 5,
    category: 'keyboard',
    displayColor: 'lime',
    imageUrl: 'https://placehold.co/600x400',
    isActive: true,
    specs: [{ label: 'Switches', value: 'Lineales rojos' }],
    curatorialNote: 'Para quien escribe rapido y no negocia el sonido.',
    ratingAverage: 4.5,
    ratingCount: 12,
    orderCount: 3,
    unitsSold: 5,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

function renderFeaturedProductHero(product: Product) {
  function HeroRoute() {
    return <FeaturedProductHero product={product} />;
  }
  const Stub = createRoutesStub([{ path: '/', Component: HeroRoute }]);
  return render(<Stub initialEntries={['/']} />);
}

describe('FeaturedProductHero', () => {
  it('muestra el nombre como encabezado, el precio y la nota curatorial (F14.1)', () => {
    vi.mocked(useCart).mockReturnValue(buildCartContextValue());

    renderFeaturedProductHero(buildProduct());

    expect(screen.getByRole('heading', { level: 2, name: 'Teclado Aurora' })).toBeInTheDocument();
    expect(screen.getByText('$89.999')).toBeInTheDocument();
    expect(
      screen.getByText('Para quien escribe rapido y no negocia el sonido.'),
    ).toBeInTheDocument();
  });

  it('el nombre enlaza al detalle del producto como el unico link accesible por teclado', () => {
    vi.mocked(useCart).mockReturnValue(buildCartContextValue());

    renderFeaturedProductHero(buildProduct());

    const detailLinks = screen.getAllByRole('link', { name: /teclado aurora/i });
    expect(detailLinks).toHaveLength(1);
    expect(detailLinks[0]).toHaveAttribute('href', '/products/product-1');
  });

  it('la imagen tambien enlaza al detalle, pero queda fuera del tabbing por ser redundante', () => {
    vi.mocked(useCart).mockReturnValue(buildCartContextValue());

    const { container } = renderFeaturedProductHero(buildProduct());

    const imageLink = container.querySelector('a[aria-hidden="true"]');
    expect(imageLink).toHaveAttribute('href', '/products/product-1');
    expect(imageLink).toHaveAttribute('tabindex', '-1');
  });

  it('expone la accion primaria de agregar al carrito (F14.2)', () => {
    const addItem = vi.fn();
    vi.mocked(useCart).mockReturnValue(buildCartContextValue({ addItem }));

    renderFeaturedProductHero(buildProduct({ stock: 5 }));

    screen.getByRole('button', { name: 'Agregar al carrito' }).click();

    expect(addItem).toHaveBeenCalledWith('product-1', 1, 5);
  });

  it('ofrece un link secundario hacia el resto de la sala (F14.2)', () => {
    vi.mocked(useCart).mockReturnValue(buildCartContextValue());

    renderFeaturedProductHero(buildProduct());

    expect(screen.getByRole('link', { name: /ver el resto de la sala/i })).toHaveAttribute(
      'href',
      '#catalogo',
    );
  });
});

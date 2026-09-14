import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import type { User } from 'firebase/auth';
import { ProductReviewsPage } from '@/features/reviews/pages/ProductReviewsPage';
import { useAuth } from '@/hooks/useAuth';
import { useProduct } from '@/features/products/hooks/useProduct';
import { useProductReviews } from '@/features/reviews/hooks/useProductReviews';
import type { AuthContextValue } from '@/contexts/AuthContext';
import type { Product } from '@shared/schemas/product';
import type { Review } from '@shared/schemas/review';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('@/features/products/hooks/useProduct', () => ({ useProduct: vi.fn() }));
vi.mock('@/features/reviews/hooks/useProductReviews', () => ({ useProductReviews: vi.fn() }));
vi.mock('@/features/reviews/services/saveReview', () => ({ saveReview: vi.fn() }));
vi.mock('@/features/reviews/services/recalculateProductRating', () => ({
  recalculateProductRating: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/features/reviews/components/DeleteReviewModal', () => ({
  DeleteReviewModal: ({ onDeleted, onClose }: { onDeleted: () => void; onClose: () => void }) => (
    <div role="dialog">
      <button onClick={onDeleted}>mock-confirmar-borrado</button>
      <button onClick={onClose}>mock-volver</button>
    </div>
  ),
}));

const authenticatedUser = { uid: 'user-1' } as User;

const productFixture: Product = {
  id: 'product-1',
  name: 'Teclado Aurora',
  nameLower: 'teclado aurora',
  description: 'Descripcion',
  price: 89999,
  stock: 5,
  category: 'keyboard',
  displayColor: 'lime',
  imageUrl: 'https://placehold.co/600x400',
  isActive: true,
  specs: [{ label: 'Switches', value: 'Lineales' }],
  curatorialNote: 'Nota curatorial',
  ratingAverage: 4,
  ratingCount: 1,
  orderCount: 3,
  unitsSold: 5,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

function reviewFixture(overrides: Partial<Review> = {}): Review {
  return {
    userId: 'user-2',
    displayName: 'Otra Persona',
    rating: 4,
    comment: 'Muy bueno.',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

function renderPage() {
  const Stub = createRoutesStub([{ path: '/products/:id/reviews', Component: ProductReviewsPage }]);
  return render(<Stub initialEntries={['/products/product-1/reviews']} />);
}

describe('ProductReviewsPage', () => {
  beforeEach(() => {
    vi.mocked(useProduct).mockReturnValue({ status: 'success', product: productFixture, retry: vi.fn() });
  });

  it('producto no encontrado muestra el mensaje correspondiente', () => {
    vi.mocked(useProduct).mockReturnValue({ status: 'not-found', retry: vi.fn() });
    vi.mocked(useAuth).mockReturnValue({ status: 'anonymous', logout: vi.fn() } satisfies AuthContextValue);

    renderPage();

    expect(screen.getByText('Producto no encontrado')).toBeInTheDocument();
  });

  it('si la consulta del producto falla, muestra el error', () => {
    vi.mocked(useProduct).mockReturnValue({
      status: 'error',
      message: 'No pudimos cargar el producto. Intenta de nuevo.',
      retry: vi.fn(),
    });
    vi.mocked(useAuth).mockReturnValue({ status: 'anonymous', logout: vi.fn() } satisfies AuthContextValue);

    renderPage();

    expect(screen.getByText('No pudimos cargar el producto. Intenta de nuevo.')).toBeInTheDocument();
  });

  it('sin reseñas, muestra el estado vacio que invita a escribir la primera (F8.6)', () => {
    vi.mocked(useAuth).mockReturnValue({ status: 'anonymous', logout: vi.fn() } satisfies AuthContextValue);
    vi.mocked(useProductReviews).mockReturnValue({ status: 'success', reviews: [], retry: vi.fn() });

    renderPage();

    expect(screen.getByText('Todavia sin reseñas')).toBeInTheDocument();
    expect(screen.getByText('Todavía no hay reseñas')).toBeInTheDocument();
  });

  it('con reseñas, muestra el promedio calculado y cada reseña de la lista', () => {
    vi.mocked(useAuth).mockReturnValue({ status: 'anonymous', logout: vi.fn() } satisfies AuthContextValue);
    vi.mocked(useProductReviews).mockReturnValue({
      status: 'success',
      reviews: [reviewFixture({ rating: 5 }), reviewFixture({ userId: 'user-3', rating: 4 })],
      retry: vi.fn(),
    });

    renderPage();

    expect(screen.getByText('4.5 · 2 reseñas')).toBeInTheDocument();
    expect(screen.getAllByText('Muy bueno.')).toHaveLength(2);
  });

  it('anonimo ve un link para iniciar sesion, sin formulario de reseña', () => {
    vi.mocked(useAuth).mockReturnValue({ status: 'anonymous', logout: vi.fn() } satisfies AuthContextValue);
    vi.mocked(useProductReviews).mockReturnValue({ status: 'success', reviews: [], retry: vi.fn() });

    renderPage();

    expect(screen.getByRole('link', { name: 'Iniciá sesión' })).toHaveAttribute('href', '/login');
    expect(screen.queryByRole('button', { name: 'Publicar reseña' })).not.toBeInTheDocument();
  });

  it('mientras la sesion todavia no se confirmo, no muestra ni el formulario ni el prompt de login', () => {
    vi.mocked(useAuth).mockReturnValue({ status: 'loading', logout: vi.fn() } satisfies AuthContextValue);
    vi.mocked(useProductReviews).mockReturnValue({ status: 'success', reviews: [], retry: vi.fn() });

    renderPage();

    expect(screen.queryByRole('link', { name: 'Iniciá sesión' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Publicar reseña' })).not.toBeInTheDocument();
  });

  it('un usuario autenticado sin reseña propia ve el formulario en modo alta, sin boton de borrar', () => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      user: authenticatedUser,
      role: 'customer',
      logout: vi.fn(),
    } satisfies AuthContextValue);
    vi.mocked(useProductReviews).mockReturnValue({ status: 'success', reviews: [], retry: vi.fn() });

    renderPage();

    expect(screen.getByRole('button', { name: 'Publicar reseña' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Borrar mi reseña' })).not.toBeInTheDocument();
  });

  it('un usuario autenticado con reseña propia ve el formulario precargado y el boton de borrar (F8.3)', () => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      user: authenticatedUser,
      role: 'customer',
      logout: vi.fn(),
    } satisfies AuthContextValue);
    vi.mocked(useProductReviews).mockReturnValue({
      status: 'success',
      reviews: [reviewFixture({ userId: 'user-1', rating: 2, comment: 'Esperaba mas.' })],
      retry: vi.fn(),
    });

    renderPage();

    expect(screen.getByRole('button', { name: 'Actualizar reseña' })).toBeInTheDocument();
    expect(screen.getByLabelText('Comentario')).toHaveValue('Esperaba mas.');
    expect(screen.getByRole('button', { name: 'Borrar mi reseña' })).toBeInTheDocument();
  });

  it('borrar la propia reseña abre el modal y, al confirmar, refresca la lista (F8.3)', () => {
    const retry = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      user: authenticatedUser,
      role: 'customer',
      logout: vi.fn(),
    } satisfies AuthContextValue);
    vi.mocked(useProductReviews).mockReturnValue({
      status: 'success',
      reviews: [reviewFixture({ userId: 'user-1' })],
      retry,
    });

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Borrar mi reseña' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'mock-confirmar-borrado' }));

    expect(retry).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

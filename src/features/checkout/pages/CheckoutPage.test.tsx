import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRoutesStub, useParams } from 'react-router';
import type { User } from 'firebase/auth';
import { CheckoutPage } from '@/features/checkout/pages/CheckoutPage';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useResolvedCart } from '@/features/cart/hooks/useResolvedCart';
import { createOrder } from '@/features/checkout/services/createOrder';
import { buildCartContextValue } from '@/test/mocks/cartContextValue';
import type { AuthContextValue } from '@/contexts/AuthContext';
import type { Product } from '@shared/schemas/product';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('@/hooks/useCart', () => ({ useCart: vi.fn() }));
vi.mock('@/features/cart/hooks/useResolvedCart', () => ({ useResolvedCart: vi.fn() }));
vi.mock('@/features/checkout/services/createOrder', () => ({ createOrder: vi.fn() }));

const fakeUser = {} as User;

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    name: 'Mousepad PowerPad',
    nameLower: 'mousepad powerpad',
    description: 'Descripcion',
    price: 29999,
    stock: 5,
    category: 'mousepad',
    displayColor: 'magenta',
    imageUrl: 'https://placehold.co/600x400',
    isActive: true,
    specs: [{ label: 'Tamaño', value: 'XL' }],
    curatorialNote: 'Nota',
    ratingAverage: 0,
    ratingCount: 0,
    orderCount: 0,
    unitsSold: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function OrderRouteMarker() {
  const { orderId } = useParams<{ orderId: string }>();
  return <p>Orden creada: {orderId}</p>;
}

function renderCheckoutPage() {
  const Stub = createRoutesStub([
    { path: '/checkout', Component: CheckoutPage },
    { path: '/orders/:orderId', Component: OrderRouteMarker },
  ]);
  return render(<Stub initialEntries={['/checkout']} />);
}

async function fillShipping() {
  fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Hernán Albornoz' } });
  fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'Av. Siempre Viva 742' } });
  fireEvent.change(screen.getByLabelText('Ciudad'), { target: { value: 'Springfield' } });
  fireEvent.change(screen.getByLabelText('Código postal'), { target: { value: '1000' } });
  fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '1122334455' } });
  fireEvent.click(screen.getByRole('button', { name: 'Continuar a pago' }));
  await waitFor(() => expect(screen.getByLabelText('Nombre del titular')).toBeInTheDocument());
}

async function fillPayment() {
  fireEvent.change(screen.getByLabelText('Nombre del titular'), { target: { value: 'Hernán Albornoz' } });
  fireEvent.click(screen.getByRole('button', { name: 'Revisar compra' }));
  await waitFor(() => expect(screen.getByText('Revisión final')).toBeInTheDocument());
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      user: fakeUser,
      role: 'customer',
      logout: vi.fn(),
    } satisfies AuthContextValue);
    vi.mocked(useCart).mockReturnValue(buildCartContextValue());
  });

  it('con el carrito vacio, muestra el mensaje y no renderiza ninguna seccion de checkout (F6.4)', () => {
    vi.mocked(useResolvedCart).mockReturnValue({ status: 'success', lines: [], total: 0, retry: vi.fn() });

    renderCheckoutPage();

    expect(screen.getByText('Tu carrito esta vacio')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nombre completo')).not.toBeInTheDocument();
  });

  it('recorre las tres secciones en un mismo documento hasta la revision final (F6.1)', async () => {
    vi.mocked(useResolvedCart).mockReturnValue({
      status: 'success',
      lines: [{ product: buildProduct(), quantity: 1, lineTotal: 29999 }],
      total: 29999,
      retry: vi.fn(),
    });

    renderCheckoutPage();

    await fillShipping();
    expect(screen.getByText('Hernán Albornoz')).toBeInTheDocument();

    await fillPayment();

    expect(screen.getByRole('button', { name: 'Envío' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pago' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar compra' })).toBeInTheDocument();
  });

  it('volver a editar el envio desde revision no borra el pago ya cargado (F6.2)', async () => {
    vi.mocked(useResolvedCart).mockReturnValue({
      status: 'success',
      lines: [{ product: buildProduct(), quantity: 1, lineTotal: 29999 }],
      total: 29999,
      retry: vi.fn(),
    });

    renderCheckoutPage();
    await fillShipping();
    await fillPayment();

    const [editShippingButton] = screen.getAllByRole('button', { name: 'Editar' });
    if (!editShippingButton) {
      throw new Error('Se esperaba un boton Editar para la seccion de envio.');
    }
    fireEvent.click(editShippingButton);

    expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument();
    expect(screen.queryByText('Revisión final')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Continuar a pago' }));

    await waitFor(() => expect(screen.getByText('Revisión final')).toBeInTheDocument());
    expect(screen.getByText('Resultado simulado: Aprobado')).toBeInTheDocument();
  });

  it('confirmar compra vacia el carrito, reinicia el borrador y navega al detalle de la orden (F6.5, F6.10)', async () => {
    const clearCart = vi.fn(() => {
      vi.mocked(useResolvedCart).mockReturnValue({ status: 'success', lines: [], total: 0, retry: vi.fn() });
    });
    vi.mocked(useCart).mockReturnValue(buildCartContextValue({ clearCart }));
    vi.mocked(useResolvedCart).mockReturnValue({
      status: 'success',
      lines: [{ product: buildProduct(), quantity: 1, lineTotal: 29999 }],
      total: 29999,
      retry: vi.fn(),
    });
    vi.mocked(createOrder).mockResolvedValue({ ok: true, orderId: '11112222-3333-4444-5555-666677778888' });

    renderCheckoutPage();
    await fillShipping();
    await fillPayment();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar compra' }));

    await waitFor(() =>
      expect(
        screen.getByText('Orden creada: 11112222-3333-4444-5555-666677778888'),
      ).toBeInTheDocument(),
    );
    expect(clearCart).toHaveBeenCalledTimes(1);
  });
});

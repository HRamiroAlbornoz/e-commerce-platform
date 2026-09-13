import { describe, expect, it, vi } from 'vitest';
import { getProductById } from '@/features/products/services/getProductById';

const { docMock, getDocMock } = vi.hoisted(() => {
  const withConverterMock = vi.fn(() => 'product-ref-with-converter');
  return {
    docMock: vi.fn(() => ({ withConverter: withConverterMock })),
    getDocMock: vi.fn(),
  };
});

vi.mock('firebase/firestore', () => ({
  doc: docMock,
  getDoc: getDocMock,
}));

vi.mock('@/lib/firebase/client', () => ({ db: {} }));
vi.mock('@/lib/firebase/converters/product', () => ({ productConverter: {} }));

function buildActiveProduct(overrides: Partial<{ isActive: boolean }> = {}) {
  return {
    id: 'product-1',
    name: 'Teclado mecanico X',
    isActive: true,
    ...overrides,
  };
}

describe('getProductById', () => {
  it('pide el documento correcto por id', async () => {
    getDocMock.mockResolvedValue({
      metadata: { fromCache: false },
      exists: () => true,
      data: () => buildActiveProduct(),
    });

    await getProductById('product-1');

    expect(docMock).toHaveBeenCalledWith({}, 'products', 'product-1');
  });

  it('devuelve el producto cuando existe y esta activo', async () => {
    const product = buildActiveProduct();
    getDocMock.mockResolvedValue({
      metadata: { fromCache: false },
      exists: () => true,
      data: () => product,
    });

    await expect(getProductById('product-1')).resolves.toEqual(product);
  });

  it('devuelve null cuando el documento no existe', async () => {
    getDocMock.mockResolvedValue({
      metadata: { fromCache: false },
      exists: () => false,
      data: () => undefined,
    });

    await expect(getProductById('missing')).resolves.toBeNull();
  });

  it('devuelve null cuando el producto existe pero esta inactivo', async () => {
    getDocMock.mockResolvedValue({
      metadata: { fromCache: false },
      exists: () => true,
      data: () => buildActiveProduct({ isActive: false }),
    });

    await expect(getProductById('product-1')).resolves.toBeNull();
  });

  it('rechaza el resultado si la respuesta viene de la cache local', async () => {
    getDocMock.mockResolvedValue({
      metadata: { fromCache: true },
      exists: () => true,
      data: () => buildActiveProduct(),
    });

    await expect(getProductById('product-1')).rejects.toThrow(
      'No se pudo confirmar el producto con el servidor.',
    );
  });
});

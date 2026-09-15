import { describe, expect, it, vi } from 'vitest';
import { getAdminProductById } from '@/features/admin/products/services/getAdminProductById';

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

function buildProduct(overrides: Partial<{ isActive: boolean }> = {}) {
  return {
    id: 'product-1',
    name: 'Teclado mecanico X',
    isActive: true,
    ...overrides,
  };
}

describe('getAdminProductById', () => {
  it('pide el documento correcto por id', async () => {
    getDocMock.mockResolvedValue({
      metadata: { fromCache: false },
      exists: () => true,
      data: () => buildProduct(),
    });

    await getAdminProductById('product-1');

    expect(docMock).toHaveBeenCalledWith({}, 'products', 'product-1');
  });

  it('devuelve el producto activo', async () => {
    const product = buildProduct();
    getDocMock.mockResolvedValue({
      metadata: { fromCache: false },
      exists: () => true,
      data: () => product,
    });

    await expect(getAdminProductById('product-1')).resolves.toEqual(product);
  });

  it('devuelve el producto retirado, a diferencia de getProductById (F9.6: editar un producto retirado)', async () => {
    const retiredProduct = buildProduct({ isActive: false });
    getDocMock.mockResolvedValue({
      metadata: { fromCache: false },
      exists: () => true,
      data: () => retiredProduct,
    });

    await expect(getAdminProductById('product-1')).resolves.toEqual(retiredProduct);
  });

  it('devuelve null cuando el documento no existe', async () => {
    getDocMock.mockResolvedValue({
      metadata: { fromCache: false },
      exists: () => false,
      data: () => undefined,
    });

    await expect(getAdminProductById('missing')).resolves.toBeNull();
  });

  it('rechaza el resultado si la respuesta viene de la cache local', async () => {
    getDocMock.mockResolvedValue({
      metadata: { fromCache: true },
      exists: () => true,
      data: () => buildProduct(),
    });

    await expect(getAdminProductById('product-1')).rejects.toThrow(
      'No se pudo confirmar el producto con el servidor.',
    );
  });
});

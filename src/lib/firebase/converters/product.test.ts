import { describe, expect, it } from 'vitest';
import { Timestamp, type QueryDocumentSnapshot } from 'firebase/firestore';
import { productConverter } from '@/lib/firebase/converters/product';

function buildSnapshot(id: string, data: Record<string, unknown>): QueryDocumentSnapshot {
  return {
    id,
    data: () => data,
  } as unknown as QueryDocumentSnapshot;
}

const validRawProduct = {
  name: 'Teclado mecanico RGB Aurora TKL',
  nameLower: 'teclado mecanico rgb aurora tkl',
  description: 'Teclado mecanico TKL con switches lineales.',
  price: 89999,
  stock: 40,
  category: 'keyboard',
  displayColor: 'lime',
  imageUrl: 'https://placehold.co/600x400',
  isActive: true,
  specs: [{ label: 'Switches', value: 'Lineales rojos' }],
  curatorialNote: 'Lo probamos dos semanas escribiendo largo y jugando shooters.',
  ratingAverage: 4.5,
  ratingCount: 12,
  orderCount: 3,
  unitsSold: 5,
  createdAt: Timestamp.fromDate(new Date('2026-01-01T00:00:00Z')),
  updatedAt: Timestamp.fromDate(new Date('2026-01-02T00:00:00Z')),
};

describe('productConverter.fromFirestore', () => {
  it('convierte los Timestamp de Firestore a Date y usa el id del snapshot', () => {
    const snapshot = buildSnapshot('product-1', validRawProduct);

    const product = productConverter.fromFirestore(snapshot, {});

    expect(product.id).toBe('product-1');
    expect(product.createdAt).toEqual(new Date('2026-01-01T00:00:00Z'));
    expect(product.updatedAt).toEqual(new Date('2026-01-02T00:00:00Z'));
    expect(product.displayColor).toBe('lime');
  });

  it('rechaza un documento con una categoria fuera del conjunto cerrado', () => {
    const snapshot = buildSnapshot('product-2', { ...validRawProduct, category: 'laptop' });

    expect(() => productConverter.fromFirestore(snapshot, {})).toThrow();
  });

  it('rechaza un documento con precio negativo', () => {
    const snapshot = buildSnapshot('product-3', { ...validRawProduct, price: -10 });

    expect(() => productConverter.fromFirestore(snapshot, {})).toThrow();
  });
});

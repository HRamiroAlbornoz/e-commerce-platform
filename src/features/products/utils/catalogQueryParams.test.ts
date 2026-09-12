import { describe, expect, it } from 'vitest';
import { parseCategoryParam, parseSearchTermParam } from '@/features/products/utils/catalogQueryParams';

describe('parseCategoryParam', () => {
  it('devuelve undefined cuando no hay parametro', () => {
    expect(parseCategoryParam(null)).toBeUndefined();
  });

  it('acepta una categoria valida del conjunto cerrado', () => {
    expect(parseCategoryParam('keyboard')).toBe('keyboard');
  });

  it('descarta un valor que no pertenece al conjunto cerrado', () => {
    expect(parseCategoryParam('laptop')).toBeUndefined();
  });
});

describe('parseSearchTermParam', () => {
  it('devuelve string vacio cuando no hay parametro', () => {
    expect(parseSearchTermParam(null)).toBe('');
  });

  it('recorta espacios al principio y al final', () => {
    expect(parseSearchTermParam('  teclado  ')).toBe('teclado');
  });

  it('descarta un termino que excede el largo maximo', () => {
    expect(parseSearchTermParam('a'.repeat(200))).toBe('');
  });
});

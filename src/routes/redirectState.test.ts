import { describe, expect, it } from 'vitest';
import { buildRedirectState, getRedirectPath } from '@/routes/redirectState';

describe('redirectState', () => {
  it('buildRedirectState envuelve la ruta en un objeto with from', () => {
    expect(buildRedirectState('/account/orders')).toEqual({ from: '/account/orders' });
  });

  it('getRedirectPath devuelve la ruta guardada cuando el state es valido', () => {
    expect(getRedirectPath({ from: '/account' })).toBe('/account');
  });

  it('getRedirectPath devuelve la raiz cuando no hay state', () => {
    expect(getRedirectPath(null)).toBe('/');
    expect(getRedirectPath(undefined)).toBe('/');
  });

  it('getRedirectPath devuelve la raiz cuando el state tiene una forma invalida', () => {
    expect(getRedirectPath({ from: 42 })).toBe('/');
    expect(getRedirectPath('no es un objeto')).toBe('/');
  });
});

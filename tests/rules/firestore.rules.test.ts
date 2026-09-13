import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'clack-rules-test',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('firestore.rules (base cerrada)', () => {
  it('deniega la lectura sin autenticacion de una coleccion sin regla propia', async () => {
    const anonymous = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(anonymous.firestore(), 'orders/any-id')));
  });

  it('deniega la escritura de una coleccion sin regla propia, incluso autenticado', async () => {
    const customer = testEnv.authenticatedContext('user-1');
    await assertFails(setDoc(doc(customer.firestore(), 'orders/any-id'), { status: 'pending' }));
  });

  it('permite la lectura publica de products sin autenticacion', async () => {
    const anonymous = testEnv.unauthenticatedContext();
    await assertSucceeds(getDoc(doc(anonymous.firestore(), 'products/any-id')));
  });

  it('deniega la escritura de products, incluso autenticado', async () => {
    const customer = testEnv.authenticatedContext('user-1');
    await assertFails(setDoc(doc(customer.firestore(), 'products/any-id'), { name: 'x' }));
  });
});

describe('firestore.rules (users)', () => {
  function buildUserData(overrides: Record<string, unknown> = {}) {
    return {
      email: 'user1@clack.com',
      displayName: 'User One',
      role: 'customer',
      createdAt: new Date(),
      ...overrides,
    };
  }

  it('deniega leer o escribir users sin autenticacion', async () => {
    const anonymous = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(anonymous.firestore(), 'users/user-1')));
    await assertFails(setDoc(doc(anonymous.firestore(), 'users/user-1'), buildUserData()));
  });

  it('permite crear el propio documento con role customer', async () => {
    const user = testEnv.authenticatedContext('user-1');
    await assertSucceeds(setDoc(doc(user.firestore(), 'users/user-1'), buildUserData()));
  });

  it('deniega crear el propio documento con role admin (F13.4)', async () => {
    const user = testEnv.authenticatedContext('user-1');
    await assertFails(
      setDoc(doc(user.firestore(), 'users/user-1'), buildUserData({ role: 'admin' })),
    );
  });

  it('deniega crear el documento de otro uid', async () => {
    const user = testEnv.authenticatedContext('user-1');
    await assertFails(setDoc(doc(user.firestore(), 'users/other-user'), buildUserData()));
  });

  it('permite leer el propio documento pero no el de otro usuario', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/user-1'), buildUserData());
    });

    const user = testEnv.authenticatedContext('user-1');
    const otherUser = testEnv.authenticatedContext('user-2');

    await assertSucceeds(getDoc(doc(user.firestore(), 'users/user-1')));
    await assertFails(getDoc(doc(otherUser.firestore(), 'users/user-1')));
  });

  it('permite actualizar el propio documento conservando el role', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/user-1'), buildUserData());
    });

    const user = testEnv.authenticatedContext('user-1');
    await assertSucceeds(
      updateDoc(doc(user.firestore(), 'users/user-1'), { displayName: 'Nuevo nombre' }),
    );
  });

  it('deniega que un customer se escriba role admin al actualizar su propio documento (F13.4)', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/user-1'), buildUserData());
    });

    const user = testEnv.authenticatedContext('user-1');
    await assertFails(updateDoc(doc(user.firestore(), 'users/user-1'), { role: 'admin' }));
  });
});

describe('firestore.rules (carts)', () => {
  function buildCartData(overrides: Record<string, unknown> = {}) {
    return {
      items: [{ productId: 'product-1', quantity: 1 }],
      updatedAt: new Date(),
      ...overrides,
    };
  }

  it('deniega leer o escribir un carrito sin autenticacion', async () => {
    const anonymous = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(anonymous.firestore(), 'carts/user-1')));
    await assertFails(setDoc(doc(anonymous.firestore(), 'carts/user-1'), buildCartData()));
  });

  it('permite leer y escribir el propio carrito', async () => {
    const user = testEnv.authenticatedContext('user-1');
    await assertSucceeds(setDoc(doc(user.firestore(), 'carts/user-1'), buildCartData()));
    await assertSucceeds(getDoc(doc(user.firestore(), 'carts/user-1')));
  });

  it('deniega leer o escribir el carrito de otro usuario', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'carts/user-1'), buildCartData());
    });

    const otherUser = testEnv.authenticatedContext('user-2');
    await assertFails(getDoc(doc(otherUser.firestore(), 'carts/user-1')));
    await assertFails(setDoc(doc(otherUser.firestore(), 'carts/user-1'), buildCartData()));
  });
});

import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

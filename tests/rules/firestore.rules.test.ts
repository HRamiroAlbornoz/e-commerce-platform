import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  assertFails,
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
  it('deniega la lectura sin autenticacion', async () => {
    const anonymous = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(anonymous.firestore(), 'products/any-id')));
  });

  it('deniega la lectura a un usuario autenticado', async () => {
    const customer = testEnv.authenticatedContext('user-1');
    await assertFails(getDoc(doc(customer.firestore(), 'products/any-id')));
  });

  it('deniega la escritura a un usuario autenticado', async () => {
    const customer = testEnv.authenticatedContext('user-1');
    await assertFails(setDoc(doc(customer.firestore(), 'products/any-id'), { name: 'x' }));
  });
});

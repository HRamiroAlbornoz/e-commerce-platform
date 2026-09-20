import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

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
    await assertFails(getDoc(doc(anonymous.firestore(), 'reviews/any-id')));
  });

  it('deniega la escritura de una coleccion sin regla propia, incluso autenticado', async () => {
    const customer = testEnv.authenticatedContext('user-1');
    await assertFails(setDoc(doc(customer.firestore(), 'reviews/any-id'), { rating: 5 }));
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

describe('firestore.rules (orders)', () => {
  function buildOrderData(overrides: Record<string, unknown> = {}) {
    return {
      userId: 'user-1',
      items: [
        {
          productId: 'product-1',
          name: 'Teclado',
          unitPrice: 1000,
          imageUrl: 'https://x.test/a.png',
          quantity: 1,
        },
      ],
      subtotal: 1000,
      shippingCost: 4999,
      total: 5999,
      status: 'pending',
      shipping: {
        fullName: 'User One',
        address: 'Calle 123',
        city: 'CABA',
        postalCode: '1000',
        phone: '1122334455',
      },
      payment: { cardholderName: 'User One', method: 'card', outcome: 'success' },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  it('deniega leer o escribir sin autenticacion', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'orders/order-1'), buildOrderData());
    });

    const anonymous = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(anonymous.firestore(), 'orders/order-1')));
    await assertFails(setDoc(doc(anonymous.firestore(), 'orders/order-1'), buildOrderData()));
  });

  it('permite al dueño leer su propia orden', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'orders/order-1'), buildOrderData());
    });

    const owner = testEnv.authenticatedContext('user-1');
    await assertSucceeds(getDoc(doc(owner.firestore(), 'orders/order-1')));
  });

  it('deniega leer la orden de otro usuario (F7.2)', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'orders/order-1'), buildOrderData());
    });

    const otherUser = testEnv.authenticatedContext('user-2');
    await assertFails(getDoc(doc(otherUser.firestore(), 'orders/order-1')));
  });

  it('deniega crear una orden desde el cliente, incluso como el propio dueño', async () => {
    const owner = testEnv.authenticatedContext('user-1');
    await assertFails(setDoc(doc(owner.firestore(), 'orders/order-1'), buildOrderData()));
  });

  it('deniega modificar una orden existente desde el cliente', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'orders/order-1'), buildOrderData());
    });

    const owner = testEnv.authenticatedContext('user-1');
    await assertFails(updateDoc(doc(owner.firestore(), 'orders/order-1'), { status: 'cancelled' }));
  });

  it('deniega leer una orden que nunca existio, igual que la de otro usuario (F7.2)', async () => {
    const anyUser = testEnv.authenticatedContext('user-1');
    await assertFails(getDoc(doc(anyUser.firestore(), 'orders/never-existed')));
  });

  it('permite listar solo las propias ordenes filtrando por userId', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), 'orders/order-1'),
        buildOrderData({ userId: 'user-1' }),
      );
      await setDoc(
        doc(context.firestore(), 'orders/order-2'),
        buildOrderData({ userId: 'user-2' }),
      );
    });

    const owner = testEnv.authenticatedContext('user-1');
    const ownOrdersQuery = query(
      collection(owner.firestore(), 'orders'),
      where('userId', '==', 'user-1'),
    );
    await assertSucceeds(getDocs(ownOrdersQuery));
  });

  it('deniega listar ordenes de otro usuario', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), 'orders/order-1'),
        buildOrderData({ userId: 'user-1' }),
      );
    });

    const otherUser = testEnv.authenticatedContext('user-2');
    const otherUsersOrdersQuery = query(
      collection(otherUser.firestore(), 'orders'),
      where('userId', '==', 'user-1'),
    );
    await assertFails(getDocs(otherUsersOrdersQuery));
  });

  it('deniega a un customer listar todas las ordenes sin filtro de userId (F11.1)', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), 'orders/order-1'),
        buildOrderData({ userId: 'user-1' }),
      );
    });

    const customer = testEnv.authenticatedContext('user-2');
    await assertFails(getDocs(collection(customer.firestore(), 'orders')));
  });

  it('permite a un admin leer la orden de cualquier usuario (F11.1)', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), 'orders/order-1'),
        buildOrderData({ userId: 'user-1' }),
      );
    });

    const admin = testEnv.authenticatedContext('admin-1', { role: 'admin' });
    await assertSucceeds(getDoc(doc(admin.firestore(), 'orders/order-1')));
  });

  it('permite a un admin listar todas las ordenes sin filtro de userId (F11.1)', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), 'orders/order-1'),
        buildOrderData({ userId: 'user-1' }),
      );
      await setDoc(
        doc(context.firestore(), 'orders/order-2'),
        buildOrderData({ userId: 'user-2' }),
      );
    });

    const admin = testEnv.authenticatedContext('admin-1', { role: 'admin' });
    await assertSucceeds(getDocs(collection(admin.firestore(), 'orders')));
  });

  it('permite a un admin listar ordenes filtradas por estado (F11.2)', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), 'orders/order-1'),
        buildOrderData({ status: 'pending' }),
      );
      await setDoc(
        doc(context.firestore(), 'orders/order-2'),
        buildOrderData({ status: 'cancelled' }),
      );
    });

    const admin = testEnv.authenticatedContext('admin-1', { role: 'admin' });
    const pendingOrdersQuery = query(
      collection(admin.firestore(), 'orders'),
      where('status', '==', 'pending'),
    );
    await assertSucceeds(getDocs(pendingOrdersQuery));
  });

  it('deniega a un admin cambiar el estado de una orden directo desde el cliente (F11.7)', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'orders/order-1'), buildOrderData());
    });

    const admin = testEnv.authenticatedContext('admin-1', { role: 'admin' });
    await assertFails(updateDoc(doc(admin.firestore(), 'orders/order-1'), { status: 'cancelled' }));
  });
});

describe('firestore.rules (reviews)', () => {
  function reviewPath(productId: string, reviewId: string): string {
    return `products/${productId}/reviews/${reviewId}`;
  }

  function buildReviewData(overrides: Record<string, unknown> = {}) {
    return {
      userId: 'user-1',
      displayName: 'User One',
      rating: 5,
      comment: 'Excelente producto.',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...overrides,
    };
  }

  // Cada test usa su propio productId: el entorno del emulador se comparte
  // entre tests del mismo archivo (sin clearFirestore entre ellos), y un
  // "create" contra un documento que otro test ya sembro se evalua como
  // "update" en su lugar, con reglas distintas.

  it('permite leer las reseñas sin autenticacion', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), reviewPath('product-read', 'user-1')),
        buildReviewData(),
      );
    });

    const anonymous = testEnv.unauthenticatedContext();
    await assertSucceeds(getDoc(doc(anonymous.firestore(), reviewPath('product-read', 'user-1'))));
  });

  it('permite crear la propia reseña, con el id del autor como id del documento', async () => {
    const user = testEnv.authenticatedContext('user-1');
    await assertSucceeds(
      setDoc(doc(user.firestore(), reviewPath('product-create-own', 'user-1')), buildReviewData()),
    );
  });

  it('deniega crear una reseña bajo el id de otro usuario', async () => {
    const user = testEnv.authenticatedContext('user-1');
    await assertFails(
      setDoc(
        doc(user.firestore(), reviewPath('product-create-wrong-id', 'user-2')),
        buildReviewData(),
      ),
    );
  });

  it('deniega crear una reseña cuyo campo userId no coincide con el autor', async () => {
    const user = testEnv.authenticatedContext('user-1');
    await assertFails(
      setDoc(
        doc(user.firestore(), reviewPath('product-create-userid-mismatch', 'user-1')),
        buildReviewData({ userId: 'user-2' }),
      ),
    );
  });

  it.each([0, 6, 2.5])('deniega un rating invalido (%s)', async (rating) => {
    const user = testEnv.authenticatedContext('user-1');
    await assertFails(
      setDoc(
        doc(user.firestore(), reviewPath('product-create-invalid-rating', 'user-1')),
        buildReviewData({ rating }),
      ),
    );
  });

  it('deniega un comentario vacio', async () => {
    const user = testEnv.authenticatedContext('user-1');
    await assertFails(
      setDoc(
        doc(user.firestore(), reviewPath('product-create-empty-comment', 'user-1')),
        buildReviewData({ comment: '' }),
      ),
    );
  });

  it('deniega un comentario que excede el limite de largo', async () => {
    const user = testEnv.authenticatedContext('user-1');
    await assertFails(
      setDoc(
        doc(user.firestore(), reviewPath('product-create-long-comment', 'user-1')),
        buildReviewData({ comment: 'x'.repeat(501) }),
      ),
    );
  });

  it('deniega un displayName vacio o que excede el limite de largo', async () => {
    const user = testEnv.authenticatedContext('user-1');
    await assertFails(
      setDoc(
        doc(user.firestore(), reviewPath('product-create-empty-name', 'user-1')),
        buildReviewData({ displayName: '' }),
      ),
    );
    await assertFails(
      setDoc(
        doc(user.firestore(), reviewPath('product-create-long-name', 'user-2')),
        buildReviewData({ userId: 'user-2', displayName: 'x'.repeat(121) }),
      ),
    );
  });

  it('deniega crear una reseña con un createdAt fabricado, distinto del timestamp del servidor', async () => {
    const user = testEnv.authenticatedContext('user-1');
    await assertFails(
      setDoc(
        doc(user.firestore(), reviewPath('product-create-fake-createdat', 'user-1')),
        buildReviewData({ createdAt: Timestamp.fromDate(new Date('2000-01-01')) }),
      ),
    );
  });

  it('permite al autor actualizar su propia reseña conservando el createdAt original', async () => {
    const path = reviewPath('product-update-own', 'user-1');
    let createdAt: Timestamp | undefined;
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), path), buildReviewData());
      const snap = await getDoc(doc(context.firestore(), path));
      createdAt = snap.data()?.createdAt as Timestamp;
    });

    const user = testEnv.authenticatedContext('user-1');
    await assertSucceeds(
      setDoc(
        doc(user.firestore(), path),
        buildReviewData({ rating: 3, comment: 'Cambié de opinión.', createdAt }),
      ),
    );
  });

  it('deniega alterar el createdAt al actualizar la propia reseña', async () => {
    const path = reviewPath('product-update-fake-createdat', 'user-1');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), path), buildReviewData());
    });

    const user = testEnv.authenticatedContext('user-1');
    await assertFails(
      setDoc(
        doc(user.firestore(), path),
        buildReviewData({ createdAt: Timestamp.fromDate(new Date('2000-01-01')) }),
      ),
    );
  });

  it('deniega actualizar la reseña de otro usuario', async () => {
    const path = reviewPath('product-update-other-user', 'user-1');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), path), buildReviewData());
    });

    const otherUser = testEnv.authenticatedContext('user-2');
    await assertFails(updateDoc(doc(otherUser.firestore(), path), { rating: 1 }));
  });

  it('permite al autor borrar su propia reseña', async () => {
    const path = reviewPath('product-delete-own', 'user-1');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), path), buildReviewData());
    });

    const user = testEnv.authenticatedContext('user-1');
    await assertSucceeds(deleteDoc(doc(user.firestore(), path)));
  });

  it('deniega borrar la reseña de otro usuario', async () => {
    const path = reviewPath('product-delete-other-user', 'user-1');
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), path), buildReviewData());
    });

    const otherUser = testEnv.authenticatedContext('user-2');
    await assertFails(deleteDoc(doc(otherUser.firestore(), path)));
  });

  it('deniega escribir ratingAverage/ratingCount en products directamente desde el cliente (F8.5)', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'products/product-f85'), {
        ratingAverage: 0,
        ratingCount: 0,
      });
    });

    const user = testEnv.authenticatedContext('user-1');
    await assertFails(
      updateDoc(doc(user.firestore(), 'products/product-f85'), {
        ratingAverage: 5,
        ratingCount: 1000,
      }),
    );
  });
});

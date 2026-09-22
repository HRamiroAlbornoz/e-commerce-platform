import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { productInputSchema, toNameLower } from '../shared/schemas/product.js';
import { catalog } from './catalogSeedData.js';

async function seed(): Promise<void> {
  process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
  initializeApp({ projectId: 'clack-add2a' });
  const db = getFirestore();
  const batch = db.batch();

  for (const entry of catalog) {
    const input = productInputSchema.parse({
      ...entry,
      nameLower: toNameLower(entry.name),
    });
    const ref = db.collection('products').doc(randomUUID());
    batch.set(ref, {
      ...input,
      ratingAverage: 0,
      ratingCount: 0,
      orderCount: 0,
      unitsSold: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  await batch.commit();
  console.log(`Catalogo cargado en el emulador: ${catalog.length} productos.`);
}

seed().catch((error: unknown) => {
  console.error('Fallo el seed del catalogo:', error);
  process.exitCode = 1;
});

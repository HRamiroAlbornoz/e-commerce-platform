import { randomUUID } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { productInputSchema, toNameLower } from '../shared/schemas/product.js';
import { catalog } from './catalogSeedData.js';

async function seed(): Promise<void> {
  delete process.env.FIRESTORE_EMULATOR_HOST;
  delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const { adminDb } = await import('../api/_lib/firebaseAdmin.js');

  const existing = await adminDb.collection('products').limit(1).get();
  if (!existing.empty) {
    console.error(
      'La coleccion products ya tiene documentos en el proyecto real. Abortado para no duplicar el catalogo.',
    );
    process.exitCode = 1;
    return;
  }

  const batch = adminDb.batch();

  for (const entry of catalog) {
    const input = productInputSchema.parse({
      ...entry,
      nameLower: toNameLower(entry.name),
    });
    const ref = adminDb.collection('products').doc(randomUUID());
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
  console.log(`Catalogo cargado en produccion (clack-add2a): ${catalog.length} productos.`);
}

seed().catch((error: unknown) => {
  console.error('Fallo el seed de produccion:', error);
  process.exitCode = 1;
});

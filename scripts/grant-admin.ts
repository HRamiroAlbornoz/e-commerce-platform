import { adminAuth, adminDb } from '../api/_lib/firebaseAdmin.js';

async function main(): Promise<void> {
  const identifier = process.argv[2];

  if (!identifier) {
    console.error('Uso: npm run grant-admin -- <email o uid>');
    process.exitCode = 1;
    return;
  }

  const user = identifier.includes('@')
    ? await adminAuth.getUserByEmail(identifier)
    : await adminAuth.getUser(identifier);

  await adminDb.doc(`users/${user.uid}`).update({ role: 'admin' });
  await adminAuth.setCustomUserClaims(user.uid, { role: 'admin' });

  console.log(
    `Rol admin asignado a ${identifier} (uid: ${user.uid}). Si ya tenia sesion abierta, tiene que cerrarla y volver a entrar para que el cambio de rol tome efecto.`,
  );
}

main().catch((error: unknown) => {
  console.error('No se pudo asignar el rol admin:', error);
  process.exitCode = 1;
});

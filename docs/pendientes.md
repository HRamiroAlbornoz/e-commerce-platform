# Pendientes

Hallazgos clasificados como deuda técnica: no bloquean el merge de la slice donde se detectaron,
pero requieren una acción propia antes del Cierre del release.

## 1 · Firestore de producción sin reglas, índices ni datos desplegados — RESUELTO 2026-09-22

**Resolución, al arrancar la Etapa 4 (Cierre)**: confirmado en vivo que el síntoma seguía activo
(`403 PERMISSION_DENIED` contra `products` vía REST). Ejecutado:

1. `npm run deploy:rules` (`firebase deploy --only firestore:rules,firestore:indexes --project
   clack-add2a`) — `firestore.rules` y `firestore.indexes.json` ya estaban listos y probados
   contra el emulador desde hace varias slices; no necesitaron cambios, solo desplegarse.
2. `npm run seed:production` (script nuevo, `scripts/seedProduction.ts`), que reusa el mismo
   catálogo de 18 productos de `scripts/seed.ts` (extraído a `scripts/catalogSeedData.ts` para que
   los dos scripts no dupliquen los datos) pero apunta al proyecto real: borra explícitamente
   `FIRESTORE_EMULATOR_HOST`/`FIREBASE_AUTH_EMULATOR_HOST` del entorno antes de inicializar el
   Admin SDK (que si no, los toma de `.env` y termina escribiendo en el emulador en vez de
   producción), y aborta sin escribir nada si la colección `products` ya tiene documentos, para
   que un segundo `npm run seed:production` por error no duplique el catálogo.
3. Verificado en vivo con Chrome DevTools MCP contra `https://clack-liart.vercel.app/`: la landing
   muestra la pieza destacada real, la grilla con los 18 productos, sin errores de consola.

**Pendiente real que queda, ya no bloqueante**: el paso 3 original ("agregar el deploy de
reglas/índices al pipeline") se resolvió como paso manual documentado (`npm run deploy:rules`),
no como un job de CI — automatizarlo exigiría generar y guardar un token/service account de
Firebase como secret de GitHub Actions, una pieza de infraestructura nueva que no se justificaba
solo para este cierre. Si `firestore.rules`/`firestore.indexes.json` vuelven a tocarse en un futuro
release, correr `npm run deploy:rules` a mano antes de mergear es el paso a no olvidar.

---

## 1 (original) · Firestore de producción sin reglas, índices ni datos desplegados

**Detectado**: 2026-09-13, al revisar en vivo el preview de la PR #18 (slice 4, paginación) con
Chrome DevTools MCP.

**Síntoma**: el catálogo público muestra el estado de error ("No pudimos cargar el catalogo")
tanto en el preview de la PR como en la producción actual (`https://clack-liart.vercel.app`).

**Causa raíz confirmada**: una consulta directa a la API REST de Firestore contra el proyecto real
(`clack-add2a`) devuelve `403 PERMISSION_DENIED` en la colección `products`, a pesar de que
`firestore.rules` la abre a lectura pública (`allow read: if true`). El archivo de reglas local
nunca se desplegó al proyecto real: no existe ningún paso de
`firebase deploy --only firestore:rules,firestore:indexes` en `.github/workflows/`, solo el deploy
de Vercel (frontend). Es esperable que el proyecto siga con las reglas cerradas por defecto
(`allow read, write: if false`). Además, `scripts/seed.ts` solo se corrió contra el Emulator Suite
local, nunca contra el proyecto real, así que tampoco hay datos.

**Por qué no se detectó antes**: todas las slices previas se verificaron en vivo contra el
emulador local (`firebase emulators:start`), nunca contra el Firestore real. El gap viene del
andamiaje (Paso 4), no de ninguna slice del ciclo.

**No es una regresión de la slice 4**: el mismo comportamiento roto ya existía en producción antes
de este merge: no bloquea la PR #18.

**Acción pendiente, antes del Cierre**:
1. `firebase deploy --only firestore:rules,firestore:indexes --project clack-add2a`.
2. Correr (o adaptar) `scripts/seed.ts` contra el proyecto real, o cargar un catálogo de
   producción real.
3. Agregar el deploy de reglas/índices al pipeline (GitHub Actions o un paso manual documentado),
   para que un futuro cambio en `firestore.rules`/`firestore.indexes.json` no vuelva a quedar sin
   propagar.
4. Re-verificar el preview y la producción con Chrome DevTools MCP una vez desplegado.

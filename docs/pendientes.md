# Pendientes

Hallazgos clasificados como deuda técnica: no bloquean el merge de la slice donde se detectaron,
pero requieren una acción propia antes del Cierre del release.

## 1 · Firestore de producción sin reglas, índices ni datos desplegados

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

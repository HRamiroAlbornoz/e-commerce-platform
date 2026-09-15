# 0008 · Los productos se crean y editan desde una Vercel Function con el Admin SDK

## Contexto

A diferencia de una reseña (slice 9, tres campos simples), un producto tiene un schema rico:
`specs` es un array de 1 a 12 objetos, cada uno con su propio `label`/`value` acotados. Expresar
esa validación completa en Firestore rules exige iterar sobre un array de objetos con reglas
anidadas — el lenguaje de rules no tiene un equivalente real a `.map()`/`.every()` sobre
`request.resource.data`, así que hacerlo bien obligaría a funciones auxiliares frágiles, repetidas
a mano por índice, con un tope arbitrario.

Esta razón es distinta de la que motivó el ADR 0007 (crear una orden): ahí el problema era un
invariante que cruza varios documentos a la vez (el stock que se descuenta tiene que coincidir con
lo que dice la orden que se está creando). Acá no hay ningún invariante cruzado — ni siquiera la
guarda de borrado definitivo lo es, porque `orderCount`/`ratingCount` ya están denormalizados en el
propio documento del producto (ADR 0005). El problema es la complejidad de un solo documento, no la
relación entre varios.

## Decisión

Crear, editar (formulario completo, retirar/reactivar, y la edición rápida de precio/stock en la
fila) y eliminar un producto son tres **Vercel Functions** (`api/admin/products/create.ts`,
`update.ts`, `delete.ts`) que usan el **Admin SDK**. El cliente nunca escribe `products/*`
directamente — `firestore.rules` no gana ninguna regla de escritura nueva para esa colección, se
queda tal como está (cerrada, solo lectura pública).

Las tres funciones:

1. Verifican el ID token y exigen `role: 'admin'` — extensión de `verifyRequestToken`, que ya
   expone el rol leyendo el custom claim que trae el propio token verificado, sin ninguna lectura
   adicional a Firestore.
2. Validan el body completo contra `productInputSchema` (`create`) o un patch parcial derivado de
   él (`update`) — la validación real sigue viviendo en un schema de Zod, no en las rules.
3. `create`/`update` fijan `nameLower` (derivado de `name` con `toNameLower()`),
   `createdAt`/`updatedAt` (o solo `updatedAt`) con `FieldValue.serverTimestamp()`, y `create`
   además los cuatro contadores en `0` — ninguno de estos campos se confía nunca del cliente.
4. `update` es un **único endpoint genérico de patch parcial** (`{productId, changes}`), reusado
   por el formulario completo, la edición de celda y retirar/reactivar — evita tres endpoints casi
   idénticos escribiendo sobre el mismo documento.
5. `delete` exige `orderCount === 0 && ratingCount === 0` (ADR 0005) antes de borrar de verdad.

## Alternativas descartadas

**Validar `specs[]` en Firestore rules con una función auxiliar.** Técnicamente posible con reglas
que verifiquen el tamaño del array y, elemento por elemento, su forma — pero sin iteración real
sobre arrays de objetos, cada validación de elemento se vuelve una expresión repetida a mano por
índice. Cualquier cambio futuro al schema de `specs` obligaría a tocar una regla frágil en un
lenguaje sin las herramientas de Zod (mensajes de error, tipos derivados, `.partial()`). Se
descartó por el mismo espíritu que ya cerró la puerta a las rules complejas en los ADR 0006/0007:
cuanta más lógica de negocio migra ahí, más frágil se vuelve ante el próximo cambio.

**Tres endpoints separados para editar, retirar/reactivar y la celda.** Descartado por
duplicación: los tres son, en el fondo, un patch parcial sobre el mismo documento con distinta
forma de `changes`. Un único endpoint genérico evita reimplementar tres veces la misma
verificación de rol y el mismo manejo de `nameLower`/`updatedAt`.

## Consecuencias

- Es la **primera vez** que una Function de este proyecto distingue explícitamente por rol
  (`admin` vs `customer`), no solo por autenticación — `verifyRequestToken` gana un campo `role`,
  reusable por cualquier Function admin futura (slice 12, órdenes de administración).
- `update.ts` no lee el documento antes de escribir: los valores que llegan en `changes` son
  siempre absolutos, no deltas, así que no hace falta el dato viejo para calcular el nuevo. Si el
  producto no existe, el propio `.update()` del SDK lo rechaza y el error se mapea a
  `PRODUCT_NOT_FOUND`, sin una lectura previa que no aportaría nada.
- **Sin bloqueo optimista**: dos ediciones concurrentes sobre el mismo producto se resuelven con
  "gana la última escritura". Aceptable porque el panel lo opera una sola persona por vez (brief de
  superficie de administración); reconsiderar si el panel alguna vez tiene más de un operador
  simultáneo.
- `delete` sigue sin usar una transacción: es lectura → chequeo → borrado. Con un solo operador y
  frecuencia baja, la ventana teórica de carrera (una venta justo en el medio) no justifica el
  costo de una `runTransaction`.

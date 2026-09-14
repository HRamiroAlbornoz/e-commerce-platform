# 0007 · La orden se crea desde una Vercel Function con el Admin SDK

## Contexto

Confirmar el checkout es la operación de mayor riesgo de todo el proyecto: toca dinero, stock y la
creación de un registro permanente, en una sola transacción que además tiene que impedir la
sobreventa (regla 11 del modelo de dominio) y detectar si el precio de un producto cambió entre que
el usuario revisó el carrito y confirmó (F6.8).

La pregunta de diseño no es si la operación corre en una transacción de Firestore — eso ya está
decidido en `docs/arquitectura.md` — sino **quién la ejecuta**: el cliente, con una transacción del
SDK web directamente contra Firestore, o el servidor, con una Vercel Function y el Admin SDK.

Si la transacción corriera en el cliente, las security rules tendrían que validar, en el mismo
`request`, que el descuento de stock de cada producto coincide exactamente con las líneas de una
orden que se está creando al mismo tiempo, que el precio no cambió, y que los contadores
(`orderCount`, `unitsSold`) se movieron por la cantidad correcta. Firestore permite leer otros
documentos dentro de una regla, pero validar una invariante que cruza varios documentos a la vez
—"la suma de lo que se resta de stock coincide con lo que dice la orden que se está creando"— es
exactamente el tipo de regla frágil que ya se evitó una vez en el ADR 0006, por el mismo motivo: si
la regla le permite a un cliente escribir un número derivado de otro documento, un cliente
modificado puede escribir cualquier número.

## Decisión

La creación de la orden es una **Vercel Function** (`api/orders/create.ts`) que usa el **Admin SDK**
dentro de una única `runTransaction`. El cliente nunca escribe `orders/*` ni descuenta stock de
`products/*` directamente — `firestore.rules` no lo permite desde el cliente en absoluto, solo
lectura de la propia orden.

La función:

1. Verifica el ID token del `Authorization: Bearer` con el Admin SDK y obtiene el `uid` real; nunca
   confía en un `uid` que venga en el body.
2. Lee `carts/{uid}` **dentro de la transacción** para saber qué y cuánto comprar — nunca la lista
   de productos que mande el cliente. El cliente solo manda `expectedItems: {productId, quantity,
   unitPrice}[]`, lo que vio en la revisión, exclusivamente para poder detectar si su carrito
   cambió (F6.8) o si el precio se movió, no para decidir qué comprar.
3. Lee cada producto fresco y valida activo, stock suficiente, y que precio/cantidad coincidan con
   lo revisado. Cualquier violación aborta sin escribir nada y nombra el producto (F6.7, F6.8).
4. Si todo es válido, escribe la orden, descuenta stock, incrementa `orderCount`/`unitsSold` y vacía
   el carrito, todo en la misma transacción.

**Idempotencia con id pre-generado.** El cliente genera un UUID (`orderRequestId`) una vez por
borrador de checkout y lo manda como body; ese id es también el id del documento de la orden. Si la
función se reintenta con el mismo id (doble click, reintento de red), la transacción lee que la
orden ya existe y devuelve el mismo resultado sin volver a descontar stock.

## Alternativas descartadas

**Transacción del cliente + security rules cruzadas.** Es la alternativa natural dado que el resto
del carrito ya escribe directo a Firestore desde el cliente. Se descartó por el motivo de seguridad
de arriba, que es estructural y no tiene un parche razonable: cuanta más lógica de negocio migra a
las rules para intentar cerrar el agujero, más frágiles se vuelven ante el próximo cambio.

**Cloud Function con trigger de Firestore** (ej. sobre la escritura del carrito). Quedó descartada
por el mismo motivo que en el ADR 0006: el stack no tiene Cloud Functions, y agregar ese proveedor
solo para esto no se justifica.

## Consecuencias

- Aparece una **tercera Vercel Function** con el mismo patrón de verificación de token que las
  otras dos (presigned URLs, recálculo de rating) — reutiliza infraestructura ya decidida, no
  agrega un proveedor nuevo.
- El cliente necesita `vercel dev` corriendo en paralelo al emulador para poder probar el checkout
  completo en desarrollo, algo que ninguna slice anterior necesitó (las Functions previas nunca se
  ejercitaron desde el navegador). Documentado en la sección de Estado de este archivo.
- Los tests de esta función corren contra el **emulador de Firestore real** (no mocks), con solo la
  verificación de token mockeada — la transacción en sí, incluyendo el caso de sobreventa
  concurrente, se ejercita contra el emulador tal como corre en producción.

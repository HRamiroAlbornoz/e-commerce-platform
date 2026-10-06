# 0012 · Borrado de productos en dos niveles

Reemplaza a [0005](0005-borrado-de-productos-en-dos-niveles.md).

## Contexto

El panel de administración necesita un CRUD completo de productos, incluido eliminar. Pero un
producto no es un dato aislado: puede estar referenciado por el carrito de otras personas y tener
reseñas en una subcolección propia.

Hay un comportamiento de Firestore que decide buena parte de esta cuestión: **borrar un documento no
borra sus subcolecciones**. Un producto eliminado con reseñas adentro dejaría esas reseñas
existiendo pero inalcanzables, ocupando espacio y sin forma de llegar a ellas.

Y hay un problema de honestidad de interfaz: si el botón dice "Eliminar" y el producto sigue en la
base de datos, la interfaz miente, y esa mentira se paga cuando alguien cree que borró algo que no
borró.

## Decisión

Dos acciones distintas, cada una nombrada por lo que hace:

**Retirar del catálogo** (`isActive: false`) es la acción habitual. Reversible, no destruye nada, y
es lo que el administrador quiere casi siempre: el producto desaparece del catálogo y sus órdenes y
reseñas siguen siendo válidas.

**Eliminar definitivamente** borra el documento de verdad, y **solo está disponible mientras nada lo
referencie**: `orderCount === 0` y `ratingCount === 0`. Los dos campos viven en el documento del
producto, así que la condición se evalúa sin ninguna consulta extra. `orderCount` se incrementa en la
misma transacción que descuenta el stock al confirmar una compra, así que mantenerlo no cuesta nada
adicional.

Cuando el borrado definitivo no está disponible, la pantalla **explica por qué con palabras** —"tiene
3 ventas registradas"— en lugar de mostrar un botón deshabilitado sin motivo.

## Alternativas descartadas

**Borrar de verdad, siempre, con confirmación.** Deja referencias colgando en los carritos de otras
personas y reseñas huérfanas e inalcanzables, por el comportamiento de Firestore descrito arriba.

**Solo desactivar, sin borrado real.** Es la opción más simple, pero no cumple el "eliminar" del
CRUD. Además, no hay razón para prohibir borrar un producto que nunca se vendió ni recibió reseñas:
en ese caso el borrado es inofensivo, y negarlo es conservadurismo sin beneficio.

**Un campo `productIds` en cada orden para consultar si un producto se vendió.** Firestore no puede
buscar dentro de los objetos de un array. Se descarta al tener ya una transacción que toca el
producto en cada compra: incrementar un contador ahí es gratis, y evita un campo denormalizado más y
un índice.

**Borrado en cascada de las reseñas.** Borrar una subcolección desde el cliente es un recorrido por
lotes que puede quedar a medias. La guarda de cero reseñas hace que el problema no pueda ocurrir, que
es mejor que resolverlo.

## Consecuencias

- El administrador tiene **dos acciones destructivas de distinto peso**, y la interfaz tiene que dejar
  claro cuál es cuál. La normal es reversible; la otra no.
- La confirmación del borrado definitivo **nombra el producto**, no pregunta "¿estás seguro?".
- `orderCount` es un dato **denormalizado**. Si la transacción de compra falla a mitad, el contador y
  las órdenes reales pueden divergir. La transacción es atómica precisamente para que eso no pase.
- Un producto retirado **sigue apareciendo** en el carrito de quien ya lo tenía y en las órdenes
  pasadas. Es correcto: el carrito muestra "ya no disponible" en vez de romperse.
- El catálogo público filtra siempre por `isActive`, y esa condición tiene que estar también en las
  security rules, no solo en la consulta del cliente.

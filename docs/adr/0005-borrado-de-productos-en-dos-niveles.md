# 0005 · Borrado de productos en dos niveles

## Contexto

El enunciado pide un CRUD completo de productos, incluyendo eliminar. Pero un producto no es un
dato aislado: puede estar referenciado por el carrito de otras personas y tener reseñas en una
subcolección propia.

Hay además un comportamiento de Firestore que decide buena parte de esta cuestión: **borrar un
documento no borra sus subcolecciones**. Un producto eliminado con reseñas adentro dejaría esas
reseñas existiendo pero inalcanzables, ocupando espacio y sin ninguna forma de llegar a ellas.

Y hay un problema de honestidad de interfaz: si el botón dice "Eliminar" y el producto sigue en la
base de datos, la interfaz miente, y esa mentira se paga cuando alguien cree que borró algo que no
borró.

## Decisión

Dos acciones distintas, cada una nombrada por lo que hace:

**Retirar del catálogo** (`isActive: false`) es la acción habitual. Reversible, no destruye nada, y
es lo que el administrador quiere el 99% de las veces: el producto desaparece del catálogo y sus
órdenes y reseñas siguen siendo válidas.

**Eliminar definitivamente** borra el documento de verdad, y **solo está disponible mientras nada
lo referencie**: `orderCount === 0` y `ratingCount === 0`. Los dos campos viven en el documento del
producto, así que la condición se evalúa sin ninguna consulta extra. `orderCount` se incrementa en
la misma transacción que descuenta el stock al confirmar una compra, así que mantenerlo no cuesta
nada adicional.

Cuando el borrado definitivo no está disponible, la pantalla **explica por qué con palabras**
—"tiene 3 ventas registradas"— en lugar de mostrar un botón deshabilitado sin motivo.

## Alternativas descartadas

**Borrar de verdad, siempre, con confirmación.** La lectura más literal del enunciado. Descartado
porque deja referencias colgando en los carritos de otras personas y reseñas huérfanas e
inalcanzables por el comportamiento de Firestore descrito arriba.

**Solo desactivar, sin borrado real.** Era la opción más simple y la que primero propuse.
Descartada porque no satisface del todo el "eliminar" del CRUD y porque no hay ninguna razón para
prohibir borrar un producto que nunca se vendió ni recibió reseñas: en ese caso el borrado es
inofensivo, y negarlo es conservadurismo sin beneficio.

**Un campo `productIds` en cada orden para consultar si un producto se vendió.** Fue mi primera
propuesta para evaluar la condición, porque Firestore no puede buscar dentro de los objetos de un
array. Descartada al aparecer la transacción de stock: teniendo ya una transacción que toca el
producto en cada compra, incrementar un contador ahí es gratis, y evita un campo denormalizado más
un índice.

**Borrado en cascada de las reseñas.** Descartado por complejidad: borrar una subcolección desde el
cliente es un recorrido por lotes que puede quedar a medias. La guarda de cero reseñas hace que el
problema no pueda ocurrir, que es mejor que resolverlo.

## Consecuencias

- El administrador tiene **dos acciones destructivas de distinto peso**, y la interfaz tiene que
  dejar clarísimo cuál es cuál. La normal es reversible; la otra no.
- La confirmación del borrado definitivo **nombra el producto**, no pregunta "¿estás seguro?".
- `orderCount` es un dato **denormalizado**, o sea una segunda copia de algo derivable. Si la
  transacción de compra falla a mitad, el contador y las órdenes reales pueden divergir. La
  transacción es atómica precisamente para que eso no pase.
- Un producto retirado **sigue apareciendo** en el carrito de quien ya lo tenía y en las órdenes
  pasadas. Eso es correcto y hay que diseñarlo: el carrito muestra "ya no disponible" en vez de
  romperse.
- El catálogo público filtra siempre por `isActive`, y esa condición tiene que estar también en las
  security rules, no solo en la consulta del cliente.

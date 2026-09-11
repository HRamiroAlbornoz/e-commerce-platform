# 0006 · El promedio de rating lo calcula el servidor

## Contexto

El catálogo muestra la calificación promedio de cada producto en la grilla. Calcularla leyendo las
reseñas en el momento costaría una consulta por cada producto de la página, así que el promedio y
la cantidad de reseñas se guardan denormalizados en el documento del producto
(`ratingAverage`, `ratingCount`).

La pregunta que este documento resuelve no es si denormalizar, sino **quién escribe esos dos
campos**. Y ahí aparece un problema de seguridad que no es evidente: si la security rule le permite
a un cliente escribir el promedio de un producto, **puede escribir cualquier número**. Se pone 5
estrellas con 1000 reseñas y ninguna regla lo detecta, porque verificar si un promedio es correcto
exige conocer todas las reseñas, y una security rule no puede leerlas todas.

El stack no tiene Cloud Functions, así que no hay disparador de base de datos disponible.

## Decisión

Los campos `ratingAverage` y `ratingCount` son **de solo lectura para todo cliente**. Ninguna
security rule permite escribirlos.

El cliente escribe únicamente su propia reseña, que es lo que las reglas le permiten. Después llama
a una **Vercel Function con el Admin SDK** que **recalcula el promedio desde cero** leyendo la
subcolección de reseñas y escribe los dos campos. El Admin SDK corre del lado del servidor y se
saltea las reglas por diseño, que es exactamente lo que hace falta acá.

**Recalcular desde cero en vez de incrementar es parte de la decisión, no un detalle.** Hace la
operación idempotente: si la llamada falla después de que la reseña se guardó, el promedio queda
viejo un rato y el siguiente intento lo arregla. Nunca queda un valor corrupto por haber sumado dos
veces.

## Alternativas descartadas

**Que el cliente actualice el promedio en una transacción.** Es lo primero que uno intenta y es un
agujero de seguridad, por el motivo explicado arriba. Se puede mitigar parcialmente: una regla
puede verificar aritméticamente que el promedio nuevo sea consistente con el viejo y la
calificación enviada. Se descartó igual, porque esa verificación se vuelve frágil cuando una reseña
se edita o se borra, y porque deja la puerta abierta a que una regla mal escrita en el futuro
exponga el campo.

**Consultas de agregación de Firestore** (`average()` y `count()` del servidor). Correctas, seguras
y sin denormalización. Sirven perfecto en la ficha de un solo producto, pero en una grilla de veinte
productos serían veinte consultas de agregación por render. Quedan como respaldo para la pantalla
de detalle, no como mecanismo general.

**Cloud Functions con disparador sobre la subcolección.** Sería la solución canónica: el promedio
se recalcula solo cuando una reseña cambia, sin que el cliente tenga que llamar a nada. Queda fuera
porque Cloud Functions no está en el stack del proyecto.

## Consecuencias

- Aparece una **segunda Vercel Function**, con el mismo patrón de verificación de token que la de
  presigned URLs. Reutiliza infraestructura que el proyecto ya tiene, no agrega un proveedor nuevo.
- El promedio es **eventualmente consistente**. Entre que se guarda la reseña y que la function
  termina, el número mostrado es el anterior. Para una calificación promedio eso es aceptable; se
  aclara acá para que no se lea como un bug.
- **Hay dos escrituras donde el usuario percibe una sola acción.** Si la segunda falla, la reseña
  existe y el promedio quedó viejo. La interfaz no debe mostrar un error rojo por eso: la reseña se
  guardó, que es lo que el usuario pidió.
- Escribir una reseña ahora **requiere que la function esté disponible** para que el promedio se
  actualice. La reseña en sí no depende de ella.
- La regla de la ronda de dirección se cumple acá: **ningún número agregado se muestra sin camino al
  dato individual que lo produjo**. El promedio siempre lleva al listado de reseñas que lo formaron.

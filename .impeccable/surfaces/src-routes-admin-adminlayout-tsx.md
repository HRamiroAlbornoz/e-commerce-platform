---
version: 1
slug: "src-routes-admin-adminlayout-tsx"
primary_target: "src/routes/admin/AdminLayout.tsx"
related_targets: []
---

# Superficie de administración — CLACK

Alcance: productos (listado, crear, editar, retirar y reactivar, eliminar definitivamente, subida
de imagen a S3), órdenes (ver todas, filtrar por estado, cambiar estado), dashboard de analytics.
Modo de visitante: **Operate**.

## Audiencia y tarea

Una sola persona que entra varias veces por día y no viene a explorar: viene a hacer una tarea
concreta y salir. Trabaja en escritorio, con el panel abierto en una pestaña durante horas, y
repite la misma operación muchas veces seguidas. Cada clic de más se multiplica por la cantidad de
repeticiones, así que la densidad de información le sirve y los adornos le molestan.

Tarea primaria: cargar o corregir un producto. Segunda: mover una orden de estado.

Éxito es que una corrección de precio cueste dos interacciones y no seis.

Rangos realistas: 24 a 40 productos, y de 0 a unas cientos de órdenes con el tiempo. El estado
inicial de las dos tablas es **vacío**, y ese es el primero que ve el operador el día uno.

## Direction contract

**THESIS.** La tabla es la pantalla, no un componente dentro de la pantalla. Sin consola de
comandos encima, sin planilla, sin tablero: filtros por columna, edición de precio y stock en la
celda, y el formulario completo en su propia ruta. Rechaza el panel de administración que imita un
dashboard de producto —tarjetas de métricas, gráficos decorativos, aire de sobra— cuando lo que el
operador necesita es ver cuarenta filas a la vez.

**OWN-WORLD.** Hereda la paleta y las tipografías de las otras superficies y baja el volumen a
propósito: el campo de color por pieza se reduce a una miniatura en la primera columna, porque acá
compite con los datos en vez de ayudar. Grotesca en todo, didone solo en el título de la pantalla.
Filas separadas por líneas de un pelo, números tabulares, sin sombras y sin bordes redondeados
grandes. El estado de una orden se lee por una marca además del color, nunca solo por el color.

**STORY.** Entiende el estado del catálogo y de las órdenes de un vistazo. Cree que puede corregir
algo sin romper nada. Hace: edita un precio en la celda, o cambia una orden de estado.

**FIRST VIEWPORT.** Header angosto del panel con el nombre de la sección en didone y la acción de
crear a la derecha. Debajo, una fila de filtros por columna y el recuento de resultados. Después
el encabezado de tabla fijo y las filas, densas, con miniatura de color, nombre, categoría, precio
y stock editables en la celda, estado y las acciones al final de cada fila. Sin paginación visible
hasta que haga falta. En la columna de acciones, "Retirar del catálogo" es la acción normal y
"Eliminar definitivamente" aparece solo cuando el producto no tiene ventas ni reseñas; cuando no
está disponible, la pantalla dice por qué con palabras.

**FORM.** Tabla densa con edición en la celda y formulario en ruta propia. Posición 1 de mi lista
ordenada de estructuras. El dado repartió los índices 4, 5 y 6 y el usuario eligió esta, que no
estaba en la mano: una decisión del usuario le gana al reparto. Seed key 41384511.

**FINISH.** unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance

## Momento memorable

Corregir un precio sin salir de la tabla, y que la fila muestre que se guardó. La velocidad es la
característica.

## Estados que esta superficie tiene que resolver

- **Las dos tablas vacías**, el día uno.
- **Un filtro que no devuelve nada**, distinto de "no hay productos".
- **Guardando una celda**: el estado es por fila, nunca global. Un `savingId`, no un booleano
  compartido, o corregir un precio deshabilita la tabla entera.
- **Una celda que falla al guardar**: la fila vuelve al valor anterior y explica el error.
- **Confirmación de acción destructiva** nombrando el producto, no "¿estás seguro?".
- **Hard delete no disponible**: se explica con el motivo ("tiene 3 ventas registradas").
- **Subida de imagen**: progreso, y qué pasa si la presigned URL vence a mitad.
- **Una transición de estado prohibida** por el grafo del dominio: no se ofrece, y si se intenta,
  se explica.

## Restricciones vinculantes

Contraste WCAG AA en los dos temas. Navegación completa por teclado: la tabla se recorre y se
edita sin mouse, y el foco no se pierde al guardar una celda. El estado nunca depende del color
solo. El panel es de escritorio por diseño, pero la tabla no puede romperse en una pantalla chica:
en angosto pasa a lista apilada, no a scroll horizontal infinito. `prefers-reduced-motion`
respetado. Tailwind v4 CSS-first. React Router 7 desde `react-router`. **El código no lleva
comentarios.**

## Decisiones sin resolver

- Si el dashboard de analytics es una sección más del panel o su propia pantalla de entrada.
- Cómo se muestra el histórico de un cambio de estado, dado que el dominio decidió no guardarlo.
- Qué columnas son editables en la celda además de precio y stock, si alguna.

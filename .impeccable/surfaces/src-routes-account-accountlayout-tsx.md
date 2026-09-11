---
version: 1
slug: "src-routes-account-accountlayout-tsx"
primary_target: "src/routes/account/AccountLayout.tsx"
related_targets: []
---

# Superficie privada de usuario — CLACK

Alcance: registro y login, carrito, checkout de tres pasos, mis órdenes (historial y detalle),
perfil. Modo de visitante: **Operate**.

## Audiencia y tarea

El mismo Customer de la superficie pública, pero ya decidido: viene a completar una compra o a ver
en qué anda una orden. Acá la claridad le gana al impacto, y los estados de error tienen que ser
muy visibles. La expresión nunca puede tapar la tarea.

Tarea primaria: completar la compra. Éxito es llegar al sello de confirmación sin haber tenido que
volver atrás a rehacer algo.

Contenido real: el carrito resuelve nombre, precio e imagen contra el catálogo en vivo, así que
muestra el precio de hoy. La orden guarda una copia. Rangos realistas: carrito de 1 a 6 líneas,
historial de 0 a unas 20 órdenes. El estado inicial del historial es **vacío**, y es el primero
que se ve.

## Direction contract

**THESIS.** El carrito y los tres pasos del checkout son un único documento que crece, no cuatro
pantallas. Cada paso agrega una sección debajo de la anterior, separada por un perforado, así que
la revisión final está a la vista todo el tiempo en vez de ser un paso aparte. Rechaza el stepper
que reemplaza la pantalla en cada paso y obliga a recordar lo que ya se completó.

**OWN-WORLD.** Hereda el mundo de la superficie pública sin inventar nada: fondo tinta, cartela de
papel hueso como único plano claro, didone para cifras y nombres, grotesca para datos, tabla de
especificaciones punteada. El campo de color por pieza se reduce a una franja por línea del
recibo, para que el carrito se siga leyendo como la misma tienda sin competir con el formulario.
Ningún color nuevo: los cuatro de campo y nada más.

**STORY.** Entiende que no perdió nada de lo que ya completó porque lo ve. Cree que la compra está
bajo control. Hace: completa envío, confirma el pago simulado y recibe el número de orden.

**FIRST VIEWPORT.** Columna central angosta con el recibo. Arriba la sección del carrito con una
línea por pieza, su franja de color, cantidad editable y precio tabular. A la izquierda, el
indicador de los tres pasos, que es navegación dentro del mismo documento y no un cambio de
pantalla. A la derecha, el total persistente arriba y el bloque de ayuda y errores debajo. El
sello de confirmación cierra el pie cuando la orden se crea. En 320px la columna del recibo ocupa
todo el ancho, el indicador de pasos pasa a una barra superior fija, y el total se ancla al pie.

**FORM.** Recibo continuo. Posición 2 de mi lista ordenada de estructuras, repartida por el dado
como índice 2 de tres. Seed key a90218d3.

**FINISH.** unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance

## Momento memorable

Volver atrás sin perder nada, porque nunca se fue de la pantalla. El problema más difícil del
checkout de tres pasos lo resuelve la estructura, no el código de estado.

## Estados que esta superficie tiene que resolver

- **Carrito vacío**, que es lo primero que ve un usuario nuevo.
- **Historial vacío**, idem.
- **El precio cambió** entre que miró el carrito y confirmó: se le avisa antes de cobrar.
- **Se quedó sin stock** mientras confirmaba: el mensaje dice qué producto, no "error al procesar".
- **El pago simulado falla**: se puede forzar a propósito para probar el camino infeliz.
- **Cancelar una orden propia** en estado pendiente, con confirmación que nombra la orden.
- **Recargar a mitad del checkout** sin perder lo completado.

## Restricciones vinculantes

Contraste WCAG AA en los dos temas. Navegación completa por teclado con foco visible a lo largo de
los tres pasos. El estado nunca depende del color solo. Mobile-first: base 320px, `md:` 768px,
`lg:` 1024px; nunca `sm:`, `xl:` ni `2xl:`. `prefers-reduced-motion` respetado. Skeletons con la
forma del contenido, no spinners, salvo dentro de un botón que dispara una acción. Tailwind v4
CSS-first. React Router 7 desde `react-router`. **El código no lleva comentarios.**

## Decisiones sin resolver

- El orden entre simular el pago y correr la transacción que descuenta stock. Se decide en el
  contrato de esa slice, no acá, pero no puede decidirse por accidente.
- Cómo se resuelve el scroll en mobile para que el paso actual no quede fuera de vista.
- Si el indicador de pasos permite saltar a un paso posterior o solo volver a uno anterior.

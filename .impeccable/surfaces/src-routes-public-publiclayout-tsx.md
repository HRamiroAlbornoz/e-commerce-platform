---
version: 1
slug: "src-routes-public-publiclayout-tsx"
primary_target: "src/routes/public/PublicLayout.tsx"
related_targets: []
---

# Superficie pública — CLACK

Alcance: landing, catálogo de productos, detalle de producto. Modo de visitante: **Persuade**.

## Audiencia y trabajo

Llega alguien que no conoce la marca, casi siempre desde el celular, con una idea vaga ("necesito
un teclado mecánico") y sin vocabulario técnico. Su trabajo no es comprar: es **decidir cuál**.
Éxito es que alguien que no sabía qué comprar termine sabiéndolo.

Acción primaria: agregar al carrito desde la grilla o desde el detalle. El precio se muestra
siempre y con claridad, pero no compite por la atención en primer lugar.

Prueba disponible: la especificación medida y el párrafo de criterio propio. **No hay** testimonios,
reseñas de prensa, premios, cifras de ventas ni logos de medios, y no se inventan. Las reseñas de
producto arrancan vacías, y ese estado vacío es lo primero que se ve.

## Direction contract

**THESIS.** La curaduría tiene una forma gráfica propia y es la cartela de museo. Cada producto
entra como pieza numerada de una colección, sobre su propio campo de color, con una ficha que dice
por qué está acá y para quién no es. Rechaza la grilla de cards intercambiables donde el precio es
el titular y todos los productos son la misma mancha negra.

**OWN-WORLD.** Fondo tinta casi negro. Campo de color plano y entero por pieza, de un conjunto
cerrado y nombrado: lima, magenta, cian, ámbar. Sin tintes, sin opacidades, sin variantes
intermedias de esos cuatro. Cartela en papel hueso, como único plano claro, con tipografía didone
para nombres y grotesca para datos. Tabla de especificaciones con filas punteadas, tomada de la
maqueta de catálogo de separados porque funcionó mejor que la lista suelta. Sin sombras difusas,
sin bordes redondeados grandes, sin degradados.

**STORY.** Entiende que alguien probó estas cosas y descartó el resto. Cree que la opinión escrita
vale más que la ficha del fabricante. Hace: elige una pieza y la agrega al carrito.

**FIRST VIEWPORT.** Header con logo espaciado, buscador ancho sobre una sola línea inferior, y
acciones a la derecha. Riel de categorías en caps con tracking, marcadas con un punto en color.
Debajo, la pieza destacada al ancho completo partida en dos: a la izquierda el objeto centrado
sobre su campo de color a sangre; a la derecha la cartela en papel con número de pieza y fecha de
ingreso, nombre en didone grande, la línea de para-quién en itálica, el párrafo de criterio, la
tabla punteada de especificaciones, y al pie el precio en didone con la acción primaria a su
derecha. Más abajo, el resto de la sala en grilla de cuatro, cada pieza numerada sobre su color.

**FORM.** Vitrina de museo con cartela. Posición 4 de mi lista ordenada de la segunda mano,
presentada como carta propia en el registro safer pedido por el usuario. Seed key 79cc38e9.
Mezcla aprobada: estructura y paleta de la Vitrina más la tabla punteada del Catálogo de Separados.

**FINISH.** unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance

## Momento memorable

El campo de color a sangre por pieza. No es decoración: es lo que hace que un catálogo de objetos
todos negros se pueda recorrer de un vistazo.

## Subidas heredadas de la ronda de dirección

- **Paleta cerrada** (del teletexto): cuatro colores de campo nombrados, planos y enteros. Ninguno
  intermedio en ninguna parte de la aplicación.
- **Trazabilidad hasta el dato** (del brocado jacquard): ningún promedio se muestra sin camino a
  las reseñas individuales que lo formaron.
- **Una sola línea de mira** (de Versalles): la portada se compromete con un eje dominante en vez
  de equilibrar bloques del mismo peso.
- **El bloqueo se explica con palabras** (del instalador shareware): donde un requisito impide
  avanzar, la pantalla dice cuál es en el punto del bloqueo. Nunca un control gris silencioso.
- **La capa personal no edita el terreno** (del mapa de orientación): el catálogo es compartido y
  de solo lectura para el cliente; el carrito y la sesión son una capa encima que no lo muta.
  Coincide con las security rules de Firestore, y esa coincidencia no es casual.

## Restricciones vinculantes

Contraste WCAG AA en los dos temas, verificado. Navegación completa por teclado con foco visible.
Mobile-first: base a 320px, `md:` a 768px, `lg:` a 1024px; nunca `sm:`, `xl:` ni `2xl:`.
`prefers-color-scheme` en los dos sentidos; el oscuro es el principal acá y el claro se diseña, no
se invierte. Se respeta `prefers-reduced-motion`. Skeletons con la forma del contenido real en la
grilla, nunca spinners, para que el layout no salte. Tailwind v4 CSS-first, sin
`tailwind.config.js`. React Router 7 desde `react-router`. **El código no lleva comentarios.**

## Decisiones sin resolver

- Las caras tipográficas exactas. La maqueta usó Bodoni Moda y Archivo, que sirvieron, pero la
  elección definitiva se confirma al construir y se mide contra el resto del sistema.
- El estado vacío del catálogo cuando un filtro no devuelve nada, y cómo se ve la compuerta de una
  pieza que ya está en el carrito.
- Cuántas piezas entran en la primera pantalla del catálogo antes de paginar.

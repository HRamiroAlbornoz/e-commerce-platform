# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Decidido por el usuario, no delegado. React 19 + TypeScript estricto + Vite. React Router 7
(importado de `react-router`; no existe `react-router-dom`). Tailwind CSS v4 con configuración
CSS-first (`@import "tailwindcss"` y `@theme`; **no existe `tailwind.config.js`**). Estado global
con Context API + useReducer, en dos contextos separados: autenticación y carrito.

Backend administrado: Firebase Authentication y Firestore. Imágenes en AWS S3, subidas con
presigned URLs generadas por Vercel Functions. Deploy en Vercel. Testing con Vitest y React
Testing Library, más `@firebase/rules-unit-testing` para las security rules.

## Users

**Customer.** Alguien que quiere comprar un periférico y no sabe cuál. Llega sin conocer la marca,
generalmente desde el celular, con una idea vaga ("necesito un teclado mecánico") y sin vocabulario
técnico: no sabe qué es un switch lineal ni cuánta diferencia hace. Su trabajo real no es "comprar
un teclado", es **decidir cuál**. Ese es el problema que la tienda resuelve o no resuelve.

**Administrator.** Una persona que entra varias veces por día a cargar productos, corregir precios
y stock, y mover órdenes de estado. No está explorando: viene a hacer una tarea concreta y quiere
salir. Trabaja en escritorio.

## Product Purpose

CLACK es una tienda de periféricos de computadora —teclados mecánicos, mouse, headsets, monitores,
sillas y mousepads— con dos experiencias separadas: la del cliente que navega y compra, y la del
administrador que gestiona el catálogo y las órdenes.

Tiene éxito cuando alguien que no sabía qué comprar termina sabiéndolo. Un catálogo que solo lista
productos con su precio no logra eso; es lo que define el resto de las decisiones.

Segundo propósito, igual de real y que condiciona decisiones técnicas: **es una pieza de portfolio**
construida para que la lea un reclutador. Ante dos caminos igual de válidos, gana el que se puede
explicar y defender mejor.

## Positioning

**Tienda curada, no catálogo infinito.** Entre 24 y 40 productos elegidos, cada uno con una opinión
escrita sobre para quién es y para quién no. La diferencia no es el surtido ni el precio: es que
alguien ya hizo el trabajo de descartar.

Una tienda con 2000 productos no puede copiar esto sin dejar de ser lo que es. Es lo que justifica
que el diseño sea editorial y que el precio no sea lo primero que se ve.

## Operating Context

El Customer llega desde el celular, muchas veces con conexión mala, y compara contra otras pestañas
abiertas. Decide mirando fotos y leyendo poco. Si la pantalla no dice nada en los primeros dos
segundos, se va.

El Administrator trabaja en escritorio, con el panel abierto en una pestaña durante horas. Hace la
misma operación muchas veces seguidas: cargar producto, cargar producto, corregir precio. Cada clic
de más se multiplica por la cantidad de veces que repite la tarea, y por eso la densidad de
información le sirve y los adornos le molestan.

## Capabilities and Constraints

Lo que la aplicación hace, con criterios de aceptación, vive en `docs/spec.md`. El modelo de
dominio, el vocabulario y las reglas del negocio viven en `docs/arquitectura.md`. Esos dos archivos
son la autoridad; acá van solo las restricciones durables.

- **Dos roles, `customer` y `admin`.** No hay un tercero. El rol vive en Firestore y se espeja a un
  custom claim del token; las security rules lo validan del lado del servidor.
- **El checkout es una simulación de pago.** No hay pasarela y no hay dinero. Pero **sí** descuenta
  stock en una transacción, y cancelar una orden lo devuelve.
- **Las órdenes son inmutables salvo su estado**, y guardan una copia de lo comprado, no
  referencias. Un cambio de precio no altera una compra pasada.
- **Nunca se guardan ni se loguean datos de tarjeta**, ni siquiera de prueba.
- **Las credenciales de AWS existen solo en las Vercel Functions**, nunca en el navegador.
- **El código de este proyecto no lleva comentarios.** Decisión explícita del autor. Si se genera
  código de ejemplo, va sin comentarios.
- **Mobile-first estricto:** base a 320px, `md:` a 768px, `lg:` a 1024px. No se usan `sm:`, `xl:`
  ni `2xl:`.
- **Un solo idioma (español) y una sola moneda.** No hay i18n ni multi-moneda.
- **Sin cupones, sin impuestos, sin envío por zona.** El costo de envío es un valor fijo.

## Brand Commitments

**Nombre: CLACK.** Es el sonido de un switch mecánico. Se escribe en mayúsculas. El logo es
puramente tipográfico: no hay isotipo ni ilustración de marca que respetar.

**Dirección visual, elegida por el autor y vinculante:** editorial impreso, densidad de revista,
periodismo de datos. Un bloque de color saturado por pieza, que resuelve el problema real de que
todos los periféricos negros se ven iguales. Serif de display en minúsculas para titulares.
Referencia de composición y sensación en `docs/referencias/b-pudding-editorial.png`, tomada
deliberadamente de fuera del e-commerce para no heredar el género de tienda online.

**Prohibiciones explícitas:** nada de RGB de gamer, neón sobre negro, degradados tipo SaaS,
glassmorphism, cards con sombra difusa, ni estética de "setup gamer". La gracia de esta tienda es
no parecer una tienda gamer.

**Voz:** española neutra, sin modismos regionales. Directa y con opinión, porque el posicionamiento
es la curaduría. Nunca lenguaje de vendedor ("¡increíble oferta!", "el mejor del mercado").

## Evidence on Hand

Hay que ser explícito acá, porque **esta tienda no existe** y nada de lo que sigue se puede
inventar en el camino:

- **No hay clientes reales, testimonios, reseñas de prensa, premios ni cifras de ventas.** Nada de
  "elegido por 10.000 gamers", "líder del mercado" ni logos de medios. Si una pantalla necesita
  prueba social, se resuelve de otra manera o no se pone.
- **No hay marcas reales.** Los productos son líneas inventadas de CLACK. No se usan nombres de
  fabricantes existentes ni sus imágenes de prensa.
- **Las fotos salen de bancos de licencia libre** (Unsplash, Pexels), que tienen material de
  teclados, mouse y headsets. Todavía no están descargadas.
- **Las reseñas de producto empiezan vacías.** El sistema de reviews existe, pero el estado inicial
  es sin ninguna reseña, y ese estado vacío es lo que se ve primero.
- **La única prueba real disponible es el producto mismo**: la especificación técnica y la opinión
  escrita sobre para quién es cada periférico.

## Product Principles

1. **Ayudar a decidir, no a listar.** Toda pantalla del catálogo se juzga por si acerca al visitante
   a elegir. Una grilla más densa que no ayuda a decidir es peor, no mejor.
2. **La opinión es el producto.** Si una ficha solo repite la especificación del fabricante, CLACK
   no aportó nada y el posicionamiento es mentira.
3. **El precio es consecuencia, no titular.** Se muestra siempre, con claridad y sin esconderlo,
   pero no es lo primero que compite por la atención.
4. **Las dos experiencias son distintas a propósito.** Lo que sirve al Customer (impacto, aire,
   jerarquía fuerte) le estorba al Administrator (densidad, velocidad, repetición). No se unifican
   por coherencia.
5. **Preferir lo defendible.** Entre dos opciones válidas gana la que se puede explicar. Vale
   pagar algo de complejidad por una decisión que se sostiene.

## Accessibility & Inclusion

Requisitos, no aspiraciones:

- Contraste **WCAG AA** en los dos temas, verificado y no estimado.
- **Navegación completa por teclado** con foco visible en todos los flujos, incluido el checkout de
  tres pasos y el panel de administración.
- Los dos temas responden a `prefers-color-scheme`. El oscuro es el principal en la superficie
  pública; el claro se diseña, no se invierte mecánicamente.
- Se respeta `prefers-reduced-motion`.
- La accesibilidad se construye una vez en los componentes base (`components/ui/`), no pantalla por
  pantalla.
- El Customer llega desde el celular con conexión mala: el peso de la página es una cuestión de
  acceso, no solo de performance.

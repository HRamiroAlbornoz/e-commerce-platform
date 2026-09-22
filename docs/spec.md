# Especificación · CLACK

## 1 · Qué se construye

Una aplicación de página única para **CLACK**, una tienda curada de periféricos de computadora con
entre 24 y 40 productos, que soporta dos roles: el cliente que navega el catálogo, arma un carrito
y completa una compra simulada, y el administrador que gestiona el catálogo y las órdenes desde un
panel protegido. Los datos viven en Firebase (Authentication y Firestore), las imágenes de producto
en AWS S3 mediante URLs prefirmadas generadas por funciones serverless, y todo se despliega en
Vercel.

## 2 · Qué queda afuera

Lista explícita. Nada de esto es un olvido ni una tarea pendiente: es alcance descartado.

- **Pasarela de pago real.** El pago es una simulación que se puede forzar a éxito o a error.
- **Libreta de direcciones.** Los datos de envío se completan en cada checkout y se copian en la
  orden.
- **Cupones, impuestos y envío por zona.** El costo de envío es un valor fijo.
- **Múltiples monedas e internacionalización.** Un solo idioma y una sola moneda.
- **Devoluciones y reembolsos.** `cancelled` es el final del camino infeliz y lo único que hace es
  devolver el stock.
- **Administración de categorías.** Son un conjunto cerrado en el código.
- **Reserva de stock mientras el carrito está abierto.** Se descuenta al confirmar, no al agregar.
- **Historial de cambios de estado de una orden.** Se guarda el estado actual, no la secuencia.
- **Exigir una compra previa para dejar una reseña.** Alcanza con estar autenticado.
- **Notificaciones por correo.** Ninguna, salvo el correo de recuperación de contraseña que envía
  Firebase Auth por su cuenta.
- **Sincronización en tiempo real entre usuarios.** Ver la sección 3.
- **Monitoreo de errores en producción** tipo Sentry, y **versionado formal con tags**. Los dos
  quedan anotados como lo que se agregaría con usuarios reales.

## 3 · Decisiones de infraestructura

| Decisión | Resultado | Estado y motivo |
|---|---|---|
| Base de datos | Firestore | **Impuesta por el enunciado.** No fue una decisión nuestra, y conviene registrar el costo: con siete entidades relacionadas y necesidad de agregaciones, una base relacional habría sido más natural. Ese costo se paga en el ADR 0006 y en la denormalización de `ratingAverage` y `orderCount` |
| Autenticación | Firebase Authentication | **Impuesta por el enunciado.** Coherente con Firestore y sin alternativa razonable dentro del stack |
| Autorización por rol | Custom claim espejado desde `users/{uid}` | **Decidida con motivo** → [ADR 0001](adr/0001-roles-con-custom-claims-espejados-desde-firestore.md) |
| Estado global | Context API + useReducer | **Impuesta por el enunciado** → [ADR 0002](adr/0002-context-api-y-usereducer-para-el-carrito.md) |
| Tiempo real | **No se usa.** Lecturas puntuales, no suscripciones | **Decidida con motivo.** El enunciado menciona "base de datos en tiempo real", pero ningún criterio de aceptación requiere que un usuario vea el cambio de otro sin recargar. Suscribirse a colecciones cuesta lecturas continuas y complica la limpieza de efectos. Se revisa solo si aparece un criterio que lo pida |
| Almacenamiento de imágenes | AWS S3 con presigned URLs | **Impuesta por el enunciado** en el qué; el cómo es nuestro → [ADR 0003](adr/0003-imagenes-en-s3-con-presigned-urls.md) |
| Backend serverless | Vercel Functions | **Impuesta por el enunciado.** Dos funciones: firmar URLs de subida y recalcular el promedio de reseñas |
| Servicios externos | Ninguno | **Decidida con motivo.** El pago es simulado, así que no hay pasarela, ni correo, ni notificaciones |
| Repositorios | Un repo, un `package.json` | **Decidida con motivo.** Frontend y funciones son del mismo dueño y se despliegan juntos; un monorepo con paquetes sería ceremonia sin función |
| Dónde vive el contrato | `shared/schemas/` en la raíz | **Decidida con motivo.** Esquemas Zod únicos importados por `src/` y por `api/`, con los tipos derivados por `z.infer`. Evita el esquema duplicado sin pagar el costo de un monorepo. `api/` necesita su propio `tsconfig` con resolución `NodeNext`, porque el de Vite usa `bundler` |
| Hosting | Vercel | **Impuesta por el enunciado.** Preview por rama, producción en el merge a `main` |
| Datos en desarrollo | Firebase Emulator Suite | **Decidida con motivo.** Es la única forma de testear las security rules de manera automatizada en CI sin tocar datos reales ni consumir cuota. Requiere Java, ya instalado y verificado |
| Registro de errores | Salida estructurada en JSON desde las funciones, **con una condición escrita** | **Decidida con motivo.** La regla general de Hernán pide pino o winston. Acá no hay un servidor de larga vida sino funciones serverless, donde pino agrega peso de bundle y tiempo de arranque en frío sin aportar lo que lo hace valioso —transporte, rotación, destinos múltiples—, porque Vercel ya captura y agrupa la salida estándar. Se emite un objeto JSON con `timestamp`, `level`, `requestId`, `code` y `message`. **La condición, no la excepción:** el día que este proyecto tenga un backend propio de larga vida, entra pino |

## 4 · Entidades del dominio

Omitida a propósito: existe [`docs/arquitectura.md`](arquitectura.md), que es la autoridad sobre
entidades, campos, relaciones y reglas del dominio. Ver la sección 8.

## 5 · Features con criterios de aceptación

Cada criterio se responde con sí o no mirando la aplicación.

### F1 · Registro e inicio de sesión

1. Con un email válido y una contraseña de 8 o más caracteres, se crea la cuenta, se crea el
   documento `users/{uid}` con `role: 'customer'`, y se redirige al catálogo.
2. Con un email ya registrado, se muestra el error en el campo email sin perder lo tipeado en el
   resto del formulario.
3. Con una contraseña de menos de 8 caracteres, el botón de envío queda deshabilitado y la pantalla
   explica el requisito antes de intentar enviar.
4. El registro y el inicio de sesión con Google funcionan y producen el mismo documento de usuario
   que el registro con email.
5. Un mensaje de inicio de sesión fallido **no revela** si el email existe o no.
6. Al recargar la página, la sesión persiste y el usuario sigue autenticado.
7. Al cerrar sesión, se vuelve al catálogo y el carrito de Firestore ya no se lee.
8. Mientras Firebase no confirmó el estado de autenticación, **no se redirige a ninguna parte** y
   no se muestra ni la interfaz de invitado ni la de autenticado: se muestra un estado de carga.
9. Desde la pantalla de login se puede pedir la recuperación de contraseña con el email, y la
   pantalla confirma que el correo se envió.
10. El mensaje de confirmación es **el mismo exista o no la cuenta**, para no revelar qué emails
    están registrados. Es la misma razón por la que el error de login no lo revela.

### F2 · Catálogo de productos

1. Los productos activos se listan desde Firestore; un producto con `isActive: false` no aparece.
2. Mientras cargan, se ven skeletons con la forma de las tarjetas reales, y el layout **no salta**
   cuando llegan los datos.
3. El filtro por categoría cambia el listado sin recargar la página, y la categoría activa queda
   reflejada en la URL como parámetro de consulta.
4. La búsqueda por nombre tiene debounce: escribir "teclado" a velocidad normal **no** dispara una
   consulta por cada tecla.
5. La búsqueda **coincide por prefijo** sobre un campo `nameLower` normalizado: "tec" encuentra
   "Teclado TK-87", y "clado" no encuentra nada. Es una limitación de Firestore, que no tiene
   búsqueda de texto completo, y está declarada en la interfaz para que el usuario no crea que no
   hay resultados.
6. Cuando ningún producto coincide con el filtro o la búsqueda, se muestra un mensaje que distingue
   "no hay resultados para esta búsqueda" de "todavía no hay productos".
7. Si la consulta a Firestore falla, se muestra un error comprensible con opción de reintentar, no
   una pantalla vacía ni un mensaje técnico.
8. Recargar la página con filtros aplicados en la URL reproduce el mismo listado.
9. Cada tarjeta muestra el campo de color curatorial de su pieza (`displayColor`, no el color
   físico del periférico), el nombre, una línea de descripción y el precio, y todas las tarjetas de
   una fila tienen la misma altura.

### F3 · Detalle de producto

1. Al abrir un producto se ven su imagen, nombre, descripción, precio, especificaciones técnicas y
   el párrafo de criterio propio de CLACK.
2. Un producto inexistente o inactivo muestra una pantalla de "no encontrado", no un error crudo.
3. El promedio de reseñas se muestra junto a la cantidad, y desde ahí se puede llegar al listado de
   reseñas individuales que lo formaron.
4. Si el stock es cero, el botón de agregar al carrito está deshabilitado y la pantalla dice que no
   hay stock.
5. No se puede agregar al carrito una cantidad mayor al stock disponible.

### F4 · Paginación del catálogo *(extra)*

1. El catálogo carga los productos en lotes con `limit()` y no trae la colección entera.
2. Avanzar de página usa `startAfter()` con el cursor del último documento, no un salto por índice.
3. La página actual queda en la URL, y recargar mantiene la posición.
4. En la última página, el control de avanzar está deshabilitado.
5. Cambiar de categoría o de búsqueda vuelve a la primera página.
6. **Hay dos caminos de consulta y los dos paginan.** Sin término de búsqueda, el listado ordena
   por fecha de creación y pagina con `startAfter()`. Con término de búsqueda, ordena por
   `nameLower` y pagina sobre la consulta de rango. Los dos caminos están cubiertos por tests, y
   cambiar de uno al otro resetea el cursor.

### F5 · Carrito de compras

1. Se puede agregar un producto al carrito **sin tener sesión**.
2. Se puede eliminar un producto y cambiar su cantidad, y el total se recalcula solo.
3. El total es correcto y está redondeado a dos decimales, verificado con un caso que produzca
   error de punto flotante.
4. El carrito de invitado sobrevive una recarga de página.
5. Si el contenido guardado en `localStorage` está corrupto o tiene un esquema viejo, la aplicación
   arranca con el carrito vacío en lugar de fallar.
6. Al iniciar sesión con un carrito de invitado no vacío, los dos carritos se fusionan: un producto
   presente en ambos queda con la **cantidad mayor**, no con la suma.
7. Si al fusionar un producto quedó afuera por estar inactivo o sin stock, se le dice al usuario
   cuál y por qué.
8. Con el carrito vacío se muestra un mensaje y un camino de vuelta al catálogo, no una pantalla en
   blanco.
9. El indicador del header muestra la cantidad de ítems y se actualiza al agregar.

### F6 · Checkout y creación de la orden

1. El checkout tiene tres secciones —envío, pago simulado y revisión final— dentro de un mismo
   documento, y la revisión final es visible sin cambiar de pantalla.
2. Volver de una sección a la anterior **no pierde** lo ya tipeado.
3. Recargar la página a mitad del checkout no pierde los datos ya completados.
4. Si un requisito impide avanzar, la pantalla dice **cuál es** en el punto del bloqueo; no hay
   botones deshabilitados sin explicación.
5. Al confirmar, se crea la orden en Firestore con estado `pending`, se descuenta el stock de cada
   producto, se incrementa su `orderCount` y se vacía el carrito, **todo en una sola transacción**.
6. La orden guarda una **copia** del nombre, precio unitario e imagen de cada producto, no una
   referencia.
7. Si un producto se queda sin stock mientras el usuario confirmaba, la operación falla completa
   —no se crea la orden ni se descuenta nada— y el mensaje **nombra el producto** que faltó.
8. Si el precio de un producto cambió entre que el usuario vio el carrito y confirmó, se le avisa
   antes de cobrar.
9. Con el pago simulado forzado a error, no se crea ninguna orden y el carrito queda intacto.
10. Al completarse, se muestra el número de orden y un camino hacia "mis órdenes".
11. Ningún dato de tarjeta se guarda en Firestore ni aparece en los logs.

### F7 · Historial de órdenes del cliente

1. El historial muestra **solo** las órdenes del usuario autenticado.
2. Un usuario que intenta leer la orden de otro recibe un error de permisos **desde Firestore**, no
   solo un filtro del frontend.
3. Se puede abrir una orden pasada y ver sus ítems, totales, datos de envío y estado.
4. Sin órdenes, se muestra un mensaje claro; es el primer estado que ve un usuario nuevo.
5. El estado de cada orden se distingue **sin depender del color solo**.
6. Se puede cancelar una orden propia que esté en `pending`, con una confirmación que nombra la
   orden.
7. Al cancelar, el stock de cada ítem vuelve a sumarse, en la misma transacción que cambia el
   estado.
8. Una orden en `processing`, `completed` o `cancelled` **no ofrece** la acción de cancelar.

### F8 · Reseñas y calificaciones *(extra)*

1. Un usuario autenticado puede dejar una calificación de 1 a 5 y un comentario en un producto.
2. Volver a opinar sobre el mismo producto **reemplaza** la reseña anterior; nunca hay dos del
   mismo autor.
3. Un usuario solo puede editar o borrar su propia reseña, y eso lo impide Firestore, no el
   frontend.
4. Después de guardar una reseña, el promedio del producto se actualiza sin recargar la página.
5. Los campos `ratingAverage` y `ratingCount` **no se pueden escribir desde el cliente**,
   verificado con un test de security rules.
6. Un producto sin reseñas muestra un estado vacío que invita a escribir la primera, no "0
   estrellas".
7. Si la actualización del promedio falla, la reseña igual queda guardada y no se muestra un error
   de fallo al usuario.

### F9 · Panel de administración · productos

1. El panel es una tabla densa donde se ven al menos 15 productos sin hacer scroll en escritorio.
2. Se puede crear un producto desde una ruta propia, con validación Zod de todos los campos.
3. Se puede editar un producto desde su ruta propia, con el formulario precargado.
4. Precio y stock se editan **en la celda** de la tabla, y el estado de guardado es **por fila**:
   editar una fila no deshabilita la tabla entera.
5. Si el guardado de una celda falla, la celda vuelve a su valor anterior y se explica el error.
6. "Retirar del catálogo" desactiva el producto, es reversible, y el producto desaparece del
   catálogo público.
7. "Eliminar definitivamente" aparece **solo** si el producto no tiene ventas ni reseñas; cuando no
   está disponible, la pantalla explica el motivo con palabras.
8. Toda acción destructiva pide confirmación **nombrando el producto**, y el producto sale de la
   tabla recién cuando el backend confirmó.
9. Con la tabla vacía, se muestra un estado inicial que guía a cargar el primer producto.
10. Un filtro sin resultados se distingue de "no hay productos".

### F10 · Panel de administración · subida de imágenes

1. Al subir una imagen, el frontend pide una URL prefirmada a la Vercel Function y sube el archivo
   **directamente a S3**.
2. **No hay ninguna credencial de AWS en el bundle del frontend**, verificado buscando en los
   archivos generados por el build.
3. La función **rechaza con 401 o 403** a quien no presente un ID token válido de Firebase con el
   claim de administrador.
4. La función valida el tipo de archivo y el tamaño, y genera la clave del objeto con un UUID, no
   con el nombre original.
5. Se ve el progreso de la subida, y si la URL prefirmada venció, el mensaje lo dice y permite
   reintentar.
6. Los dos pasos que pueden fallar —pedir la URL y subir con ella— producen mensajes distintos.

### F11 · Panel de administración · órdenes

1. El administrador ve **todas** las órdenes, no solo las propias.
2. Se pueden filtrar por estado, y el estado activo queda en la URL.
3. Se puede cambiar el estado de una orden, y **solo** se ofrecen las transiciones que el grafo del
   dominio permite.
4. `completed` y `cancelled` son terminales: una orden en esos estados no ofrece ninguna
   transición.
5. Cambiar una orden a `cancelled` devuelve el stock de sus ítems, en la misma transacción.
6. Una orden no se puede cancelar dos veces, así que el stock no se devuelve dos veces.
7. Un usuario con rol `customer` que llame directamente a Firestore para cambiar el estado de una
   orden recibe un error de permisos.

### F12 · Dashboard de analytics *(extra)*

1. El panel muestra ingresos totales, cantidad de órdenes y productos más vendidos. El ranking de
   más vendidos se consulta con `orderBy('unitsSold','desc').limit(...)` sobre los productos, no
   recorriendo órdenes.
2. Los montos se calculan con consultas de agregación de Firestore (`sum()` y `count()`) sobre las
   órdenes que no están canceladas, no trayendo los documentos.
3. `unitsSold` baja al cancelar una orden, así que una compra cancelada no queda contada como
   vendida en el ranking.
4. Con cero órdenes, el dashboard muestra un estado vacío y **no** gráficos vacíos ni ceros
   engañosos.
5. Los gráficos son legibles en el tema claro y en el oscuro, y la información no depende del color
   solo: cada serie se puede identificar sin distinguir colores.
6. El dashboard no dispara una consulta por cada producto del catálogo.

### F13 · Protección de rutas y reglas de seguridad

1. Una ruta que requiere sesión, abierta sin sesión, redirige a login y **vuelve al destino
   original** después de autenticarse.
2. Una ruta de administración, abierta por un `customer`, es inaccesible y muestra una pantalla que
   lo explica.
3. Ningún guard toma una decisión mientras el estado de autenticación o el rol están cargando.
4. Un `customer` **no puede** escribirse `role: 'admin'` en su propio documento, verificado con un
   test de security rules contra el emulador.
5. Un `customer` **no puede** leer órdenes de otro usuario, verificado con un test de reglas.
6. Un `customer` **no puede** crear ni modificar productos, verificado con un test de reglas.
7. Las reglas se ejecutan en CI contra el emulador y la suite falla si alguna permite lo que no
   debe.

### F14 · Landing

1. En el primer viewport se entiende qué es CLACK y qué lo diferencia, sin hacer scroll.
2. Hay una acción primaria visible que lleva al catálogo.
3. No hay ninguna afirmación inventada: ni testimonios, ni cantidades de clientes, ni premios, ni
   logos de medios.
4. Es usable y legible a 320px de ancho.
5. La imagen principal no bloquea el render del texto.

### F15 · Deploy y entornos

1. La aplicación es accesible desde una URL pública de Vercel.
2. `/api/health` responde `{ ok: true }` en producción.
3. Todas las variables de entorno están configuradas en Vercel y ninguna credencial está en el
   repositorio.
4. `git ls-files` no lista ningún archivo `.env`, y `.env.example` **sí** está en el repositorio
   sin valores reales.
5. Los cinco flujos principales funcionan en producción, verificados con los dos roles.
6. El build de producción no emite warnings de TypeScript ni errores en la consola del navegador.

## 6 · Superficies y estructura

El proyecto tiene las tres superficies. Cada una tiene su brief de diseño con contrato de dirección
en `.impeccable/surfaces/`.

| Superficie | Patrón de listado | Pantallas | Pasos de la acción principal |
|---|---|---|---|
| Pública | Grilla de tarjetas con chips de categoría horizontales | Landing, catálogo, detalle de producto | Agregar al carrito: 1 desde la grilla, 2 desde el detalle |
| Privada de usuario | Recibo continuo de una columna | Login, registro, carrito, checkout, mis órdenes, detalle de orden, perfil | Completar la compra: 3 secciones dentro de un mismo documento |
| Administración | Tabla densa con edición en la celda | Productos, formulario de producto, órdenes, analytics | Corregir un precio: 2 interacciones, sin salir de la tabla |

**Estados de cada superficie.** Las tres resuelven carga, vacío y error. Los estados de carga son
skeletons con la forma del contenido real en listados y tablas, y spinner dentro del botón en
acciones. Los tres estados se construyen una sola vez como componentes reutilizables
(`LoadingState`, `EmptyState`, `ErrorState`), no pantalla por pantalla.

**Edición en línea.** Solo en el panel de administración, y solo precio y stock. Todo lo demás va a
un formulario en ruta propia. Los dos caminos escriben por la misma función del servicio de
productos: la celda no habla con Firestore por su cuenta.

### Orden de construcción, y una desviación declarada

El orden por defecto entre superficies es **privada → administración → pública**, para no invertir
tiempo en presentación antes de validar nada técnico. Acá el **catálogo se adelanta**, y el motivo
es de dependencia de datos, no de preferencia: el catálogo *es* la capa de acceso a Firestore que
las otras dos superficies consumen, así que construirlo primero valida la decisión técnica más
temprano, no más tarde. Lo que sí es presentación pura —la landing— queda última, que es donde el
orden por defecto la quiere. Los datos para construir contra el catálogo los provee el script de
seed, que es cimiento del andamiaje y no una slice.

## 7 · ADRs

| # | Decisión |
|---|---|
| [0001](adr/0001-roles-con-custom-claims-espejados-desde-firestore.md) | Roles con custom claims espejados desde Firestore |
| [0002](adr/0002-context-api-y-usereducer-para-el-carrito.md) | Context API y useReducer para el estado global |
| [0003](adr/0003-imagenes-en-s3-con-presigned-urls.md) | Imágenes en AWS S3 con presigned URLs |
| [0004](adr/0004-carrito-de-invitado-con-merge-al-iniciar-sesion.md) | Carrito de invitado con fusión al iniciar sesión |
| [0005](adr/0005-borrado-de-productos-en-dos-niveles.md) | Borrado de productos en dos niveles |
| [0006](adr/0006-promedio-de-rating-calculado-en-el-servidor.md) | El promedio de rating lo calcula el servidor |
| [0007](adr/0007-creacion-de-la-orden-via-vercel-function-con-admin-sdk.md) | La orden se crea desde una Vercel Function con el Admin SDK |

## 8 · Modelo de dominio

[`docs/arquitectura.md`](arquitectura.md) es la autoridad sobre entidades, campos, relaciones,
vocabulario y las trece reglas del dominio. Reemplaza a la sección 4 de esta especificación.

## 9 · Flujos del recorrido

Completada en el Cierre del release 1 (2026-09-22), recorriendo la aplicación terminada en
producción y en el emulador seedeado, con mouse y con teclado, en los dos temas y en 320px/desktop.
A partir del release 2 se lee de acá en vez de redescubrirse.

### Principal · Pública (visitante)

Entra a `/`, ve la pieza destacada (hero) y la grilla debajo sin hacer scroll (F14.1). Filtra por
categoría o busca por nombre (prefijo, con debounce); el filtro queda en la URL. Entra al detalle
de un producto desde la grilla o desde el hero. Sin sesión, puede agregar al carrito desde la
grilla (un paso) o desde el detalle (dos pasos, eligiendo cantidad).

### Principal · Privada (comprador)

Con algo en el carrito, va a `/cart`, ajusta cantidades, entra a `/checkout`. Completa los tres
pasos del recibo continuo (envío → pago simulado → revisión), confirma la compra y es redirigido a
`/orders/:id` con los datos reales de la orden ya creada (stock descontado, contadores del producto
actualizados). Desde `/orders` ve el historial y puede cancelar una orden en `pending`, lo que
devuelve el stock en la misma transacción. Desde el detalle de un producto que compró puede dejar
una reseña.

### Principal · Administración

Entra a `/admin/products` con una cuenta con el claim `admin`. Corrige precio o stock en la celda
sin salir de la tabla (dos interacciones), retira o reactiva un producto con un click, y solo ve
"Eliminar definitivamente" en los productos sin ventas ni reseñas. Desde `/admin/orders` filtra por
estado, cambia el estado de una orden respetando el grafo de transiciones (los botones que no
corresponden al estado actual no se renderizan, nunca aparecen deshabilitados sin explicación), y
al cancelar ve el stock devuelto reflejado en `/admin/products`. Desde `/admin/analytics` ve
ingresos, cantidad de órdenes y el ranking de más vendidos, actualizados con la orden recién creada.

### Usuario nuevo

Es el único camino que atraviesa las tres superficies, y el que se recorrió con más cuidado en el
Cierre porque un bug real solo aparecía acá: un invitado agrega un producto al carrito, va a pagar,
es redirigido a `/login` con el destino guardado. Si **se registra** (el camino más probable para
alguien sin cuenta) en vez de loguearse, antes del Cierre perdía ese destino y terminaba en el
catálogo; arreglado para que el registro también respete el destino original, igual que el login.
Completa el checkout, llega a la confirmación de la orden, y deja la primera reseña del producto
que compró — la vista de reseñas parte de "todavía no hay reseñas" hasta ese momento.

### Recuperación

Cerrar sesión a mitad de un flujo privado vuelve al catálogo con el carrito de invitado vacío (no
al carrito de Firestore de la sesión anterior). Recargar a mitad del checkout no pierde el paso en
el que estaba (el borrador persiste en `localStorage`, con clave por `uid`). Un `customer` que
intenta abrir una ruta de administración por URL directa recibe la pantalla de acceso denegado, no
un redirect mudo. Ningún guard de ruta decide nada mientras el estado de autenticación o el rol
todavía están cargando.

### Error

Un producto o una orden inexistentes (o de otro usuario) muestran el estado vacío correspondiente,
nunca el error genérico ni una pantalla en blanco. Un fallo del servidor al crear una orden (sin
stock, precio cambiado, carrito desincronizado) aborta sin escribir nada y nombra el producto
afectado en el mensaje. Cortar la red muestra el estado de error reutilizable con la opción de
reintentar, en cualquiera de las tres superficies.

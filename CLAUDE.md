# Contexto del proyecto

E-commerce de periféricos gaming con dos roles (customer / admin). SPA en React + TypeScript,
Firebase como backend de autenticación y datos, AWS S3 para imágenes mediante presigned URLs
generadas por Vercel Functions, y Vercel para el deploy.

Este archivo complementa a `~/.claude/CLAUDE.md`; no lo reemplaza. Solo registra lo que es
específico de este proyecto.

## Excepción a las reglas globales

**El código de este proyecto no lleva comentarios.** Es la única regla que se aparta del
`CLAUDE.md` global, que pide comentarios en español en las funciones no obvias.

Consecuencias, para que la decisión no degrade el código:

- Los nombres cargan todo el peso. Sin un comentario que rescate un nombre flojo, las funciones se
  parten antes: partir es la única herramienta que queda para explicar.
- No se usan type assertions (`as Tipo`). La regla global las tolera solo con un comentario que
  las justifique; sin comentarios, la excepción se cierra. Si aparece una realmente inevitable, la
  justificación va al ADR o a la descripción del PR.
- La documentación **no** está afectada: `README.md`, `docs/spec.md`, `docs/arquitectura.md` y los
  ADRs se escriben completos, igual que en cualquier otro proyecto. Ahí viven los endpoints
  (método, URL, parámetros, respuesta, errores) y el porqué de cada decisión cara de revertir.

## El logger, con su condición

La regla general pide un logger estructurado como pino o winston. **En este proyecto no aplica
todavía, y el motivo está escrito para que se pueda revisar:** no hay un servidor de larga vida,
solo Vercel Functions, donde pino suma peso de bundle y tiempo de arranque en frío sin aportar lo
que lo hace valioso (transporte, rotación, destinos múltiples), porque Vercel ya captura y agrupa
la salida estándar.

Se emite un objeto JSON con `timestamp`, `level`, `requestId`, `code` y `message`. Lo que sigue
prohibido es lo que la regla realmente combate: un `console.log` suelto con un mensaje vago y sin
contexto.

**La condición:** el día que este proyecto tenga un backend propio de larga vida (un Express, un
servidor persistente), entra pino. No es una excepción permanente, es una regla con su condición
explicitada.

## Vulnerabilidades de npm audit — excepción monitoreada

`npm audit` reporta 5 (2 moderadas, 3 altas: `ajv`, `path-to-regexp`, `undici`), todas transitivas de
`@vercel/node@13.0.0`, que es la **última versión publicada** (no hay upgrade que las resuelva).
`npm audit fix --force` "arregla" bajando a `@vercel/node@4.0.0`: un retroceso de 9 versiones
mayores, no una solución.

**No se aplica el fix, y es deliberado, no un olvido.** `@vercel/node` se importa en `api/*.ts`
como `import type` — solo tipos, borrados en la compilación. El código real de ese paquete (donde
viven las dependencias vulnerables) nunca corre en la función desplegada: Vercel rutea con su
propia infraestructura de plataforma, no con esta copia de `node_modules`. Solo importaría si se
corriera `vercel dev` localmente, y ni así queda expuesto a internet.

Revisar de nuevo cuando Vercel publique una versión de `@vercel/node` que actualice esas
dependencias, o antes del Cierre si para entonces cambió el análisis.

### Segunda cadena: `firebase-tools`

Al sumar `firebase-tools` (paso 4 del andamiaje) aparecieron 7 vulnerabilidades más (todas
moderadas: `@google-cloud/pubsub`, `@opentelemetry/core`, `csv-parse`, `gaxios`, `stream-json`,
`uuid`, y `firebase-tools` mismo por arrastre). El único fix es `firebase-tools@10.1.1`, un
retroceso de 5 versiones mayores desde la 15.30.0 instalada — mismo patrón que `@vercel/node`.

**Tampoco se aplica, por un motivo distinto al de arriba pero igual de válido.**
`@vercel/node` no ejecuta en absoluto (import type); `firebase-tools` sí ejecuta, pero **solo en
tu maquina y en el runner de CI**, nunca en el código que se despliega — no es una dependencia de
`src/` ni de `api/`, no viaja en el bundle ni en la función. Las vulnerabilidades puntuales
(ReDoS en el parseo de un header "Baggage" de OpenTelemetry, un bug en `csv-parse` al importar
usuarios por CSV, un bounds-check de `uuid`) requieren que la herramienta reciba **input externo
adversarial**, y `firebase-tools` en este proyecto solo habla con el emulador local o con la propia
cuenta de Google — nunca con un tercero no confiable.

De las 3 vulnerabilidades **altas** que sigue reportando `npm audit`, las tres pertenecen a la
cadena de `@vercel/node` de arriba; ninguna es nueva. Total actual: 13 (10 moderadas, 3 altas).

Revisar de nuevo cuando `firebase-tools` publique una versión reciente con esas dependencias
actualizadas, o antes del Cierre.

## Datos operativos

| Dato | Valor |
|---|---|
| Repositorio remoto | https://github.com/HRamiroAlbornoz/e-commerce-platform |
| Repo local | Inicializado, rama `main` |
| Estrategia de ramas | Una rama por feature desde `main`, con las slices adentro. Tope de tres slices por rama |
| Merge | Siempre por pull request desde la interfaz de GitHub, con CI en verde. Nunca merge local. **Squash and merge**: un commit por PR en `main`, mensaje editado si el título del PR no alcanza |
| Formato de commits | Conventional commits en inglés imperativo: `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:` |
| Deploy | Vercel, con integración continua desde GitHub. Preview por rama, producción en el merge a `main` |
| Protección de deploys | Vercel Authentication activa **solo en previews** (`ssoProtection: preview`). Producción es pública, sin login — necesario para F15.1 de la spec |
| URL de producción | https://clack-liart.vercel.app |
| Terminal | Git Bash (MINGW64). Los comandos de git que escriben historial o tocan el remoto los ejecuta Hernán |
| Protección de `main` | CI (`test`) y el deploy de Vercel (`Vercel`) como required status checks, sin aprobación obligatoria (Hernán trabaja solo), sin push directo, `delete_branch_on_merge` activo |

## Comandos de npm

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo de Vite |
| `npm run build` | `tsc -b` (proyecto `src/`) + `vite build` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run lint` / `lint:fix` | ESLint sobre todo el repo |
| `npm run format` / `format:check` | Prettier |
| `npm run typecheck` | `tsc -b` (`src/`) + `tsc -p api/tsconfig.json` (Functions, NodeNext) |
| `npm test` / `test:watch` | Vitest |

## Stack fijado

Las versiones están decididas y no se cambian sin un motivo explícito.

| Pieza | Versión / nota |
|---|---|
| React | 19 |
| TypeScript | **Pineado a `<6.1.0`** (hoy resuelve 6.0.3). TS 7 existe pero `typescript-eslint` todavía no lo soporta (`peerDependency: >=4.8.4 <6.1.0`); no volver a 7.x hasta que typescript-eslint lo permita. `strict: true`, más `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`. `baseUrl` está deprecado desde la 6.0 (se remueve en la 7): los `paths` de `tsconfig.app.json` ya son relativos (`./src/*`) sin `baseUrl`, así que el fix sigue valiendo en cualquiera de las dos versiones |
| ESLint | **Pineado a `<10.0.0`** (junto con `@eslint/js`), hoy resuelve 9.39.x. ESLint 10 existe pero `eslint-plugin-jsx-a11y` todavía solo declara soporte hasta `^9`; no subir hasta que jsx-a11y lo permita |
| Vite | Build tool |
| Tailwind CSS | v4, configuración CSS-first con `@import "tailwindcss"` y `@theme`. **No** hay `tailwind.config.js` |
| React Router | **v8** (subido desde la v7 decidida en la Planificación: v8 solo elimina el paquete `react-router-dom`, que ya no usábamos — el patrón de imports es idéntico). Se importa de `react-router`; `RouterProvider` viene de `react-router/dom`. **No** se usa `react-router-dom` |
| Estado global | Context API + useReducer. Dos contextos separados: autenticación y carrito |
| Backend de datos | Firebase Auth + Firestore |
| Serverless | Vercel Functions en `api/`, handlers tipados con `@vercel/node` |
| Imágenes | AWS S3 con presigned URLs. Las credenciales de AWS viven solo en la Vercel Function |
| Testing | Vitest + React Testing Library, más `@firebase/rules-unit-testing` para las security rules |
| Validación | Zod. Los tipos se derivan con `z.infer`, nunca se duplican |

## Decisiones que se consultan seguido

- **El rol del usuario** vive en `users/{uid}.role` en Firestore como fuente de verdad, y se
  espeja a un **custom claim** de Firebase Auth. Las security rules leen
  `request.auth.token.role`, que no cuesta lecturas; un `get()` dentro de una regla sí se factura.
- **El rol se asigna con un script local de operador**, no con un endpoint HTTP. Un endpoint que
  otorga privilegios es una vía de escalación de permisos.
- **La ausencia del claim es el default seguro**: las reglas comparan contra `'admin'`, así que un
  usuario sin claim nunca es administrador.
- **El carrito** admite invitados: vive en `localStorage` validado con Zod y se fusiona con el de
  Firestore al iniciar sesión.
- **Las órdenes guardan un snapshot** del producto (nombre, precio, imagen), no una referencia. Un
  cambio de precio no puede mutar una orden pasada.

El detalle y las alternativas descartadas están en `docs/adr/`.

## Dónde está qué

| Archivo | Contenido |
|---|---|
| `docs/spec.md` | Alcance, criterios de aceptación, superficies |
| `docs/arquitectura.md` | Entidades del dominio y vocabulario |
| `docs/adr/` | Una decisión cara de revertir por archivo. No se editan: si la decisión cambia, se escribe un ADR nuevo |
| `DESIGN.md` | Sistema visual global. Lo gestiona Impeccable |
| `.impeccable/surfaces/` | Un brief por superficie (pública, privada de usuario, administración) |
| `shared/schemas/` | Contrato Zod único, importado por `src/` y por `api/` |
| `firebase.json` / `.firebaserc` | Configuración del Emulator Suite (Firestore puerto 8080, Auth puerto 9099) y del proyecto real `clack-add2a` |
| `firestore.rules` | Arranca cerrada (`allow read, write: if false`). Cada slice abre solo lo que necesita |
| `scripts/seed.ts` | Carga el catálogo de desarrollo en el emulador. Requiere el emulador corriendo (`firebase emulators:start`) |
| `tests/rules/` | Tests de security rules con `@firebase/rules-unit-testing`, corren aparte con `npm run test:rules` |
| `scripts/` | `seed.ts` para el catálogo de desarrollo, `grant-admin.ts` para asignar el rol admin |

## Herramientas de sesión

- **Plugin `firestore-native`**: encendido mientras dure el proyecto.
- **MCP de Vercel**: logs de runtime y errores agrupados cuando falla un deploy.
- **MCP de chrome-devtools**: capturas de referencia en la etapa de diseño, y consola, red,
  performance y accesibilidad en el recorrido del Cierre.
- **Context7**: se consulta por iniciativa propia antes de afirmar algo sobre una librería del
  stack.

## Estado

**Etapa 2 (Andamiaje) completa.** Etapa 3 (Ciclo) en curso.

**Slice 1 · Catálogo (listado)**, rama `feature/catalog`: capa de datos (converter, `getActiveProducts`, `useActiveProducts`) más la superficie visual construida con Impeccable contra el brief de `.impeccable/surfaces/` — grilla, tarjeta, skeletons, estados vacío/error. Pasó finish review (`ship`) y quedó documentada en `DESIGN.md`. Fuera de alcance a propósito: buscador, riel de categorías y la pieza destacada del hero (van con el filtro real en la slice 2 y con la landing en la slice 14); las tarjetas todavía no son interactivas (sin detalle de producto ni carrito construidos aún).

**Slice 2 · Filtro por categoría + búsqueda por nombre**, rama `feature/catalog`: `getActiveProducts` acepta `{ category?, searchTerm? }` y arma la consulta de Firestore con dos caminos de orden (por `createdAt` sin búsqueda, por `nameLower` con búsqueda, coincidencia de prefijo únicamente), con sus tres índices compuestos nuevos en `firestore.indexes.json`. Estado en la URL (`?category=&q=`) vía `useSearchParams`; la búsqueda tiene debounce (400ms) antes de tocar la URL y Firestore. Verificado en vivo contra el emulador seedeado (Chrome DevTools MCP): filtro, búsqueda por prefijo, combinación de ambos, debounce, recarga con filtros en la URL, y las dos variantes del estado vacío. Pasó el ciclo de finish review de Impeccable (`fix` → dos rondas de correcciones → verdict) y quedó documentada en `DESIGN.md`.

Dos decisiones de la superficie visual, citadas acá porque el proyecto no lleva comentarios en el código (y ya reflejadas en `DESIGN.md`):
- **El buscador y el riel de categorías viven en `CatalogPage`, no en el `<header>` compartido de `PublicLayout`** (que el brief de superficie describe como parte del mismo bloque visual). Se decidió así porque `PublicLayout` también envuelve el detalle de producto y la futura landing, y ninguna de esas pantallas necesita el filtro de categorías; el buscador se renderiza pegado al header compartido para que visualmente se lea como un solo bloque, pero el filtrado es lógica propia del catálogo.
- **El punto de color del riel de categorías es un adorno de ritmo visual, no un identificador único por categoría**: cicla las cuatro piezas cerradas (lima/magenta/cian/ámbar) sobre seis categorías, así que dos pares repiten color (sin que se toquen entre sí en el riel). El nombre en texto es quien distingue la categoría sin ambigüedad; el color acompaña el escaneo rápido, igual que `displayColor` en las tarjetas de producto no mapea 1 a 1 con ningún atributo del producto.

De paso, arreglado un gap de configuración de testing que no era de esta slice pero salió a la luz al escribir el primer test que monta el mismo componente más de una vez en el archivo: `src/test/setup.ts` no limpiaba el DOM entre tests (`@testing-library/react` solo hace `cleanup()` automático si `vitest.config` tiene `test.globals: true`, que este proyecto no usa a propósito). Sin eso, un `render()` en un test dejaba su árbol montado y el siguiente test lo veía. Se agregó un `afterEach(cleanup)` explícito en el setup — sin tocar `globals`.

**Slice 3 · Detalle de producto**, rama `feature/catalog`: `Product` suma `specs: { label, value }[]` y `curatorialNote: string` (contrato ampliado, `scripts/seed.ts` reescrito con datos reales para los 18 productos). Capa de datos nueva: `getProductById` (lectura puntual con `getDoc`, `null` si no existe o está inactivo — F3.2) y `useProduct`, más un `useKeyedAsync` genérico extraído de `useActiveProducts`/`useProduct` (mismo patrón de "loading derivado" de la slice 2, ahora compartido). La cartela (imagen a sangre + panel de papel con specs punteadas, nota curatorial, precio y selector de cantidad) se construyó con Impeccable, pasó el ciclo de finish review (`fix` → correcciones, incluyendo un bug real que encontré y arreglé yo mismo — ver abajo — → `ship`) y quedó documentada en `DESIGN.md`, incluyendo una regla nueva ("Fixed Paper Rule": la cartela es bone/ink fijo, nunca cambia con el tema). Pasó `/simplify` (4 ángulos): extraje `useKeyedAsync`, `formatPrice` y `assertFromServer` compartidos, colapsé las 4 ramas de `<main>` de `ProductDetailPage` en una, y bajé el estado de `quantity` al propio `QuantitySelector` (ya no fuerza un re-render de toda la página por cada click). Verificado en vivo contra el emulador seedeado: navegación desde la grilla, specs, nota curatorial, reseñas (con y sin), estado "no encontrado", stock agotado, tope de stock en el selector, sin errores de consola en los dos temas.

Decisiones de alcance y de contenido, citadas acá porque el proyecto no lleva comentarios en el código (y ya reflejadas en `DESIGN.md`):
- **F3.3 (reseñas) y F3.4/F3.5 (carrito) dependen de features que no existen todavía** (reviews es la slice 9, carrito la slice 6). Se construyó lo que no depende de ellas: promedio + cantidad de reseñas reales con link a `/products/:id/reviews` (ruta placeholder, mismo patrón que login/account/admin), y el selector de cantidad + botón "Agregar al carrito" correctamente acotados por stock (deshabilitado y con "Sin stock" en 0, tope en el stock disponible), pero el botón todavía no hace nada al clickear — la lógica real de carrito llega en la slice 6.
- **"Línea de para-quién en itálica" + "párrafo de criterio"** (dos elementos separados en el brief de superficie) se unificaron en un solo campo (`curatorialNote`), un párrafo que ya incluye el razonamiento de "para quién sí/no" en la prosa. Simplificación de modelo de contenido, no un olvido.
- **"Número de pieza y fecha de ingreso"** de la cartela: no se construyó. No existe un identificador de pieza estable fuera del índice arbitrario de la grilla (que cambia con el filtro/orden), y ningún criterio de F3 lo pide.
- **La página de detalle tiene dos `<h1>`** (el wordmark de `PublicLayout` y el nombre del producto en la cartela): decisión deliberada, no error — una página de un solo ítem merece su propio heading real en vez de depender solo del wordmark del sitio. Candidato a resolver demoviendo el wordmark a un elemento no-heading la próxima vez que se toque `PublicLayout`; no se hizo ahora porque es un cambio que afecta a todas las páginas públicas, no solo a esta.
- **Bug real encontrado y arreglado durante el finish review**: el selector de cantidad usaba `border-ink dark:border-bone` (el patrón normal de esta app), pero vive dentro de la cartela, que es bone/ink fijo y nunca cambia con el tema — en dark mode el borde quedaba invisible (bone sobre bone). Se arregló con `border-current`, que hereda el color de texto ambiente en vez de asumir el swap de tema de la página.
- **Hallazgo de `/simplify` descartado a propósito**: una revisión sugirió partir el schema de `Product` en `ProductSummary`/`ProductDetail` para que el catálogo no traiga `specs`/`curatorialNote` en cada lectura de listado. No se hizo: Firestore cobra por documento leído, no por campo, así que el costo real hoy es transferencia de red marginal (textos cortos, ~20 productos), no lecturas facturables extra. Partir el tipo tocaría el converter, los dos servicios, el seed y los fixtures de test para un ahorro que no existe a esta escala. Reconsiderar si el catálogo crece mucho o si se agregan campos pesados (medios, descripciones largas) solo para el detalle.

**Slice 5 · Registro, login, logout**, rama `feature/auth-screens`: `User` nuevo en `shared/schemas/user.ts` (`uid`, `email`, `displayName`, `role`, `createdAt`), converter espejo de `product.ts`, y `firestore.rules` abre `users/{uid}` (`create` solo con `role: 'customer'` y el propio uid, `update` con `role` inmutable — F13.4, con tests de reglas nuevos). Capa de servicios: `registerWithEmail`, `loginWithEmail`, `signInWithGoogle`, `requestPasswordReset`, todas devolviendo un `AuthResult` discriminado en vez de tirar excepción (son fallos esperables, no excepcionales). Pantallas construidas con Impeccable sobre `AuthPageLayout` (columna centrada, sin cartela: estas pantallas viven directo sobre el fondo tinta/hueso de la página, no se extendió la Fixed Paper Rule acá) — `LoginForm`, `RegisterForm`, `ForgotPasswordForm` (toggle in-place, sin ruta propia) y `GoogleSignInButton`, todos con `react-hook-form` + `mode: 'onTouched'`. Primitivos nuevos en `components/ui/`: `TextField` (label + hint/error con `aria-describedby` compartido, nunca los dos a la vez) y `Button` (`border-current`, `loadingLabel` configurable). `ProtectedRoute`/`AdminRoute` ganaron "volver al destino original" tras loguearse (F13.1, state de router validado con Zod en `redirectState.ts`, redirect factorizado en `RedirectToLogin`) y `AdminRoute` reemplazó el redirect mudo a `/` por `AccessDeniedState` (F13.2, pantalla nueva con su propio header vía `SiteHeader`, extraído de `PublicLayout` para poder reusarlo). Pasó el ciclo completo de finish review de Impeccable (`recapture` por evidencia vieja del catálogo → capturas correctas → `fix`, 5 hallazgos → `ship`) y `/simplify` (4 ángulos, hallazgos aplicados y descartados detallados abajo). Quedó documentada en `DESIGN.md`. Verificado en vivo contra el emulador seedeado en los dos temas y en mobile: registro, login, Google (vía el widget fake del emulador), logout desde página pública y desde una ruta protegida, recuperación de contraseña (con y sin cuenta existente), el rebote a `/admin` con un customer, y la vuelta al destino original tras loguearse — sin errores de consola.

Dos bugs de carrera reales, encontrados y arreglados durante la verificación en vivo (no los detectó ningún test, los agarró recorrer la app):
- **Login/registro rebotaba de vuelta a `/login`**: el `onSubmit` navegaba apenas el service call resolvía `ok:true`, sin esperar a que el listener de `AuthContext` confirmara `authenticated` — `ProtectedRoute` todavía veía `anonymous` en ese instante y volvía a redirigir. Arreglado desacoplando la navegación del resultado del submit: `useRedirectWhenAuthenticated(to)` (ahora vive dentro de `AuthPageLayout`, no en cada página) observa `auth.status` y navega recién cuando el contexto confirma la sesión.
- **Cerrar sesión desde una ruta protegida terminaba en `/login`, no en el catálogo** (violaba F1.7): `useLogout` esperaba a que `signOut()` resolviera y recién ahí navegaba a `/`, pero mientras tanto `ProtectedRoute` ya había reaccionado al cambio a `anonymous` y redirigido a `/login` primero. Arreglado invirtiendo el orden: `useLogout` navega a `/` (ya autenticado, ninguna guardia lo bloquea) y recién después llama a `auth.logout()`.

Decisiones de alcance y de contenido, citadas acá porque el proyecto no lleva comentarios en el código (y ya reflejadas en `DESIGN.md`):
- **react-hook-form + `@hookform/resolvers/zod`** para este y los próximos formularios (checkout, productos, reviews), decidido explícitamente en el contrato de esta slice en vez de controlados a mano — el proyecto ya lo dejaba evaluable, y con el perfil de performance de Hernán pesó más evitar el re-render por tecla.
- **"Email enumeration protection" no se activó del lado del proyecto de Firebase** (verificado con Context7 que es una config de servidor, no un toggle de consola): en cambio, el mismo resultado se garantiza en el cliente — `loginWithEmail` siempre muestra el mismo mensaje genérico exista o no la cuenta, y `requestPasswordReset` siempre confirma el envío, tragando a propósito el `auth/user-not-found` que el emulador (y probablemente producción) sigue devolviendo. Más robusto que depender de una config externa: funciona igual en el emulador y en producción sin tener que verificarlo dos veces.
- **El registro por email pide "Nombre"** aunque F1.1 no lo pide textualmente, para que el documento de usuario tenga la misma forma que el que produce Google (que sí entrega `displayName`) — F1.4 exige que ambos caminos produzcan el mismo documento.
- **`AccessDeniedState` obtuvo su propio header vía un `SiteHeader` nuevo**, extraído de `PublicLayout`, porque `AdminRoute` la renderiza sin ningún layout ancestro (es una guardia de ruta, no una ruta hija de `PublicLayout`) — sin esto quedaba la única pantalla del sitio sin nav ni wordmark. `PrivateLayout` sigue con su propio header a mano (no con `SiteHeader`): su wordmark es un `<Link>` de vuelta al catálogo (la única salida del área privada), mientras que el de `SiteHeader` es un `<h1>` no clickeable — diferencia real, no descuido. Sí comparten el control de logout (`LogoutButton`, extraído durante `/simplify`).
- **Hallazgos de `/simplify` aplicados**: `LogoutButton` compartido (antes duplicado en `AuthNav`/`PrivateLayout`); `InlineError` compartido (4 copias idénticas del mismo `<p role="alert">`); `loginWithEmail` dejó de retipear strings que ya vivían en `authErrorMessages.ts`; `signInWithGoogle` ahora pasa la lectura de existencia por `assertFromServer` antes de decidir si crea el documento; `registerWithEmail` paraleliza `updateProfile`/`createUserDocument` con `Promise.all` (no dependen entre sí); `ForgotPasswordForm` dejó de repetir el botón "volver a iniciar sesión" en sus dos ramas; el `watch()` del largo de contraseña en `RegisterForm` se aisló en un subcomponente (`RegisterSubmitButton` + `useWatch`) para no re-renderizar el formulario entero por tecla — casualmente esto también hizo desaparecer el warning de React Compiler que `watch()` disparaba; `useRedirectWhenAuthenticated` se centralizó en `AuthPageLayout` en vez de repetirse en cada página; `ProtectedRoute`/`AdminRoute` comparten `RedirectToLogin` en vez de reimplementar el redirect-con-retorno cada uno.
- **Hallazgo descartado a propósito**: una revisión sugirió sacar el `watch()` del password en `RegisterForm` directamente, apoyándose solo en la validación de Zod. No se hizo: F1.3 exige que el botón quede deshabilitado **antes** de intentar enviar, no recién después de un submit fallido — Zod solo dispara al enviar. Se resolvió el costo de performance real (aislar el re-render) sin sacrificar el criterio de aceptación.
- **Renombrar `AuthResult.field` a un tipo `RegisterResult` aparte**: quedó pendiente, no aplicado. Es un matiz de nombres sin impacto funcional (ningún otro consumidor lee ni necesita `field`) y los dos revisores de `/simplify` no coincidieron en si valía la pena — se prioriza el resto de los hallazgos, que sí tenían costo real.

**Slice 4 · Paginación del catálogo** *(extra)*, rama `feature/product-pagination`: `getActiveProducts` pide `PRODUCTS_PAGE_SIZE + 1` documentos (bajado de 24 a 8, para que el catálogo sembrado de 18 productos pagine de verdad) y devuelve `{ products, lastDoc, hasNextPage }` — el documento de más sirve solo para saber si hay página siguiente sin una query de agregación aparte (que Firestore factura extra), y se descarta antes de devolver la página. Acepta un cursor opcional (`QueryDocumentSnapshot`, verificado con Context7 que es la forma recomendada por sobre pasar el valor crudo del campo, que puede saltear resultados si dos documentos empatan). `useActiveProducts(filters, page)` reutiliza `useKeyedAsync` para el estado loading/error/success/retry (mismo patrón que el resto de los hooks del catálogo) y le pasa como `fetcher` una función que resuelve la página pedida contra un cache de páginas ya vistas (`Map<numeroDePagina, ProductsPage>`, en un ref, reiniciado cuando cambia el filtro): volver a una página ya visitada no vuelve a leer Firestore, y un link directo a `?page=N` (recarga, deep link) encadena los fetches necesarios — siempre con `startAfter()`, nunca con un salto de índice (F4.2). `page` vive en la URL (`?page=`), se omite en la página 1, y se resetea al cambiar de categoría o de búsqueda (F4.5). Nuevo `PaginationControls` (Anterior/Siguiente) reutiliza el `Button` de la slice 5 sin agregar nada al sistema visual. Pasó `/simplify` (4 ángulos, ver abajo) y quedó documentada en `DESIGN.md`. Verificado en vivo contra el emulador seedeado: avanzar/retroceder página, recarga en `?page=3` (F4.3), último botón deshabilitado en la última página (F4.4), los dos caminos de consulta paginan (con y sin búsqueda, F4.6), reset de página al cambiar filtro/búsqueda, sin errores de consola en desktop, mobile y los dos temas.

Decisiones y hallazgos de `/simplify`, citados acá porque el proyecto no lleva comentarios en el código:
- **Tamaño de página bajado a 8** (de los 24 originales de la slice 2): con 24, los 18 productos sembrados nunca llegaban a paginar y F4 quedaba sin poder probarse de verdad. 8 da ~3 páginas contra el catálogo actual, suficiente para ejercitar avanzar/deshabilitar en la última.
- **Reconciliar "página en la URL" con paginación por cursor** (tensión real entre F4.2 y F4.3): un link directo a una página posterior camina secuencialmente desde la última página cacheada hasta la pedida, encadenando `startAfter()` en cada salto — nunca un salto de índice — a costa de N lecturas chicas en ese caso puntual. Dado el tamaño real del catálogo (~20-40 productos), el costo es trivial.
- **Bug real encontrado por el agente de altitude durante `/simplify` y arreglado de paso**: pedir una página más allá de la última real hacía que el cursor se reseteara a `undefined` a mitad de la caminata, reiniciando la consulta desde la página 1 pero mostrándola con la etiqueta de la página pedida (ej. "Página 999" mostrando los productos de la página 1, con "Siguiente" habilitado incorrectamente). Se arregló deteniendo la caminata en cuanto una página devuelve `hasNextPage: false`, así una página fuera de rango se clampea a la última página real en vez de reiniciar el recorrido. Test de regresión agregado.
- **`useActiveProducts` pasó a reusar `useKeyedAsync`** en vez de reimplementar a mano el mismo patrón de loading derivado (tag de resultado + comparación de key en el render) que ya existía — encontrado por el agente de reuse, quien notó que las dos copias ya habían empezado a divergir en sus arrays de dependencias.
- **Nuevo `react-hooks/refs` (eslint-plugin-react-hooks 7) prohíbe tocar un ref durante el render**, incluso el patrón "resetear ref cuando cambia una key derivada de props" que las guías viejas de React consideraban seguro. El reset del cache de páginas se movió adentro de la función `fetcher` que le paso a `useKeyedAsync` (que solo corre dentro de su propio efecto), no en el cuerpo del hook.
- **Costo real evitado**: escribir en el buscador estando en la página 2+ antes desperdiciaba lecturas — pedía la página vieja con el filtro nuevo (cache invalidado, camina de la página 1 a la 2 innecesariamente) antes de que la URL se corrigiera a la página 1 un render después. Ahora `CatalogPage` pide la página 1 directamente en cuanto el término de búsqueda tiene un debounce pendiente, sin esperar el round-trip de la URL.
- **Hallazgo descartado a propósito**: una revisión sugirió sacar por completo la caminata secuencial del deep-link y reemplazarla por guardar el cursor codificado en la URL. No se hizo: un `QueryDocumentSnapshot` es un objeto vivo del SDK que no se puede serializar a la URL sin inventar una codificación propia, y el costo real de la caminata (unas pocas lecturas chicas, solo en el caso de un link directo a una página profunda) no lo justifica a esta escala.
- **Sin ronda de finish review dedicada**: `PaginationControls` reutiliza el `Button` ya auditado en la slice 5 sin agregar nada al sistema visual; el detector mecánico de Impeccable no encontró nada y la verificación visual en vivo (dos temas, mobile) confirmó que encaja con las convenciones ya establecidas. Se documentó en `DESIGN.md` igual, para que quede registrado como componente nuevo.

- ✅ Paso 1 · Deploy de humo (PR #1)
- ✅ Paso 2 · Configuración: ESLint, Prettier, Tailwind v4 (PR #2)
- ✅ Paso 3 · CI en GitHub Actions, y registrado como required status check en `main` (PR #3)
- ✅ Paso 4 · Base de datos: Firebase Emulator Suite, `firestore.rules` cerradas, `scripts/seed.ts` (PR #5)
- ✅ Paso 5 · Variables y secrets (hecho vía `scripts/setup-infra.sh`)
- ✅ Paso 6 · Autenticación (cimiento): init de Firebase, `AuthContext`, `ProtectedRoute`/`AdminRoute` (PR #8)
- ✅ Paso 7 · Tres layouts base (`PublicLayout`, `PrivateLayout`, `AdminLayout`) con sus guards y el router real (PR #10)
- ✅ Paso 8 · Lista de slices (`docs/spec.md`, sección 6)
- ✅ Paso 9 · Verificación conjunta: producción responde (`/`, `/api/health`, deep link a `/account`), CI en verde, emulador con seed, los tres layouts probados con Chrome DevTools

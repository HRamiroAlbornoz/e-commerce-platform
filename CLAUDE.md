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
| React Router | v7. Se importa de `react-router`; `RouterProvider` viene de `react-router/dom`. **No** se usa `react-router-dom` |
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

Etapa 2 (Andamiaje) del flujo de `~/.claude/flujo-desarrollo.md`, en curso.

- ✅ Paso 1 · Deploy de humo (PR #1)
- ✅ Paso 2 · Configuración: ESLint, Prettier, Tailwind v4 (PR #2)
- ✅ Paso 3 · CI en GitHub Actions, y registrado como required status check en `main` (PR #3)
- 🔄 Paso 4 · Base de datos: Firebase Emulator Suite, `firestore.rules` cerradas, `scripts/seed.ts` (en curso)
- ✅ Paso 5 · Variables y secrets (hecho vía `scripts/setup-infra.sh`)
- ⬜ Paso 6 · Autenticación (cimiento): init de Firebase, `AuthContext`, `ProtectedRoute`/`AdminRoute`
- ⬜ Paso 7 · Tres layouts base, uno por superficie, con su guard declarado una sola vez
- ✅ Paso 8 · Lista de slices (`docs/spec.md`, sección 6)
- ⬜ Paso 9 · Verificación conjunta de humo + CI + base + los tres layouts

# Contexto del proyecto

E-commerce de periféricos gaming con dos roles (customer / admin). SPA en React + TypeScript,
Firebase como backend de autenticación y datos, AWS S3 para imágenes mediante presigned URLs
generadas por Vercel Functions, y Vercel para el deploy.

Este archivo complementa a `~/.claude/CLAUDE.md`; no lo reemplaza. Solo registra lo que es
específico de este proyecto. El historial de cada slice está en `docs/bitacora.md`.

## Excepción a las reglas globales

**El código de este proyecto no lleva comentarios.** Es la única regla que se aparta del
`CLAUDE.md` global, que pide comentarios en español en las funciones no obvias.

- Los nombres cargan todo el peso. Sin un comentario que rescate un nombre flojo, las funciones se
  parten antes: partir es la única herramienta que queda para explicar.
- No se usan type assertions (`as Tipo`). Si aparece una realmente inevitable, la justificación va
  al ADR o a la descripción del PR.
- La documentación **no** está afectada: `README.md`, `docs/spec.md`, `docs/arquitectura.md` y los
  ADRs se escriben completos.

## El logger, con su condición

No se usa pino ni winston todavía: no hay un servidor de larga vida, solo Vercel Functions, donde
pino suma peso de bundle y arranque en frío sin aportar lo que lo hace valioso, porque Vercel ya
captura y agrupa la salida estándar. Se emite JSON con `timestamp`, `level`, `requestId`, `code` y
`message`. Lo prohibido es el `console.log` suelto con mensaje vago.

**La condición:** el día que el proyecto tenga un backend propio de larga vida, entra pino.

## Vulnerabilidades de npm audit — excepción monitoreada

`npm audit` reporta 13 (10 moderadas, 3 altas), todas transitivas de `@vercel/node@13.0.0` (la
última publicada) y de `firebase-tools`. **No se aplica el `audit fix --force`**, que bajaría
`@vercel/node` 9 versiones mayores y `firebase-tools` 5. Motivos:

- `@vercel/node` se importa solo como `import type`: su código nunca corre en la función desplegada.
- `firebase-tools` corre solo en la máquina de desarrollo y en el CI, con input controlado (el
  emulador y la cuenta propia de Google), nunca con un tercero no confiable.

Revisar cuando Vercel o Firebase publiquen versiones con esas dependencias actualizadas, o antes
del próximo Cierre.

## Datos operativos

| Dato | Valor |
|---|---|
| Repositorio remoto | https://github.com/HRamiroAlbornoz/e-commerce-platform |
| Estrategia de ramas | Una rama por feature desde `main` actualizado (`git switch main && git pull` antes de `git switch -c`). Tope de tres slices por rama |
| Merge | Siempre por pull request desde la interfaz de GitHub, con CI en verde. Nunca merge local. **Squash and merge** |
| Formato de commits | Conventional commits en inglés imperativo: `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:` |
| Deploy | Vercel, integración continua desde GitHub. Preview por rama, producción en el merge a `main` |
| Protección de deploys | Vercel Authentication activa **solo en previews**. Producción es pública, sin login (F15.1) |
| URL de producción | https://clack-liart.vercel.app |
| Terminal | Git Bash (MINGW64). Los comandos de git que escriben historial o tocan el remoto los ejecuta Hernán |
| Protección de `main` | CI (`test`) y el deploy de Vercel (`Vercel`) como required status checks, sin push directo |

## Comandos de npm

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo de Vite (:5173) |
| `npm run build` | `tsc -b` + `vite build` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run lint` / `lint:fix` | ESLint sobre todo el repo |
| `npm run format` / `format:check` | Prettier (`format:check` corre en CI) |
| `npm run typecheck` | `src/`, `api/` (NodeNext), `shared/`, `scripts/` y `tests/` |
| `npm test` / `test:watch` | Vitest: componentes, hooks, servicios y schemas |
| `npm run test:functions` | Tests de las Vercel Functions contra el emulador real |
| `npm run test:rules` | Tests de security rules contra el emulador real |
| `npm run seed` | Carga el catálogo de 18 productos en el emulador |
| `npm run seed:production` | Carga el catálogo en el proyecto real. Aborta si `products` ya tiene documentos |
| `npm run deploy:rules` | Despliega `firestore.rules` e índices al proyecto real |
| `npm run grant-admin -- <email>` | Asigna el rol admin (Firestore + custom claim) |

## Stack fijado

Las versiones están decididas y no se cambian sin un motivo explícito.

| Pieza | Versión / nota |
|---|---|
| React | 19 |
| TypeScript | **Pineado a `<6.1.0`**: `typescript-eslint` todavía no soporta 7.x. `strict`, más `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`. Los `paths` de `tsconfig.app.json` son relativos, sin `baseUrl` |
| ESLint | **Pineado a `<10.0.0`**: `eslint-plugin-jsx-a11y` todavía no soporta ESLint 10 |
| Vite | 8. Build tool y dev server |
| Tailwind CSS | v4, CSS-first con `@import "tailwindcss"` y `@theme`. **No** hay `tailwind.config.js` |
| React Router | **v8**. Se importa de `react-router`; `RouterProvider` de `react-router/dom`. **No** se usa `react-router-dom` |
| Estado global | Context API + useReducer. Dos contextos separados: autenticación y carrito |
| Backend de datos | Firebase Auth + Firestore |
| Serverless | Vercel Functions en `api/`, tipadas con `@vercel/node` |
| Imágenes | AWS S3 con presigned URLs. Las credenciales de AWS viven solo en la Vercel Function |
| Testing | Vitest + React Testing Library, más `@firebase/rules-unit-testing` |
| Validación | Zod. Los tipos se derivan con `z.infer`, nunca se duplican |

## Decisiones que se consultan seguido

- **El rol del usuario** vive en `users/{uid}.role` en Firestore como fuente de verdad, y se espeja
  a un **custom claim**. Las security rules leen `request.auth.token.role` (sin costo de lecturas;
  un `get()` dentro de una regla sí se factura).
- **El rol se asigna con un script local de operador**, no con un endpoint HTTP.
- **La ausencia del claim es el default seguro**: un usuario sin claim nunca es administrador.
- **El carrito** admite invitados: vive en `localStorage` validado con Zod y se fusiona con el de
  Firestore al iniciar sesión (la cantidad mayor gana, nunca la suma).
- **Las órdenes guardan un snapshot** del producto (nombre, precio, imagen). Un cambio de precio no
  muta una orden pasada.
- **Idioma:** español neutro, sin voseo ni modismos regionales (tuteo: "Intenta", "tienes").

El detalle y las alternativas descartadas están en `docs/adr/`.

## Dónde está qué

| Archivo | Contenido |
|---|---|
| `docs/spec.md` | Alcance, criterios de aceptación F1–F15 y flujos reales del recorrido |
| `docs/arquitectura.md` | Entidades del dominio y vocabulario |
| `docs/adr/` | Una decisión cara de revertir por archivo. No se editan: si cambia la decisión, se escribe un ADR nuevo |
| `docs/pendientes.md` | Deuda técnica clasificada en el Cierre |
| `docs/bitacora.md` | Historial slice por slice y del Cierre. Referencia, no se carga por defecto |
| `DESIGN.md` | Sistema visual global. Lo gestiona Impeccable |
| `.impeccable/surfaces/` | Un brief por superficie (pública, privada de usuario, administración) |
| `shared/schemas/` | Contrato Zod único, importado por `src/` y por `api/` |
| `firebase.json` / `.firebaserc` | Emulador (Firestore :8080, Auth :9099) y proyecto real `clack-add2a` |
| `firestore.rules` | Arranca cerrada y cada slice abre solo lo que necesita. Tiene que estar desplegada al proyecto real (`npm run deploy:rules`) |
| `scripts/` | `seed.ts` (emulador), `seedProduction.ts` (proyecto real), `catalogSeedData.ts` (datos compartidos), `grant-admin.ts` |
| `tests/rules/` | Tests de security rules |
| `.vercelignore` | Excluye `api/**/*.test.ts` del deployment (límite de 12 Functions en el plan Hobby) |

## Herramientas de sesión

- **Plugin `firestore-native`**: encendido mientras dure el proyecto.
- **MCP de Vercel**: logs de runtime cuando falla un deploy.
- **MCP de chrome-devtools**: capturas de referencia, consola, red, performance y accesibilidad en
  el recorrido del Cierre.
- **Context7**: se consulta por iniciativa propia antes de afirmar algo sobre una librería del stack.

## Estado

**Release 1 cerrado el 2026-09-22.** Las 14 slices del plan original y los 3 extras (paginación,
reseñas, analytics) están en producción. Cierre completo (PR #29 y #30), limpieza de `.gitkeep`
(PR #31). No hay trabajo planeado pendiente; el próximo paso lo decide Hernán.

Detalle de cada slice y del Cierre en `docs/bitacora.md`.

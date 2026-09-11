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

## Datos operativos

| Dato | Valor |
|---|---|
| Repositorio remoto | https://github.com/HRamiroAlbornoz/e-commerce-platform |
| Repo local | Inicializado, rama `main` |
| Estrategia de ramas | Una rama por feature desde `main`, con las slices adentro. Tope de tres slices por rama |
| Merge | Siempre por pull request desde la interfaz de GitHub, con CI en verde. Nunca merge local |
| Formato de commits | Conventional commits en inglés imperativo: `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:` |
| Deploy | Vercel, con integración continua desde GitHub. Preview por rama, producción en el merge a `main` |
| Terminal | Git Bash (MINGW64). Los comandos de git que escriben historial o tocan el remoto los ejecuta Hernán |

## Stack fijado

Las versiones están decididas y no se cambian sin un motivo explícito.

| Pieza | Versión / nota |
|---|---|
| React | 19 |
| TypeScript | `strict: true`, más `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes` |
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
| `scripts/` | `seed.ts` para el catálogo de desarrollo, `grant-admin.ts` para asignar el rol admin |

## Herramientas de sesión

- **Plugin `firestore-native`**: encendido mientras dure el proyecto.
- **MCP de Vercel**: logs de runtime y errores agrupados cuando falla un deploy.
- **MCP de chrome-devtools**: capturas de referencia en la etapa de diseño, y consola, red,
  performance y accesibilidad en el recorrido del Cierre.
- **Context7**: se consulta por iniciativa propia antes de afirmar algo sobre una librería del
  stack.

## Estado

Etapa 1 (Planificación) del flujo de `~/.claude/flujo-desarrollo.md`. Todavía no hay código de
aplicación ni `package.json`: la regla transversal del flujo es que no se escribe código hasta que
exista `docs/spec.md` con criterios de aceptación. Los comandos de npm se agregan a este archivo
cuando el andamiaje los cree.

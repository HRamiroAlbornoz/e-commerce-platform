# 0009 · Context API y useReducer para el estado global

Reemplaza a [0002](0002-context-api-y-usereducer-para-el-carrito.md).

## Contexto

El estado global de la aplicación son dos cosas: la sesión del usuario y el carrito. El carrito es
el más complejo: agregar, quitar, cambiar cantidades, vaciar y fusionar el carrito de invitado con
el del usuario al iniciar sesión. Lo consumen el header, la grilla, el detalle de producto, el
carrito y el checkout.

En 2026 el default de la industria para este caso sería Zustand para el estado de cliente y
TanStack Query para el estado del servidor. Este ADR registra por qué no se usan, y reemplaza al
0002, que atribuía la decisión a un requisito externo. El motivo vigente es técnico.

## Decisión

Estado global con **Context API + useReducer**, en **dos contextos separados**: uno de
autenticación y uno de carrito.

El `cartReducer` es una función pura: dado el mismo estado y la misma acción, devuelve siempre el
mismo resultado. La persistencia —`localStorage` para el invitado, Firestore para el usuario
autenticado— es un efecto que vive en el provider, **nunca dentro del reducer**.

El catálogo y las órdenes no viven en ningún contexto. Cada pantalla los pide a la capa de
servicios a través de hooks propios (`useKeyedAsync` y hooks por consulta).

## Motivo

- **El estado compartido es chico.** Dos contextos con pocas acciones cubren la necesidad. Una
  librería de estado agrega una dependencia para resolver algo que el proyecto no tiene.
- **El reducer se testea sin React.** Una aserción por acción, sin mocks. Es donde conviene invertir
  los tests primero.
- **No hay caché de servidor compartida entre pantallas.** Cada pantalla pide lo que muestra, y los
  datos que cambian en vivo se resuelven en su propio hook.

## Alternativas descartadas

**Zustand.** Menos código repetido, sin envolver el árbol en providers, y re-renderizados más finos
por selector. Queda descartado porque el estado global tiene dos contextos y un reducer; agregar la
librería no compra nada que hoy falte. Se reevalúa si aparece estado compartido que necesite
suscripciones selectivas.

**TanStack Query para productos y órdenes.** Resolvería caché, revalidación y los tres estados de
carga de forma más limpia que hacerlo a mano. Queda descartado por ahora. Es la deuda más grande de
esta decisión: sin caché, cada pantalla que muestra productos vuelve a pedirlos. Se reevalúa si el
catálogo crece o si una mutación en una pantalla necesita invalidar datos de otra.

**Un solo contexto para sesión y carrito.** Cualquier cambio de sesión re-renderizaría a todos los
consumidores del carrito, y al revés. Además, los tests de cada uno quedarían dependientes del otro.

**useState en vez de useReducer.** Con cinco acciones distintas sobre una estructura anidada
(ítems con cantidades), `useState` dispersaría la lógica de transición por todos los componentes que
la disparan. El reducer la concentra en un lugar.

## Consecuencias

- El reducer es el componente más testeable del proyecto.
- Context notifica a todos sus consumidores ante cualquier cambio. Si el rendimiento se degrada, se
  parte el contexto en estado y acciones, pero solo con una medición que lo respalde.
- Sin caché de servidor, la compensación está en la capa de servicios, no en el estado global.
- La persistencia fuera del reducer obliga a un detalle fácil de olvidar: el reducer no sabe si el
  usuario está autenticado, así que el provider decide dónde escribir.

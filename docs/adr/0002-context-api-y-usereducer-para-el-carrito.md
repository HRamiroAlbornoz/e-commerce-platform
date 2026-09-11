# 0002 · Context API y useReducer para el estado global

## Contexto

El carrito es el estado global más complejo de la aplicación: agregar, eliminar, cambiar cantidad,
vaciar, y fusionar el carrito de invitado con el del usuario al iniciar sesión. Ese estado lo
consumen el header, la grilla de productos, el detalle, el carrito y el checkout.

En 2026 el default de la industria para esto sería Zustand para el estado de cliente y TanStack
Query para el estado del servidor. Elegir Context API y useReducer es apartarse de ese default, y
la razón no está en el código: **es una restricción del enunciado del proyecto**, que pide
explícitamente esa combinación. Sin este registro, cualquier lector razonable asumiría que fue
desconocimiento.

## Decisión

Estado global con **Context API + useReducer**, en **dos contextos separados**: uno de
autenticación y uno de carrito.

El `cartReducer` es una función pura: dado el mismo estado y la misma acción, devuelve siempre el
mismo resultado. La persistencia —`localStorage` para el invitado, Firestore para el usuario
autenticado— es un efecto que vive en el provider, **nunca dentro del reducer**.

## Alternativas descartadas

**Zustand.** Menos código repetido, sin necesidad de envolver el árbol en providers, y
re-renderizados más finos por selector. Descartado porque el enunciado exige Context + useReducer.
Si la restricción no existiera, sería la opción por defecto para este caso.

**TanStack Query para los productos y las órdenes.** Resolvería cache, revalidación y los tres
estados de carga de forma mucho más limpia que hacerlo a mano. Misma razón: queda fuera por la
restricción del enunciado. Es la deuda más grande que deja esta decisión.

**Un solo contexto para sesión y carrito.** Descartado con motivo propio, no por el enunciado:
mezclar las dos responsabilidades hace que cualquier cambio de sesión re-renderice a todos los
consumidores del carrito y al revés, y vuelve los tests de cada uno dependientes del otro.

**useState en vez de useReducer.** Con cinco acciones distintas sobre una estructura anidada
(items con cantidades), `useState` disperaría la lógica de transición por todos los componentes que
la disparan. El reducer la concentra en un solo lugar y, al ser puro, se testea sin montar React.

## Consecuencias

- **El reducer es el componente más testeable del proyecto**: una aserción por acción, sin mocks y
  sin renderizar nada. Es donde conviene invertir primero en tests.
- **Hace falta cuidar los re-renderizados a mano.** Context notifica a todos sus consumidores ante
  cualquier cambio. Si el rendimiento se degrada, se parte el contexto en estado y acciones (las
  acciones son estables y no necesitan re-renderizar), pero solo con una medición que lo respalde.
- **Sin cache de servidor**, cada pantalla que necesita productos los vuelve a pedir. Se compensa
  con la capa de servicios, no con estado global: el catálogo no vive en el Context.
- La persistencia fuera del reducer obliga a un detalle fácil de olvidar: el reducer no sabe si el
  usuario está autenticado, así que el provider decide dónde escribir.

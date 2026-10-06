# 0011 · Carrito de invitado en localStorage con fusión al iniciar sesión

Reemplaza a [0004](0004-carrito-de-invitado-con-merge-al-iniciar-sesion.md).

## Contexto

Hay una decisión de producto que hay que tomar antes que la técnica: **¿se puede agregar al carrito
sin tener cuenta?**

Si la respuesta es no, el carrito siempre vive en Firestore bajo el `uid` y el problema desaparece.
Si es sí, aparece el caso que define esta decisión: el visitante arma un carrito sin sesión, se
registra, y hay dos carritos que tienen que volverse uno.

## Decisión

Se puede agregar al carrito **sin sesión**. El carrito de invitado vive en `localStorage`, y al
iniciar sesión se **fusiona** con el carrito de Firestore del usuario.

`localStorage` se lee **siempre con `safeParse` de Zod**, y si la validación falla se vuelve a un
carrito vacío. El dato lo escribió nuestra propia aplicación, pero puede tener el esquema de una
versión anterior, estar corrupto, o haber sido editado a mano desde las herramientas de desarrollo.

Reglas de la fusión, decididas acá para que no se improvisen en el código:

- Un producto que está en los dos carritos queda con la **cantidad mayor**, no con la suma. Sumar
  convierte "lo agregué dos veces desde dos lugares" en "quiero cuatro".
- Un producto que ya no está activo o se quedó sin stock **no entra**, y se le dice al usuario cuál
  quedó afuera y por qué.
- El carrito fusionado se escribe en Firestore y el de `localStorage` se borra. Firestore pasa a
  ser la única fuente de verdad mientras haya sesión.

## Motivo

Obligar a registrarse antes de armar un carrito es una de las causas conocidas de abandono. Además,
elimina el flujo de invitado, que es el caso de uso más frecuente de una tienda que se visita por
primera vez.

## Alternativas descartadas

**Requerir sesión para agregar al carrito.** Bastante menos código y ningún problema de fusión.
Queda descartado por la experiencia de uso descrita arriba.

**Carrito solo en memoria, en el Context.** Se pierde al recargar la página, y recargar a mitad de
una compra no es un caso raro.

**Sumar las cantidades al fusionar.** Produce cantidades que el usuario no pidió, y en una compra
eso es un error que cuesta dinero.

**Preguntarle al usuario qué carrito conservar.** Un diálogo de resolución de conflictos en el
momento de iniciar sesión interrumpe justo cuando la persona quería avanzar, para un problema que
una regla clara resuelve sin preguntar.

## Consecuencias

- Existen **tres lugares donde puede vivir el carrito**: el Context (en memoria), `localStorage`
  (invitado) y Firestore (con sesión). El provider decide dónde escribir; el reducer no lo sabe y no
  debe saberlo.
- **El carrito muestra el precio de hoy**, porque los ítems guardan solo `productId` y cantidad, y el
  nombre y el precio se resuelven contra el catálogo. Si el precio cambia entre que el usuario mira
  el carrito y confirma, hay que avisarle antes de cobrar.
- La fusión es un **punto de fallo nuevo** en el momento más sensible del flujo. Si falla, el usuario
  no pierde su carrito de invitado: `localStorage` se borra recién cuando la escritura en Firestore
  confirmó.
- Un producto en el carrito **no está reservado**. Dos personas pueden tener la última unidad en su
  carrito y solo una va a poder comprarla; el stock se descuenta al confirmar, no al agregar.

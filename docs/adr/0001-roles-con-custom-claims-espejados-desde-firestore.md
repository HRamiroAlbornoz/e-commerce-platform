# 0001 · Roles con custom claims espejados desde Firestore

## Contexto

La aplicación tiene dos roles, `customer` y `admin`, y las security rules de Firestore tienen que
validarlos del lado del servidor: una validación que solo vive en el frontend se saltea
manipulando el estado del navegador.

Firebase Authentication no provee el rol. Hay que guardarlo en algún lado y hacer que las reglas
lo puedan leer. La documentación de Firebase es explícita en un punto que decide esta cuestión:
**cada `get()` o `exists()` dentro de una security rule se factura como una lectura**. El panel de
administración evalúa reglas en cada operación, así que ese costo se paga permanentemente y crece
con el uso.

## Decisión

El documento `users/{uid}` en Firestore es la **fuente de verdad** del rol, y ese valor se
**espeja a un custom claim** del ID token de Firebase Auth.

Las security rules leen `request.auth.token.role`, que viene dentro del token que acompaña cada
request: **no cuesta ninguna lectura**. El documento de Firestore existe para que la aplicación
pueda mostrar y auditar el rol, no para que las reglas lo consulten.

El claim se asigna con un **script local de operador** (`scripts/grant-admin.ts`) que usa el Admin
SDK, no con un endpoint HTTP. Al registrarse, un usuario obtiene `role: 'customer'` en su documento
y **ningún claim**: como las reglas comparan contra `'admin'`, la ausencia del claim es el default
seguro.

## Alternativas descartadas

**Solo Firestore, con `get()` en las reglas.** Es lo que propone la guía del proyecto y es más
simple: no hace falta service account ni script. Se descartó por el costo: cada evaluación de regla
suma una lectura facturada, y en el panel de administración eso es una lectura extra por cada
operación, permanentemente, solo para preguntar "¿este usuario es admin?".

**Un endpoint HTTP que asigne el rol.** Descartado por seguridad. Un endpoint que otorga
privilegios es superficie de ataque para escalación, y un cambio de rol es una operación rara y
privilegiada que no necesita estar expuesta a internet.

**Solo custom claims, sin documento en Firestore.** Descartado porque los claims no se pueden
consultar ni listar desde el cliente: no habría forma de mostrar "estos son los administradores"
ni de auditar quién tiene qué rol sin recorrer todos los usuarios con el Admin SDK.

## Consecuencias

- Las reglas quedan más simples y más baratas: una comparación contra un campo del token.
- Aparece una dependencia nueva: las credenciales del Admin SDK, que viven como variables de
  entorno en Vercel y nunca como archivo en el repositorio.
- **Los dos lugares se pueden desincronizar.** El documento y el claim son dos copias del mismo
  dato. El script es el único camino que escribe las dos, y las reglas impiden que el cliente
  modifique el campo `role` del documento.
- **El claim no llega al cliente al instante.** Se propaga cuando el ID token se refresca: al
  iniciar sesión, al vencer el token, o forzándolo con `getIdToken(true)`. Si un rol cambia con la
  sesión abierta, hay que forzar el refresh o el usuario sigue operando con el rol anterior hasta
  que su token venza.
- Promover a un administrador requiere acceso a la máquina con las credenciales. Es deliberado: es
  una operación de operador, no de aplicación.

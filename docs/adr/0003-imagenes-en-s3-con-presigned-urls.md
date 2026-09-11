# 0003 · Imágenes en AWS S3 con presigned URLs

## Contexto

El administrador sube imágenes de producto. La aplicación ya usa Firebase, que incluye Firebase
Storage: un lector razonable va a preguntarse por qué el proyecto agrega un segundo proveedor de
nube para algo que el primero ya resuelve. La respuesta corta es que el enunciado del proyecto lo
pide; la respuesta larga es lo que este documento registra, porque la decisión de **cómo** subir a
S3 sí es nuestra y es la parte que importa.

Subir a S3 desde el navegador exige credenciales de AWS. Las credenciales de AWS en el frontend
son credenciales públicas: cualquiera abre las herramientas de desarrollador, las copia, y opera
sobre el bucket con los permisos del usuario IAM.

## Decisión

El frontend **nunca** habla directamente con AWS usando credenciales. El flujo es:

1. El frontend pide una URL de subida a una **Vercel Function**.
2. La function **verifica el ID token de Firebase** con el Admin SDK y **exige el claim de
   administrador**. Valida el tipo de archivo y el tamaño, y genera la clave del objeto con un UUID.
3. La function firma una **presigned URL** con las credenciales de AWS, que solo existen en su
   entorno, y la devuelve.
4. El navegador sube el archivo **directamente a S3** usando esa URL temporal.

El bucket no tiene acceso público de escritura: `PUT` solo es posible con una URL firmada. La
lectura pública se limita al prefijo de imágenes de producto, y CORS se restringe a los dominios de
Vercel.

La autenticación de la function **no la pide el enunciado**. Se agrega porque sin ella el endpoint
firma URLs de subida para cualquiera que lo llame, y eso convierte el bucket en almacenamiento
gratuito para desconocidos.

## Alternativas descartadas

**Firebase Storage.** Sería la opción coherente con el resto del stack: mismo SDK, misma sesión,
mismas reglas de seguridad, y sin un segundo proveedor ni credenciales extra. Queda fuera por la
restricción del enunciado, no por mérito técnico. Si esto fuera un proyecto propio sin esa
restricción, Firebase Storage sería la elección correcta.

**Subir el archivo a través de la Vercel Function.** El navegador manda el archivo a la function y
la function lo reenvía a S3. Descartado: el archivo atraviesa la function, consumiendo su memoria y
su tiempo de ejecución, y choca con los límites de tamaño de cuerpo de una función serverless. La
presigned URL hace que el archivo viaje del navegador a S3 sin intermediarios.

**Credenciales de AWS en el frontend con un usuario IAM de permisos mínimos.** Descartado sin
discusión: un secreto en el navegador no es un secreto, y "permisos mínimos" sigue siendo permiso
de escritura sobre el bucket para cualquiera.

## Consecuencias

- Las credenciales de AWS existen en un solo lugar: las variables de entorno de la Vercel Function,
  sin el prefijo `VITE_`, de modo que el bundle del frontend no las puede incluir ni por accidente.
- Hay **dos proveedores de nube** que configurar, documentar y mantener. Es el costo real de la
  restricción y el README tiene que explicar los dos.
- La URL firmada **vence**. Si el usuario tarda más que su vigencia, la subida falla y hay que
  pedir una nueva: es un estado de error que la interfaz tiene que manejar, no un caso raro.
- El flujo tiene **dos pasos que pueden fallar por separado** (pedir la URL, y subir con ella), así
  que el mensaje de error tiene que distinguirlos o el administrador no sabe qué reintentar.
- Cada subida consume una solicitud `PUT` de la capa gratuita de AWS, que da 2.000 por mes. Alcanza
  de sobra para este proyecto, pero no para pruebas masivas.

import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { productInputSchema, toNameLower, type ProductInput } from '../shared/schemas/product.js';

type CatalogEntry = Omit<ProductInput, 'nameLower'>;

const catalog: CatalogEntry[] = [
  {
    name: 'Teclado mecanico RGB Aurora TKL',
    description: 'Teclado mecanico TKL con switches lineales e iluminacion RGB por tecla.',
    price: 89999,
    stock: 40,
    category: 'keyboard',
    displayColor: 'lime',
    imageUrl: 'https://placehold.co/600x400?text=Aurora+TKL',
    isActive: true,
    specs: [
      { label: 'Switches', value: 'Lineales rojos' },
      { label: 'Formato', value: 'TKL (87 teclas)' },
      { label: 'Conexion', value: 'USB-C desmontable' },
      { label: 'Iluminacion', value: 'RGB por tecla' },
    ],
    curatorialNote:
      'Lo probamos dos semanas escribiendo largo y jugando shooters: los switches lineales no cansan el dedo en sesiones de horas. No es para quien busca el clack tactil de un switch marron.',
  },
  {
    name: 'Teclado mecanico wireless Nimbus 65%',
    description: 'Teclado compacto 65% con conexion inalambrica de baja latencia.',
    price: 124999,
    stock: 25,
    category: 'keyboard',
    displayColor: 'magenta',
    imageUrl: 'https://placehold.co/600x400?text=Nimbus+65',
    isActive: true,
    specs: [
      { label: 'Switches', value: 'Tactiles marrones' },
      { label: 'Formato', value: '65% (68 teclas)' },
      { label: 'Conexion', value: 'Bluetooth 5.0 / 2.4GHz' },
      { label: 'Bateria', value: 'Hasta 40 horas' },
    ],
    curatorialNote:
      'El formato 65% libera escritorio sin sacrificar las flechas. Quedate con el Vertex si preferis low-profile; este es para quien quiere el click clasico en un cuerpo chico.',
  },
  {
    name: 'Teclado mecanico low-profile Vertex',
    description: 'Perfil bajo con switches tactiles, ideal para sesiones largas.',
    price: 99999,
    stock: 30,
    category: 'keyboard',
    displayColor: 'cyan',
    imageUrl: 'https://placehold.co/600x400?text=Vertex',
    isActive: true,
    specs: [
      { label: 'Switches', value: 'Tactiles low-profile' },
      { label: 'Formato', value: 'TKL (87 teclas)' },
      { label: 'Conexion', value: 'USB-C' },
      { label: 'Altura', value: '22mm' },
    ],
    curatorialNote:
      'Nueve horas de oficina y despues una partida no deberian cansar la muñeca de la misma forma. Este es el que recomendamos para eso, no para quien busca el recorrido largo de un switch tradicional.',
  },
  {
    name: 'Mouse gamer inalambrico Vector Pro',
    description: 'Sensor optico de alta precision y bateria de larga duracion.',
    price: 54999,
    stock: 60,
    category: 'mouse',
    displayColor: 'amber',
    imageUrl: 'https://placehold.co/600x400?text=Vector+Pro',
    isActive: true,
    specs: [
      { label: 'Sensor', value: 'Optico 26000 DPI' },
      { label: 'Conexion', value: 'Inalambrico 2.4GHz' },
      { label: 'Peso', value: '79g' },
      { label: 'Bateria', value: 'Hasta 70 horas' },
    ],
    curatorialNote:
      'El peso justo para mover la muñeca, no el brazo entero. Si necesitas doce botones programables para MMO, este no es el tuyo: mira el Titan.',
  },
  {
    name: 'Mouse optico ultraliviano Comet',
    description: 'Carcasa perforada de menos de 60 gramos para movimientos rapidos.',
    price: 39999,
    stock: 80,
    category: 'mouse',
    displayColor: 'lime',
    imageUrl: 'https://placehold.co/600x400?text=Comet',
    isActive: true,
    specs: [
      { label: 'Sensor', value: 'Optico 16000 DPI' },
      { label: 'Conexion', value: 'USB con cable' },
      { label: 'Peso', value: '58g' },
      { label: 'Carcasa', value: 'Perforada' },
    ],
    curatorialNote:
      'Menos de 60 gramos porque en un shooter competitivo cada gramo se siente. La carcasa perforada no es para quien juega con las manos sudadas y sin guantes.',
  },
  {
    name: 'Mouse ergonomico Titan MMO',
    description: 'Doce botones programables laterales, pensado para juegos MMO.',
    price: 69999,
    stock: 35,
    category: 'mouse',
    displayColor: 'magenta',
    imageUrl: 'https://placehold.co/600x400?text=Titan+MMO',
    isActive: true,
    specs: [
      { label: 'Sensor', value: 'Optico 19000 DPI' },
      { label: 'Botones programables', value: '12 laterales' },
      { label: 'Conexion', value: 'USB con cable' },
      { label: 'Peso', value: '132g' },
    ],
    curatorialNote:
      'Doce botones al alcance del pulgar cambian un MMO entero. Es pesado a proposito, para apoyar la mano, no para levantarlo en un flick shot.',
  },
  {
    name: 'Headset gamer 7.1 surround Pulsar',
    description: 'Sonido envolvente virtual 7.1 con microfono retractil.',
    price: 79999,
    stock: 45,
    category: 'headset',
    displayColor: 'cyan',
    imageUrl: 'https://placehold.co/600x400?text=Pulsar',
    isActive: true,
    specs: [
      { label: 'Sonido', value: '7.1 virtual' },
      { label: 'Microfono', value: 'Retractil con cancelacion de ruido' },
      { label: 'Conexion', value: 'USB' },
      { label: 'Almohadillas', value: 'Espuma viscoelastica' },
    ],
    curatorialNote:
      'El surround virtual ayuda de verdad a ubicar pasos en un shooter competitivo. Si buscas algo liviano para usar todo el dia, elegi el Aether.',
  },
  {
    name: 'Headset inalambrico Aether Wireless',
    description: 'Conexion 2.4GHz de baja latencia y hasta 20 horas de bateria.',
    price: 109999,
    stock: 20,
    category: 'headset',
    displayColor: 'amber',
    imageUrl: 'https://placehold.co/600x400?text=Aether',
    isActive: true,
    specs: [
      { label: 'Sonido', value: 'Estereo' },
      { label: 'Microfono', value: 'Desmontable' },
      { label: 'Conexion', value: '2.4GHz de baja latencia' },
      { label: 'Bateria', value: 'Hasta 20 horas' },
    ],
    curatorialNote:
      'Sin cables y sin el retardo que arruina el timing en un ritmo. Le falta el surround del Pulsar, y esta bien: no todos lo necesitan.',
  },
  {
    name: 'Headset con cancelacion de ruido Nova ANC',
    description: 'Cancelacion activa de ruido para concentrarse en partidas competitivas.',
    price: 134999,
    stock: 15,
    category: 'headset',
    displayColor: 'lime',
    imageUrl: 'https://placehold.co/600x400?text=Nova+ANC',
    isActive: true,
    specs: [
      { label: 'Sonido', value: 'Estereo con ANC' },
      { label: 'Microfono', value: 'Retractil' },
      { label: 'Conexion', value: 'Bluetooth y USB' },
      { label: 'Bateria', value: 'Hasta 25 horas' },
    ],
    curatorialNote:
      'La cancelacion activa vale la pena en una casa con ruido. Si tu prioridad es la localizacion de sonido en competitivo, el Pulsar te va a rendir mas.',
  },
  {
    name: 'Monitor gamer 27" 165Hz Horizon',
    description: 'Panel IPS de 27 pulgadas, 165Hz y 1ms de respuesta.',
    price: 349999,
    stock: 12,
    category: 'monitor',
    displayColor: 'magenta',
    imageUrl: 'https://placehold.co/600x400?text=Horizon+27',
    isActive: true,
    specs: [
      { label: 'Panel', value: 'IPS' },
      { label: 'Resolucion', value: '2560x1440' },
      { label: 'Refresco', value: '165Hz' },
      { label: 'Respuesta', value: '1ms' },
    ],
    curatorialNote:
      'El punto medio entre color fiel y velocidad. Si tu prioridad es el espacio de pantalla por encima de todo, el Zenith ultrawide te sirve mas.',
  },
  {
    name: 'Monitor curvo 34" ultrawide Zenith',
    description: 'Formato ultrawide curvo, ideal para simuladores y productividad.',
    price: 599999,
    stock: 8,
    category: 'monitor',
    displayColor: 'cyan',
    imageUrl: 'https://placehold.co/600x400?text=Zenith+34',
    isActive: true,
    specs: [
      { label: 'Panel', value: 'VA curvo' },
      { label: 'Resolucion', value: '3440x1440' },
      { label: 'Refresco', value: '144Hz' },
      { label: 'Curvatura', value: '1500R' },
    ],
    curatorialNote:
      'El ultrawide cambia como se juega un simulador o se trabaja con varias ventanas. No es el que elegiria alguien que solo busca el refresco mas alto posible: para eso esta el Sprint.',
  },
  {
    name: 'Monitor 24" 144Hz Sprint',
    description: 'Panel de 24 pulgadas orientado a juegos competitivos.',
    price: 229999,
    stock: 18,
    category: 'monitor',
    displayColor: 'amber',
    imageUrl: 'https://placehold.co/600x400?text=Sprint+24',
    isActive: true,
    specs: [
      { label: 'Panel', value: 'TN' },
      { label: 'Resolucion', value: '1920x1080' },
      { label: 'Refresco', value: '144Hz' },
      { label: 'Respuesta', value: '1ms' },
    ],
    curatorialNote:
      'Chico y rapido, pensado para quien prioriza cuadros por segundo sobre todo lo demas. Si te importa el color, el Horizon con panel IPS te va a convencer mas.',
  },
  {
    name: 'Silla gamer ergonomica Apex',
    description: 'Soporte lumbar ajustable y reposabrazos 4D.',
    price: 189999,
    stock: 10,
    category: 'chair',
    displayColor: 'lime',
    imageUrl: 'https://placehold.co/600x400?text=Apex',
    isActive: true,
    specs: [
      { label: 'Respaldo', value: 'Reclinable 135 grados' },
      { label: 'Soporte lumbar', value: 'Ajustable' },
      { label: 'Reposabrazos', value: '4D' },
      { label: 'Capacidad', value: '120kg' },
    ],
    curatorialNote:
      'El soporte lumbar ajustable es lo que la diferencia despues de la tercera hora sentado. La Voyager reclina mas si buscas directamente descansar, no trabajar.',
  },
  {
    name: 'Silla gamer reclinable Voyager',
    description: 'Reclinacion de hasta 165 grados con reposapies integrado.',
    price: 219999,
    stock: 7,
    category: 'chair',
    displayColor: 'magenta',
    imageUrl: 'https://placehold.co/600x400?text=Voyager',
    isActive: true,
    specs: [
      { label: 'Respaldo', value: 'Reclinable 165 grados' },
      { label: 'Reposapies', value: 'Integrado' },
      { label: 'Reposabrazos', value: '3D' },
      { label: 'Capacidad', value: '130kg' },
    ],
    curatorialNote:
      'Reclina casi horizontal con reposapies propio, para el que quiere una siesta entre partidas. No es la mas firme para escribir largo: ahi la Apex rinde mejor.',
  },
  {
    name: 'Silla gamer compacta Drift',
    description: 'Diseno compacto pensado para escritorios chicos.',
    price: 149999,
    stock: 14,
    category: 'chair',
    displayColor: 'cyan',
    imageUrl: 'https://placehold.co/600x400?text=Drift',
    isActive: true,
    specs: [
      { label: 'Respaldo', value: 'Reclinable 120 grados' },
      { label: 'Ancho de asiento', value: 'Reducido' },
      { label: 'Reposabrazos', value: 'Fijos' },
      { label: 'Capacidad', value: '100kg' },
    ],
    curatorialNote:
      'Pensada para escritorios chicos donde una silla gamer tradicional no entra. Sacrifica reclinacion y reposabrazos ajustables para lograrlo.',
  },
  {
    name: 'Mousepad XL Cosmos',
    description: 'Superficie extendida de tela para mouse y teclado.',
    price: 14999,
    stock: 100,
    category: 'mousepad',
    displayColor: 'amber',
    imageUrl: 'https://placehold.co/600x400?text=Cosmos',
    isActive: true,
    specs: [
      { label: 'Superficie', value: 'Tela de baja friccion' },
      { label: 'Tamaño', value: '900x400mm' },
      { label: 'Base', value: 'Goma antideslizante' },
      { label: 'Borde', value: 'Sin costura' },
    ],
    curatorialNote:
      'El tamaño XL cubre teclado y mouse en la misma superficie, para quien juega con sensibilidad baja y barre mucho. Si tu escritorio es chico, el Ridge te alcanza.',
  },
  {
    name: 'Mousepad de tela con borde cosido Ridge',
    description: 'Base de goma antideslizante y bordes cosidos.',
    price: 9999,
    stock: 120,
    category: 'mousepad',
    displayColor: 'lime',
    imageUrl: 'https://placehold.co/600x400?text=Ridge',
    isActive: true,
    specs: [
      { label: 'Superficie', value: 'Tela de friccion media' },
      { label: 'Tamaño', value: '450x400mm' },
      { label: 'Base', value: 'Goma antideslizante' },
      { label: 'Borde', value: 'Cosido' },
    ],
    curatorialNote:
      'El tamaño estandar para quien no necesita barrer medio escritorio. El borde cosido evita que se deshilache con el uso diario.',
  },
  {
    name: 'Mousepad con carga inalambrica PowerPad',
    description: 'Carga inalambrica integrada para mouse compatibles.',
    price: 29999,
    stock: 40,
    category: 'mousepad',
    displayColor: 'magenta',
    imageUrl: 'https://placehold.co/600x400?text=PowerPad',
    isActive: true,
    specs: [
      { label: 'Superficie', value: 'Tela de friccion media' },
      { label: 'Tamaño', value: '350x250mm' },
      { label: 'Carga inalambrica', value: '10W Qi' },
      { label: 'Cable', value: 'USB-C' },
    ],
    curatorialNote:
      'Resuelve el mouse inalambrico que siempre se queda sin bateria a mitad de partida. Es chico a proposito: no compite con el Cosmos en superficie de juego.',
  },
];

async function seed(): Promise<void> {
  process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
  initializeApp({ projectId: 'clack-add2a' });
  const db = getFirestore();
  const batch = db.batch();

  for (const entry of catalog) {
    const input = productInputSchema.parse({
      ...entry,
      nameLower: toNameLower(entry.name),
    });
    const ref = db.collection('products').doc(randomUUID());
    batch.set(ref, {
      ...input,
      ratingAverage: 0,
      ratingCount: 0,
      orderCount: 0,
      unitsSold: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  await batch.commit();
  console.log(`Catalogo cargado en el emulador: ${catalog.length} productos.`);
}

seed().catch((error: unknown) => {
  console.error('Fallo el seed del catalogo:', error);
  process.exitCode = 1;
});

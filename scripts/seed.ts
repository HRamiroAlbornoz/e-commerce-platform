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
    color: 'rgb',
    imageUrl: 'https://placehold.co/600x400?text=Aurora+TKL',
    isActive: true,
  },
  {
    name: 'Teclado mecanico wireless Nimbus 65%',
    description: 'Teclado compacto 65% con conexion inalambrica de baja latencia.',
    price: 124999,
    stock: 25,
    category: 'keyboard',
    color: 'white',
    imageUrl: 'https://placehold.co/600x400?text=Nimbus+65',
    isActive: true,
  },
  {
    name: 'Teclado mecanico low-profile Vertex',
    description: 'Perfil bajo con switches tactiles, ideal para sesiones largas.',
    price: 99999,
    stock: 30,
    category: 'keyboard',
    color: 'black',
    imageUrl: 'https://placehold.co/600x400?text=Vertex',
    isActive: true,
  },
  {
    name: 'Mouse gamer inalambrico Vector Pro',
    description: 'Sensor optico de alta precision y bateria de larga duracion.',
    price: 54999,
    stock: 60,
    category: 'mouse',
    color: 'black',
    imageUrl: 'https://placehold.co/600x400?text=Vector+Pro',
    isActive: true,
  },
  {
    name: 'Mouse optico ultraliviano Comet',
    description: 'Carcasa perforada de menos de 60 gramos para movimientos rapidos.',
    price: 39999,
    stock: 80,
    category: 'mouse',
    color: 'white',
    imageUrl: 'https://placehold.co/600x400?text=Comet',
    isActive: true,
  },
  {
    name: 'Mouse ergonomico Titan MMO',
    description: 'Doce botones programables laterales, pensado para juegos MMO.',
    price: 69999,
    stock: 35,
    category: 'mouse',
    color: 'black',
    imageUrl: 'https://placehold.co/600x400?text=Titan+MMO',
    isActive: true,
  },
  {
    name: 'Headset gamer 7.1 surround Pulsar',
    description: 'Sonido envolvente virtual 7.1 con microfono retractil.',
    price: 79999,
    stock: 45,
    category: 'headset',
    color: 'black',
    imageUrl: 'https://placehold.co/600x400?text=Pulsar',
    isActive: true,
  },
  {
    name: 'Headset inalambrico Aether Wireless',
    description: 'Conexion 2.4GHz de baja latencia y hasta 20 horas de bateria.',
    price: 109999,
    stock: 20,
    category: 'headset',
    color: 'white',
    imageUrl: 'https://placehold.co/600x400?text=Aether',
    isActive: true,
  },
  {
    name: 'Headset con cancelacion de ruido Nova ANC',
    description: 'Cancelacion activa de ruido para concentrarse en partidas competitivas.',
    price: 134999,
    stock: 15,
    category: 'headset',
    color: 'gray',
    imageUrl: 'https://placehold.co/600x400?text=Nova+ANC',
    isActive: true,
  },
  {
    name: 'Monitor gamer 27" 165Hz Horizon',
    description: 'Panel IPS de 27 pulgadas, 165Hz y 1ms de respuesta.',
    price: 349999,
    stock: 12,
    category: 'monitor',
    color: 'black',
    imageUrl: 'https://placehold.co/600x400?text=Horizon+27',
    isActive: true,
  },
  {
    name: 'Monitor curvo 34" ultrawide Zenith',
    description: 'Formato ultrawide curvo, ideal para simuladores y productividad.',
    price: 599999,
    stock: 8,
    category: 'monitor',
    color: 'black',
    imageUrl: 'https://placehold.co/600x400?text=Zenith+34',
    isActive: true,
  },
  {
    name: 'Monitor 24" 144Hz Sprint',
    description: 'Panel de 24 pulgadas orientado a juegos competitivos.',
    price: 229999,
    stock: 18,
    category: 'monitor',
    color: 'black',
    imageUrl: 'https://placehold.co/600x400?text=Sprint+24',
    isActive: true,
  },
  {
    name: 'Silla gamer ergonomica Apex',
    description: 'Soporte lumbar ajustable y reposabrazos 4D.',
    price: 189999,
    stock: 10,
    category: 'chair',
    color: 'black',
    imageUrl: 'https://placehold.co/600x400?text=Apex',
    isActive: true,
  },
  {
    name: 'Silla gamer reclinable Voyager',
    description: 'Reclinacion de hasta 165 grados con reposapies integrado.',
    price: 219999,
    stock: 7,
    category: 'chair',
    color: 'gray',
    imageUrl: 'https://placehold.co/600x400?text=Voyager',
    isActive: true,
  },
  {
    name: 'Silla gamer compacta Drift',
    description: 'Diseno compacto pensado para escritorios chicos.',
    price: 149999,
    stock: 14,
    category: 'chair',
    color: 'pink',
    imageUrl: 'https://placehold.co/600x400?text=Drift',
    isActive: true,
  },
  {
    name: 'Mousepad XL Cosmos',
    description: 'Superficie extendida de tela para mouse y teclado.',
    price: 14999,
    stock: 100,
    category: 'mousepad',
    color: 'black',
    imageUrl: 'https://placehold.co/600x400?text=Cosmos',
    isActive: true,
  },
  {
    name: 'Mousepad de tela con borde cosido Ridge',
    description: 'Base de goma antideslizante y bordes cosidos.',
    price: 9999,
    stock: 120,
    category: 'mousepad',
    color: 'gray',
    imageUrl: 'https://placehold.co/600x400?text=Ridge',
    isActive: true,
  },
  {
    name: 'Mousepad con carga inalambrica PowerPad',
    description: 'Carga inalambrica integrada para mouse compatibles.',
    price: 29999,
    stock: 40,
    category: 'mousepad',
    color: 'white',
    imageUrl: 'https://placehold.co/600x400?text=PowerPad',
    isActive: true,
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

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Iniciando siembra de datos del Hotel...');

  // 1. CREACIÓN DEL ADMINISTRADOR POR DEFECTO
  // Cambiamos a tipo number para que coincida con tu schema.prisma
  const adminCarnet = 7477254; 
  const adminCelular = 73892598;
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.usuario.upsert({
    where: { carnet: adminCarnet }, 
    update: {}, 
    create: {
      nombre: 'Abel',
      apellido: 'Pacheco',
      carnet: adminCarnet,
      celular: adminCelular,
      genero: 'Masculino',
      cargo: 'Administrador',
      password: hashedPassword,
    },
  });
  console.log('✅ Usuario Administrador Abel configurado correctamente.');

  // 2. CONFIGURACIÓN DE HABITACIONES (Se mantiene igual)
  const simples = [1, 12, 18, 19, 28, 29, 30, 35, 45, 46, 47, 52, 53];
  const matrimoniales = [2, 4, 6, 10, 16, 17, 20, 21, 24, 25, 26, 36, 37, 39, 41, 43, 51, 57, 58];
  const dobles = [9, 5, 14, 22, 23, 31, 32, 33, 38, 48, 49, 50, 54, 55];
  const familiares = [11, 27, 34, 40, 42, 44];
  const triples = [59];
  const cuadruples = [56];
  
  const noSonHabitaciones = new Set([3, 7, 8, 13, 15]); 

  await prisma.habitacion.deleteMany({});
  console.log('🧹 Limpieza de habitaciones completada.');

  for (let i = 1; i <= 59; i++) {
    if (noSonHabitaciones.has(i)) continue;

    let tipo = 'Sencilla';
    if (simples.includes(i)) tipo = 'Sencilla';
    else if (matrimoniales.includes(i)) tipo = 'Matrimonial';
    else if (dobles.includes(i)) tipo = 'Doble';
    else if (familiares.includes(i)) tipo = 'Familiar';
    else if (triples.includes(i)) tipo = 'Triple';
    else if (cuadruples.includes(i)) tipo = 'Cuádruple';

    let piso = 1;
    if (i >= 18 && i <= 34) piso = 2;
    else if (i >= 35 && i <= 51) piso = 3;
    else if (i >= 52) piso = 4;

    await prisma.habitacion.create({
      data: {
        numero: i,
        piso: piso,
        tipo_habitacion: tipo,
        ocupado: false,
        estado: 'Disponible',
      },
    });
  }

  console.log('✨ Proceso de Seed finalizado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
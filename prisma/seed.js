const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const empresaPassword = await bcrypt.hash('empresa123', 10);
  const clientePassword = await bcrypt.hash('cliente123', 10);

  const empresa = await prisma.user.upsert({
    where: { email: 'admin@empresa.test' },
    update: {
      role: 'EMPRESA',
      name: 'Admin Empresa',
      building: 'Headquarter',
    },
    create: {
      email: 'admin@empresa.test',
      password: empresaPassword,
      role: 'EMPRESA',
      name: 'Admin Empresa',
      building: 'Headquarter',
    },
  });

  const cliente = await prisma.user.upsert({
    where: { email: 'cliente@demo.test' },
    update: {
      role: 'CLIENTE',
      name: 'Cliente Demo',
      building: 'Torre Meridian - Nueva York',
    },
    create: {
      email: 'cliente@demo.test',
      password: clientePassword,
      role: 'CLIENTE',
      name: 'Cliente Demo',
      building: 'Torre Meridian - Nueva York',
    },
  });

  // Every equipment must belong to a client. The demo equipment is owned by
  // the demo client created above so it never ends up with a null userId.
  const equipments = [
    {
      internalCode: 'ASC-001-TOWER-NYC',
      type: 'ASCENSOR',
      motorBrand: 'Otis',
      controlBrand: 'Otis',
      cableType: 'Acero',
      cableGauge: '16 mm',
      maxWeight: 2500,
      capacity: 20,
    },
    {
      internalCode: 'ASC-002-CENTER-CHI',
      type: 'ASCENSOR',
      motorBrand: 'Schindler',
      controlBrand: 'Schindler',
      cableType: 'Acero',
      cableGauge: '14 mm',
      maxWeight: 2000,
      capacity: 16,
    },
  ];

  for (const equipment of equipments) {
    await prisma.equipment.upsert({
      where: { internalCode: equipment.internalCode },
      update: {
        ...equipment,
        userId: cliente.id,
      },
      create: {
        ...equipment,
        userId: cliente.id,
      },
    });
  }

  console.log(`Seed finished. Empresa: ${empresa.email}. Cliente: ${cliente.email}. Equipos: ${equipments.length}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

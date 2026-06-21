const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data (optional)
  try {
    await prisma.equipment.deleteMany();
  } catch (e) {
    // ignore
  }
  try {
    await prisma.user.deleteMany();
  } catch (e) {
    // ignore
  }

  const empresaPassword = await bcrypt.hash('empresa123', 10);
  const clientePassword = await bcrypt.hash('cliente123', 10);

  const empresa = await prisma.user.create({
    data: {
      email: 'admin@empresa.test',
      password: empresaPassword,
      role: 'EMPRESA',
      name: 'Admin Empresa',
      building: 'Headquarter'
    }
  });

  const cliente = await prisma.user.create({
    data: {
      email: 'cliente@demo.test',
      password: clientePassword,
      role: 'CLIENTE',
      name: 'Cliente Demo',
      building: 'Torre Meridian - Nueva York'
    }
  });

  const eq1 = await prisma.equipment.create({
    data: {
      buildingName: 'Torre Meridian - Nueva York',
      address: '1250 Broadway, New York, NY 10001',
      type: 'ASCENSOR',
      internalCode: 'ASC-001-TOWER-NYC',
      installationDate: new Date('2019-03-15'),
      lastMaintenance: new Date('2024-11-20'),
      motorBrand: 'Otis',
      motorPower: '50hp / 37.3kw',
      voltage: '220V Trifásico',
      tractionType: 'MR',
      cableQuantity: 8,
      cableGauge: '16 mm',
      stopsQuantity: 28,
      nominalSpeed: 4.0,
      maxWeight: 2500,
      capacityPeople: 20,
      controlBrand: 'Otis',
      doorOperator: 'Otis OP32',
      speedGovernor: 'SG-4000',
      infraredCurtain: 'Dual-band'
    }
  });

  const eq2 = await prisma.equipment.create({
    data: {
      buildingName: 'Centro Financiero Chicago',
      address: '200 S Wacker Dr, Chicago, IL 60606',
      type: 'ASCENSOR',
      internalCode: 'ASC-002-CENTER-CHI',
      installationDate: new Date('2018-06-10'),
      lastMaintenance: new Date('2024-11-15'),
      motorBrand: 'Schindler',
      motorPower: '45hp / 33.6kw',
      voltage: '220V Trifásico',
      tractionType: 'MR',
      cableQuantity: 6,
      cableGauge: '14 mm',
      stopsQuantity: 20,
      nominalSpeed: 3.5,
      maxWeight: 2000,
      capacityPeople: 16,
      controlBrand: 'Schindler',
      doorOperator: 'SD-22',
      speedGovernor: 'SG-3000',
      infraredCurtain: 'Single-band'
    }
  });

  console.log('Seed finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

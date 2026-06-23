import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete existing test data
  await prisma.user.deleteMany({
    where: { 
      email: { in: ['empresa.test@example.com', 'cliente.test@example.com'] }
    }
  });

  // Create test empresa user
  const empresa = await prisma.user.create({
    data: {
      email: 'empresa.test@example.com',
      password: 'test123',
      role: 'EMPRESA',
      name: 'Empresa Test',
      building: 'Central'
    }
  });

  console.log('✓ Empresa creada:', empresa.email);

  // Create test cliente user
  const cliente = await prisma.user.create({
    data: {
      email: 'cliente.test@example.com',
      password: 'test123',
      role: 'CLIENTE',
      name: 'Cliente Test',
      building: 'Torre Principal'
    }
  });

  console.log('✓ Cliente creado:', cliente.email);

  // Create test equipment for the cliente
  const equipment = await prisma.equipment.create({
    data: {
      internalCode: 'ASC-001',
      type: 'Ascensor',
      motorBrand: 'Siemens',
      controlBrand: 'Otis',
      cableType: 'Trenzado',
      cableGauge: '12mm',
      maxWeight: 1000,
      capacity: 13,
      userId: cliente.id
    }
  });

  console.log('✓ Equipo creado:', equipment.internalCode);

  // Create technical specification
  const ficha = await prisma.fichaTecnica.create({
    data: {
      equipmentId: equipment.id,
      codigoEquipo: 'ASC-001',
      marcaOriginal: 'Otis',
      modelo: 'Gen2Plus',
      anoInstalacion: 2018,
      paisOrigen: 'USA',
      numParadas: 12,
      tipoTraccion: 'Directa',
      marcaMotor: 'Siemens',
      potenciaKW: 11.5,
      voltajeAlimentacion: '380V 3F',
      marcaControlElectrico: 'Otis Elevonic',
      tipoTecnologia: 'VVVF',
      numCablesTraccion: 8,
      diametroCable: 12.5,
      longitudAproximada: 45.0,
      capacidadKilos: 1000,
      capacidadPersonas: 13,
      anchoCabina: 2100,
      altoCabina: 2300,
      profundidadCabina: 1200,
      acabadoCabina: 'Inoxidable',
      tipoPiso: 'Goma antideslizante',
      tipoBotoneraCOP: 'Electrónica táctil',
      tipoAperturaPuerta: 'Automática centr',
      anchoPasoPuerta: 900,
      marcaOperador: 'Otis',
      sistemaSeguridadPuerta: 'Fotocélula IR',
      marcaLimitador: 'Otis',
      velocidadDisparo: 1.2,
      tipoParacaidas: 'Cuña desacelerador',
      tipoAmortiguadores: 'Hidráulico',
      tipoPesacargas: 'Electrónico'
    }
  });

  console.log('✓ Ficha Técnica creada para equipo:', ficha.codigoEquipo);

  console.log('\n✅ Datos de prueba creados exitosamente');
  console.log('\n📱 Credenciales EMPRESA:');
  console.log('   Email: empresa.test@example.com');
  console.log('   Contraseña: test123');
  console.log('\n👤 Credenciales CLIENTE:');
  console.log('   Email: cliente.test@example.com');
  console.log('   Contraseña: test123');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

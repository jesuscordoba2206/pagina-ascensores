const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const EMPTY_MONTHLY_REPORTS = Array.from({ length: 12 }, () => '');

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  const result = await prisma.equipment.updateMany({
    data: {
      reportUrls: EMPTY_MONTHLY_REPORTS,
    },
  });

  console.log('Reset mensual de reportes completado.');
  console.log(`Equipos actualizados: ${result.count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

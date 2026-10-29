const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const MONTH_KEYS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

function extractR2KeyFromUrl(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    const base = process.env.R2_PUBLIC_URL;
    if (base) {
      const prefix = base.replace(/\/$/, '') + '/';
      if (url.startsWith(prefix)) {
        return decodeURIComponent(url.slice(prefix.length));
      }
    }

    const parsed = new URL(url);
    const bucket = process.env.R2_BUCKET_NAME || '';
    const bucketPrefix = `/${bucket}/`;
    if (parsed.pathname.startsWith(bucketPrefix)) {
      return decodeURIComponent(parsed.pathname.slice(bucketPrefix.length));
    }

    const pathname = parsed.pathname.replace(/^\//, '');
    return pathname ? decodeURIComponent(pathname) : null;
  } catch {
    return null;
  }
}

function getFileNameFromKey(key) {
  const clean = key.split('/').pop() || 'reporte.pdf';
  return clean.replace(/^\d{10,}-/, '') || clean;
}

async function main() {
  const equipments = await prisma.equipment.findMany({
    select: { id: true, internalCode: true, reportUrls: true, updatedAt: true },
  });

  let created = 0;
  let skipped = 0;

  for (const equipment of equipments) {
    const reportUrls = Array.isArray(equipment.reportUrls) ? equipment.reportUrls : [];

    for (let index = 0; index < MONTH_KEYS.length; index += 1) {
      const url = reportUrls[index];
      if (typeof url !== 'string' || url.trim() === '') continue;

      const key = extractR2KeyFromUrl(url);
      if (!key) {
        console.warn(`[skip] ${equipment.internalCode} ${MONTH_KEYS[index]}: no se pudo resolver la key de ${url}`);
        skipped += 1;
        continue;
      }

      const existing = await prisma.reportFile.findFirst({ where: { key } });
      if (existing) {
        skipped += 1;
        continue;
      }

      await prisma.reportFile.create({
        data: {
          equipmentId: equipment.id,
          month: MONTH_KEYS[index],
          year: null,
          fileName: getFileNameFromKey(key),
          key,
          url,
          size: null,
          createdAt: equipment.updatedAt || new Date(),
        },
      });

      created += 1;
      console.log(`[ok] ${equipment.internalCode} ${MONTH_KEYS[index]} -> ${key}`);
    }
  }

  console.log(`\nMigración finalizada. Creados: ${created}. Omitidos: ${skipped}.`);
}

main()
  .catch((error) => {
    console.error('Error migrando reportUrls a ReportFile:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

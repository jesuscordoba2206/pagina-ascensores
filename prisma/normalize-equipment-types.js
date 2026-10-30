const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const STANDARD_TYPES = {
  ASCENSOR: 'Ascensor',
  PUERTA: 'Puerta automática',
  ESCALERA: 'Escalera eléctrica',
};

const TYPE_ALIASES = new Map([
  ['ascensor', STANDARD_TYPES.ASCENSOR],
  ['elevador', STANDARD_TYPES.ASCENSOR],
  ['puerta', STANDARD_TYPES.PUERTA],
  ['puerta automatica', STANDARD_TYPES.PUERTA],
  ['puerta peatonal', STANDARD_TYPES.PUERTA],
  ['escalera', STANDARD_TYPES.ESCALERA],
  ['escalera electrica', STANDARD_TYPES.ESCALERA],
  ['escalera mecanica', STANDARD_TYPES.ESCALERA],
]);

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function normalizeEquipmentType(value) {
  const normalized = normalizeText(value);
  if (!normalized) return null;

  if (TYPE_ALIASES.has(normalized)) {
    return TYPE_ALIASES.get(normalized);
  }

  return null;
}

async function main() {
  const equipments = await prisma.equipment.findMany({
    select: {
      id: true,
      internalCode: true,
      type: true,
    },
  });

  let updated = 0;
  let skipped = 0;
  let unknown = 0;

  for (const equipment of equipments) {
    const nextType = normalizeEquipmentType(equipment.type);

    if (!nextType) {
      unknown += 1;
      console.warn(`[warn] tipo no reconocido para ${equipment.internalCode || equipment.id}: "${equipment.type}"`);
      continue;
    }

    if (equipment.type === nextType) {
      skipped += 1;
      continue;
    }

    await prisma.equipment.update({
      where: { id: equipment.id },
      data: { type: nextType },
    });

    updated += 1;
    console.log(`[ok] ${equipment.internalCode || equipment.id}: "${equipment.type}" -> "${nextType}"`);
  }

  console.log('\nNormalización finalizada.');
  console.log(`Actualizados: ${updated}`);
  console.log(`Sin cambios: ${skipped}`);
  console.log(`No reconocidos: ${unknown}`);
}

main()
  .catch((error) => {
    console.error('Error normalizando tipos de equipo:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

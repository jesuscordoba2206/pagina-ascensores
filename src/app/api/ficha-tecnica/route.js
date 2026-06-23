import { prisma } from '@/lib/prisma';
import { requireEnterpriseRole } from '@/lib/auth';

// ─────────────────────────────────────────────────────────────────────────────
// GET: Obtener ficha técnica por equipmentId
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const equipmentId = searchParams.get('equipmentId');

    if (!equipmentId) {
      return new Response(
        JSON.stringify({ error: 'Missing equipmentId parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const fichaTecnica = await prisma.fichaTecnica.findUnique({
      where: { equipmentId },
      include: { equipment: { select: { id: true, internalCode: true, type: true } } },
    });

    if (!fichaTecnica) {
      return new Response(
        JSON.stringify({ error: 'Ficha técnica no encontrada' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(fichaTecnica), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('GET /api/ficha-tecnica error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST: Crear ficha técnica
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  try {
    console.log('[FichaTecnica POST] Iniciando...');
    const body = await request.json();
    console.log('[FichaTecnica POST] Body recibido:', body);
    
    const { equipmentId, ...fichaTecnicaData } = body;
    console.log('[FichaTecnica POST] equipmentId:', equipmentId);
    console.log('[FichaTecnica POST] fichaTecnicaData:', fichaTecnicaData);

    if (!equipmentId) {
      return new Response(
        JSON.stringify({ error: 'Missing equipmentId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar que el equipo existe
    console.log('[FichaTecnica POST] Buscando equipo...');
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      select: { id: true, internalCode: true },
    });
    console.log('[FichaTecnica POST] Equipo encontrado:', equipment);

    if (!equipment) {
      return new Response(
        JSON.stringify({ error: 'Equipment not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar y normalizar campos numéricos
    console.log('[FichaTecnica POST] Normalizando datos...');
    const normalizedData = normalizeNumericFields(fichaTecnicaData);
    console.log('[FichaTecnica POST] Datos normalizados:', normalizedData);

    // Filtrar campos null/undefined para evitar problemas con Prisma
    const cleanData = Object.fromEntries(
      Object.entries(normalizedData).filter(([_, v]) => v !== null && v !== undefined)
    );
    console.log('[FichaTecnica POST] Datos limpios (filtrados):', cleanData);

    // Pre-llenar codigoEquipo con el código del equipo si no está presente
    if (!cleanData.codigoEquipo && equipment.internalCode) {
      cleanData.codigoEquipo = equipment.internalCode;
      console.log('[FichaTecnica POST] codigoEquipo pre-llenado con:', cleanData.codigoEquipo);
    }

    console.log('[FichaTecnica POST] Prisma está definido?', !!prisma);
    console.log('[FichaTecnica POST] prisma.fichaTecnica está definido?', !!prisma.fichaTecnica);
    console.log('[FichaTecnica POST] prisma.fichaTecnica.create está definido?', typeof prisma.fichaTecnica.create);

    console.log('[FichaTecnica POST] Creando FichaTecnica...');
    const fichaTecnica = await prisma.fichaTecnica.create({
      data: {
        equipmentId,
        ...cleanData,
      },
      include: { equipment: { select: { id: true, internalCode: true, type: true } } },
    });
    console.log('[FichaTecnica POST] FichaTecnica creada exitosamente:', fichaTecnica);

    return new Response(JSON.stringify(fichaTecnica), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[FichaTecnica POST] ERROR COMPLETO:', err);
    console.error('[FichaTecnica POST] Error message:', err.message);
    console.error('[FichaTecnica POST] Error stack:', err.stack);
    console.error('[FichaTecnica POST] Error code:', err.code);
    return new Response(
      JSON.stringify({ error: String(err), message: err.message, code: err.code }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT: Actualizar ficha técnica
// ─────────────────────────────────────────────────────────────────────────────
export async function PUT(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { equipmentId, ...updateData } = body;

    if (!equipmentId) {
      return new Response(
        JSON.stringify({ error: 'Missing equipmentId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar y normalizar campos numéricos
    const normalizedData = normalizeNumericFields(updateData);

    // Filtrar campos null/undefined para evitar problemas con Prisma
    const cleanData = Object.fromEntries(
      Object.entries(normalizedData).filter(([_, v]) => v !== null && v !== undefined)
    );

    const fichaTecnica = await prisma.fichaTecnica.update({
      where: { equipmentId },
      data: cleanData,
      include: { equipment: { select: { id: true, internalCode: true, type: true } } },
    });

    return new Response(JSON.stringify(fichaTecnica), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return new Response(
        JSON.stringify({ error: 'Ficha técnica no encontrada' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.error('PUT /api/ficha-tecnica error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Normalizar y validar campos numéricos y strings
// ─────────────────────────────────────────────────────────────────────────────
function normalizeNumericFields(data) {
  const intFields = [
    'anoInstalacion',
    'numParadas',
    'numCablesTraccion',
    'capacidadKilos',
    'capacidadPersonas',
    'anchoPasoPuerta',
  ];

  const floatFields = [
    'potenciaKW',
    'diametroCable',
    'longitudAproximada',
    'anchoCabina',
    'altoCabina',
    'profundidadCabina',
    'velocidadDisparo',
  ];

  const normalized = { ...data };

  // Paso 1: Convertir todos los strings vacíos a null
  Object.keys(normalized).forEach((key) => {
    const value = normalized[key];
    // Si es un string vacío o undefined, convertir a null
    if (value === '' || value === undefined) {
      normalized[key] = null;
    }
  });

  // Paso 2: Procesar campos Int
  intFields.forEach((field) => {
    if (field in normalized && normalized[field] !== null && normalized[field] !== undefined) {
      const parsed = parseInt(normalized[field], 10);
      normalized[field] = isNaN(parsed) ? null : parsed;
    }
  });

  // Paso 3: Procesar campos Float
  floatFields.forEach((field) => {
    if (field in normalized && normalized[field] !== null && normalized[field] !== undefined) {
      const parsed = parseFloat(normalized[field]);
      normalized[field] = isNaN(parsed) ? null : parsed;
    }
  });

  console.log('Normalized ficha data:', normalized);
  return normalized;
}

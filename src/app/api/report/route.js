import { prisma } from '@/lib/prisma';
import { requireEnterpriseRole } from '@/lib/auth';

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

function normalizeMonthKey(value) {
  if (!value || typeof value !== 'string') return null;
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export async function GET(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const equipmentId = searchParams.get('equipmentId');

    if (!equipmentId) {
      return new Response(JSON.stringify({ error: 'Missing equipmentId' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (!equipment) {
      return new Response(JSON.stringify({ error: 'Equipment not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify(equipment.reportUrls || []), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { equipmentId, reportUrl } = body;
    const monthKey = normalizeMonthKey(body.month);

    if (!equipmentId || !reportUrl || !monthKey) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const monthIndex = MONTH_KEYS.indexOf(monthKey);
    if (monthIndex === -1) {
      return new Response(JSON.stringify({ error: 'Invalid month value' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (!equipment) {
      return new Response(JSON.stringify({ error: 'Equipment not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const existing = Array.isArray(equipment.reportUrls) ? equipment.reportUrls : [];
    const reportUrls = Array.from({ length: 12 }, (_, index) => {
      const value = existing[index];
      return typeof value === 'string' ? value : '';
    });
    reportUrls[monthIndex] = reportUrl;

    const updated = await prisma.equipment.update({
      where: { id: equipmentId },
      data: { reportUrls },
    });

    return new Response(JSON.stringify({ reportUrls: updated.reportUrls }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

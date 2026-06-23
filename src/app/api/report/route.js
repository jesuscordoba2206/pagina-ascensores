import { prisma } from '@/lib/prisma';
import { requireEnterpriseRole } from '@/lib/auth';

export async function GET(request) {
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

    if (!equipmentId || !reportUrl) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (!equipment) {
      return new Response(JSON.stringify({ error: 'Equipment not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const reportUrls = equipment.reportUrls || [];
    reportUrls.unshift(reportUrl);

    if (reportUrls.length > 3) {
      reportUrls.pop();
    }

    const updated = await prisma.equipment.update({
      where: { id: equipmentId },
      data: { reportUrls },
    });

    return new Response(JSON.stringify({ reportUrls: updated.reportUrls }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

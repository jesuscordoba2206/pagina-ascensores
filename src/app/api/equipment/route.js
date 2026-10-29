import { prisma } from '@/lib/prisma';
import { getSessionUser, requireEnterpriseRole } from '@/lib/auth';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client } from '@/lib/r2';
import { sortReportFiles } from '@/lib/reports';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    const sessionUser = await getSessionUser(request);

     if (!sessionUser) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    let query = {};
    if (requestedUserId && sessionUser?.role === 'EMPRESA') {
      query = { where: { userId: requestedUserId } };
    } else if (sessionUser?.id) {
      query = { where: { userId: sessionUser.id } };
    }

    const items = await prisma.equipment.findMany({
      ...query,
      include: { reportFiles: true },
      orderBy: { createdAt: 'desc' },
    });

    const normalized = items.map((item) => ({
      ...item,
      reportFiles: sortReportFiles(item.reportFiles),
    }));

    return new Response(JSON.stringify(normalized), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { userId, internalCode, type, motorBrand, controlBrand, cableType, cableGauge, maxWeight, capacity } = body;
    if (!userId || !internalCode || !type) {
      return new Response(JSON.stringify({ error: 'Missing required equipment fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const created = await prisma.equipment.create({
      data: {
        user: { connect: { id: userId } },
        internalCode,
        type,
        motorBrand,
        controlBrand,
        cableType,
        cableGauge,
        maxWeight: maxWeight ? Number(maxWeight) : undefined,
        capacity: capacity ? Number(capacity) : undefined,
      },
    });
    return new Response(JSON.stringify(created), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[equipment POST] Error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function PUT(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { id, internalCode, type, motorBrand, controlBrand, cableType, cableGauge, maxWeight, capacity } = body;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing equipment id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const updated = await prisma.equipment.update({
      where: { id },
      data: {
        internalCode: internalCode ?? undefined,
        type: type ?? undefined,
        motorBrand: motorBrand ?? undefined,
        controlBrand: controlBrand ?? undefined,
        cableType: cableType ?? undefined,
        cableGauge: cableGauge ?? undefined,
        maxWeight: maxWeight ? Number(maxWeight) : undefined,
        capacity: capacity ? Number(capacity) : undefined,
      },
    });
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function DELETE(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing equipment id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const existing = await prisma.equipment.findUnique({
      where: { id },
      select: { reportFiles: { select: { key: true } } },
    });

    const deleted = await prisma.equipment.delete({ where: { id } });

    const keys = (existing?.reportFiles || []).map((report) => report.key).filter(Boolean);
    if (keys.length > 0) {
      try {
        const r2 = getR2Client();
        for (const key of keys) {
          try {
            await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
          } catch (deleteErr) {
            console.error('No se pudo borrar el reporte de R2:', deleteErr);
          }
        }
      } catch (configErr) {
        console.error('R2 no configurado; se conservan los objetos huérfanos:', configErr.message);
      }
    }

    return new Response(JSON.stringify(deleted), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

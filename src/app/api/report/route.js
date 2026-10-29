import { prisma } from '@/lib/prisma';
import { requireEnterpriseRole } from '@/lib/auth';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client } from '@/lib/r2';
import {
  extractR2KeyFromUrl,
  getFileNameFromKey,
  getMonthIndex,
  normalizeMonthKey,
  sortReportFiles,
} from '@/lib/reports';

function getR2ClientOrNull() {
  try {
    return getR2Client();
  } catch {
    return null;
  }
}

async function deleteR2Objects(keys) {
  const validKeys = keys.filter(Boolean);
  if (validKeys.length === 0) return;

  const r2 = getR2ClientOrNull();
  if (!r2) return;

  for (const key of validKeys) {
    try {
      await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
    } catch (deleteErr) {
      console.error('No se pudo borrar el reporte de R2:', deleteErr);
    }
  }
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

    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      select: { reportUrls: true, reportFiles: true },
    });
    if (!equipment) {
      return new Response(JSON.stringify({ error: 'Equipment not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      reportUrls: equipment.reportUrls || [],
      reportFiles: sortReportFiles(equipment.reportFiles),
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
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

    if (getMonthIndex(monthKey) === -1) {
      return new Response(JSON.stringify({ error: 'Invalid month value' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      select: { id: true },
    });
    if (!equipment) {
      return new Response(JSON.stringify({ error: 'Equipment not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const key = body.key || extractR2KeyFromUrl(reportUrl);
    if (!key) {
      return new Response(JSON.stringify({ error: 'Could not resolve the R2 key from reportUrl' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const rawYear = body.year;
    const parsedYear = rawYear ? Number(rawYear) : null;
    const year = Number.isInteger(parsedYear) ? parsedYear : new Date().getFullYear();

    const created = await prisma.reportFile.create({
      data: {
        equipmentId: equipment.id,
        month: monthKey,
        year,
        fileName: body.fileName || getFileNameFromKey(key),
        key,
        url: reportUrl,
        size: Number.isFinite(Number(body.size)) ? Number(body.size) : null,
      },
    });

    return new Response(JSON.stringify({ file: created }), { status: 201, headers: { 'Content-Type': 'application/json' } });
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
    const equipmentId = searchParams.get('equipmentId');
    const monthKey = normalizeMonthKey(searchParams.get('month'));
    const key = searchParams.get('key');

    if (id) {
      const reportFile = await prisma.reportFile.findUnique({ where: { id } });
      if (!reportFile) {
        return new Response(JSON.stringify({ error: 'Report file not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }

      await prisma.reportFile.delete({ where: { id } });
      await deleteR2Objects([reportFile.key]);

      return new Response(JSON.stringify({ deleted: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (!equipmentId) {
      return new Response(JSON.stringify({ error: 'Missing report id or equipmentId' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      select: { reportUrls: true, reportFiles: true },
    });
    if (!equipment) {
      return new Response(JSON.stringify({ error: 'Equipment not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const targets = equipment.reportFiles.filter((report) => {
      if (monthKey && report.month !== monthKey) return false;
      if (key && report.key !== key) return false;
      return true;
    });

    if (targets.length > 0) {
      await prisma.reportFile.deleteMany({ where: { id: { in: targets.map((report) => report.id) } } });
    }

    // Keep the legacy 12-slot array in sync when deleting by month.
    if (monthKey && !key) {
      const monthIndex = getMonthIndex(monthKey);
      if (monthIndex !== -1) {
        const existing = Array.isArray(equipment.reportUrls) ? equipment.reportUrls : [];
        const reportUrls = Array.from({ length: 12 }, (_, index) => {
          const value = existing[index];
          return typeof value === 'string' ? value : '';
        });
        if (reportUrls[monthIndex]) {
          reportUrls[monthIndex] = '';
          await prisma.equipment.update({ where: { id: equipmentId }, data: { reportUrls } });
        }
      }
    }

    await deleteR2Objects(targets.map((report) => report.key));

    return new Response(JSON.stringify({ deleted: targets.length }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

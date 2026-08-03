import { prisma } from '@/lib/prisma';
import { requireEnterpriseRole } from '@/lib/auth';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

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

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

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
  } catch {
    return null;
  }

  return null;
}

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

export async function DELETE(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const equipmentId = searchParams.get('equipmentId');
    const monthKey = normalizeMonthKey(searchParams.get('month'));

    if (!equipmentId || !monthKey) {
      return new Response(JSON.stringify({ error: 'Missing equipmentId or month' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const monthIndex = MONTH_KEYS.indexOf(monthKey);
    if (monthIndex === -1) {
      return new Response(JSON.stringify({ error: 'Invalid month value' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId }, select: { reportUrls: true } });
    if (!equipment) {
      return new Response(JSON.stringify({ error: 'Equipment not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const existing = Array.isArray(equipment.reportUrls) ? equipment.reportUrls : [];
    const reportUrls = Array.from({ length: 12 }, (_, index) => {
      const value = existing[index];
      return typeof value === 'string' ? value : '';
    });

    const oldUrl = reportUrls[monthIndex] || null;
    reportUrls[monthIndex] = '';

    const updated = await prisma.equipment.update({
      where: { id: equipmentId },
      data: { reportUrls },
      select: { reportUrls: true },
    });

    if (oldUrl) {
      const r2 = getR2Client();
      if (r2) {
        const oldKey = extractR2KeyFromUrl(oldUrl);
        if (oldKey) {
          try {
            await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: oldKey }));
          } catch (deleteErr) {
            console.error('No se pudo borrar el reporte anterior de R2:', deleteErr);
          }
        }
      }
    }

    return new Response(JSON.stringify({ reportUrls: updated.reportUrls }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

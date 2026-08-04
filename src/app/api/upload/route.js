import { requireEnterpriseRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client } from '@/lib/r2';

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

// ---------------------------------------------------------------------------
// R2 client (singleton per cold start)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

function buildPublicUrl(key) {
  const base = process.env.R2_PUBLIC_URL;
  if (base) {
    return `${base.replace(/\/$/, '')}/${key}`;
  }
  // Fall back to direct R2 URL (bucket must have public access enabled)
  const accountId = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET_NAME;
  return `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
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
    // Strip leading slash and bucket name from path
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

// ---------------------------------------------------------------------------
// Prisma helper – save report URL by month (12 slots) and replace old file for that month
// ---------------------------------------------------------------------------

function normalizeMonthKey(value) {
  if (!value || typeof value !== 'string') return null;

  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

async function updateEquipmentReportUrls(equipmentId, monthKey, reportUrl, r2) {
  const monthIndex = MONTH_KEYS.indexOf(monthKey);
  if (monthIndex === -1) {
    return { error: 'Invalid month value', status: 400 };
  }

  const equipment = await prisma.equipment.findUnique({
    where: { id: equipmentId },
    select: { reportUrls: true },
  });

  if (!equipment) {
    return { error: 'Equipment not found', status: 404 };
  }

  const existing = Array.isArray(equipment.reportUrls) ? equipment.reportUrls : [];
  const reportUrls = Array.from({ length: 12 }, (_, index) => {
    const value = existing[index];
    return typeof value === 'string' ? value : '';
  });

  const replacedUrl = reportUrls[monthIndex] || null;
  reportUrls[monthIndex] = reportUrl;

  const updated = await prisma.equipment.update({
    where: { id: equipmentId },
    data: { reportUrls },
    select: { reportUrls: true },
  });

  if (replacedUrl && replacedUrl !== reportUrl) {
    const oldKey = extractR2KeyFromUrl(replacedUrl);
    if (oldKey) {
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: oldKey,
          })
        );
      } catch (deleteErr) {
        console.error('No se pudo borrar el reporte anterior de R2:', deleteErr);
      }
    }
  }

  return { reportUrls: updated.reportUrls };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  let r2;
  try {
    r2 = getR2Client();
  } catch (configErr) {
    return new Response(
      JSON.stringify({ error: configErr.message }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const category = String(formData.get('category') || 'reports');
    const equipmentId = String(formData.get('equipmentId') || '').trim();
    const monthKey = normalizeMonthKey(formData.get('month'));

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'Missing file' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return new Response(JSON.stringify({ error: 'Only PDF files are allowed' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    if (equipmentId) {
      if (!monthKey) {
        return new Response(JSON.stringify({ error: 'Month is required when equipmentId is provided' }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
      }

      const exists = await prisma.equipment.findUnique({
        where: { id: equipmentId },
        select: { id: true },
      });
      if (!exists) {
        return new Response(JSON.stringify({ error: 'Equipment not found' }), {
          status: 404, headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = equipmentId && monthKey
      ? `${category}/${equipmentId}/${monthKey}/${timestamp}-${sanitizedName}`
      : `${category}/${timestamp}-${sanitizedName}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: 'application/pdf',
      })
    );

    const url = buildPublicUrl(key);

    if (equipmentId) {
      const reportResult = await updateEquipmentReportUrls(equipmentId, monthKey, url, r2);
      if (reportResult.error) {
        // Best-effort cleanup of the just-uploaded file
        try {
          await r2.send(
            new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key })
          );
        } catch (cleanupErr) {
          console.error('No se pudo limpiar archivo tras error de BD:', cleanupErr);
        }

        return new Response(JSON.stringify({ error: reportResult.error }), {
          status: reportResult.status || 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ url, key, month: monthKey, reportUrls: reportResult.reportUrls }), {
        status: 201, headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ url, key }), {
      status: 201, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('R2 upload error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}

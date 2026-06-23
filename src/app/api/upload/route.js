import { requireEnterpriseRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// ---------------------------------------------------------------------------
// R2 client (singleton per cold start)
// ---------------------------------------------------------------------------

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Cloudflare R2 credentials missing. Define R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY in .env.local'
    );
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

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
// Prisma helper – keep max 3 report URLs and remove the evicted one from R2
// ---------------------------------------------------------------------------

async function updateEquipmentReportUrls(equipmentId, reportUrl, r2) {
  const equipment = await prisma.equipment.findUnique({
    where: { id: equipmentId },
    select: { reportUrls: true },
  });

  if (!equipment) {
    return { error: 'Equipment not found', status: 404 };
  }

  const existing = equipment.reportUrls || [];
  const reportUrls = [reportUrl, ...existing].slice(0, 3);
  const evictedUrl = existing.length >= 3 ? existing[2] : null;

  const updated = await prisma.equipment.update({
    where: { id: equipmentId },
    data: { reportUrls },
    select: { reportUrls: true },
  });

  if (evictedUrl) {
    const oldKey = extractR2KeyFromUrl(evictedUrl);
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
    const key = `${category}/${timestamp}-${sanitizedName}`;

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
      const reportResult = await updateEquipmentReportUrls(equipmentId, url, r2);
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

      return new Response(JSON.stringify({ url, key, reportUrls: reportResult.reportUrls }), {
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

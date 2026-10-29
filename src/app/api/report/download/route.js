import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client } from '@/lib/r2';
import { buildContentDisposition, extractR2KeyFromUrl, getFileNameFromKey, sanitizeFileName } from '@/lib/reports';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function forbidden() {
  return new Response(JSON.stringify({ error: 'Forbidden' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(request) {
  const session = await getSessionUser(request);
  if (!session) return forbidden();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const requestedKey = searchParams.get('key');
  const requestedUrl = searchParams.get('url');

  if (!id && !requestedKey && !requestedUrl) {
    return new Response(JSON.stringify({ error: 'Missing report id, key or url' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    let key = requestedKey ? decodeURIComponent(requestedKey) : null;
    if (!key && requestedUrl) {
      key = extractR2KeyFromUrl(requestedUrl);
    }
    let fileName = sanitizeFileName(searchParams.get('fileName') || (key ? getFileNameFromKey(key) : 'reporte.pdf'));

    if (id) {
      const reportFile = await prisma.reportFile.findUnique({
        where: { id },
        include: { equipment: { select: { userId: true } } },
      });

      if (!reportFile) {
        return new Response(JSON.stringify({ error: 'Report file not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (session.role !== 'EMPRESA' && reportFile.equipment.userId !== session.id) {
        return forbidden();
      }

      key = reportFile.key;
      fileName = sanitizeFileName(reportFile.fileName);
    } else if (session.role !== 'EMPRESA' && !key.startsWith(`reports/${session.id}/`)) {
      return forbidden();
    }

    if (!key) {
      return new Response(JSON.stringify({ error: 'Missing file key' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const r2 = getR2Client();
    const object = await r2.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      })
    );

    if (!object.Body) {
      return new Response(JSON.stringify({ error: 'Empty file' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const buffer = Buffer.from(await object.Body.transformToByteArray());

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': object.ContentType || 'application/pdf',
        'Content-Disposition': buildContentDisposition(fileName),
        'Content-Length': String(buffer.length),
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    console.error('Report download error:', err);
    return new Response(JSON.stringify({ error: 'No se pudo descargar el archivo' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

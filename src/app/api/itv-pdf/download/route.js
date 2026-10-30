import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getR2Client } from '@/lib/r2';
import { buildContentDisposition, sanitizeFileName } from '@/lib/reports';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(request) {
  const session = await getSessionUser(request);
  if (!session) return json({ error: 'Forbidden' }, 403);

  try {
    const { searchParams } = new URL(request.url);
    const id = String(searchParams.get('id') || '').trim();

    if (!id) {
      return json({ error: 'Missing file id' }, 400);
    }

    const file = await prisma.ivtPdfFile.findUnique({
      where: { id },
      include: {
        allowedUsers: {
          select: { userId: true },
        },
      },
    });

    if (!file) {
      return json({ error: 'Archivo no encontrado' }, 404);
    }

    if (session.role !== 'EMPRESA') {
      const isAllowed = file.scope === 'GLOBAL'
        || file.allowedUsers.some((entry) => entry.userId === session.id);
      if (!isAllowed) {
        return json({ error: 'Forbidden' }, 403);
      }
    }

    const r2 = getR2Client();
    const object = await r2.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: file.key,
      })
    );

    if (!object.Body) {
      return json({ error: 'Empty file' }, 502);
    }

    const buffer = Buffer.from(await object.Body.transformToByteArray());
    const fileName = sanitizeFileName(file.fileName || 'archivo-itv.pdf');

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
    console.error('ITV PDF download error:', err);
    return json({ error: 'No se pudo descargar el archivo' }, 502);
  }
}

import { prisma } from '@/lib/prisma';
import { requireEnterpriseRole } from '@/lib/auth';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

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

export async function GET() {
  try {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
    return new Response(JSON.stringify(projects), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const project = await prisma.project.create({ data: body });
    return new Response(JSON.stringify(project), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function PUT(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing project id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const project = await prisma.project.update({ where: { id }, data });
    return new Response(JSON.stringify(project), { status: 200, headers: { 'Content-Type': 'application/json' } });
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
      return new Response(JSON.stringify({ error: 'Missing project id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const project = await prisma.project.delete({ where: { id } });

    const r2Key = extractR2KeyFromUrl(project?.imageUrl);
    if (r2Key) {
      try {
        const r2 = getR2Client();
        await r2.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: r2Key,
          })
        );
      } catch (deleteErr) {
        console.error('No se pudo eliminar la imagen del proyecto en R2:', deleteErr);
      }
    }

    return new Response(JSON.stringify(project), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

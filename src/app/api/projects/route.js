import { requireEnterpriseRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

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

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function buildPublicUrl(key) {
  const base = process.env.R2_PUBLIC_URL;
  if (base) return `${base.replace(/\/$/, '')}/${key}`;

  const accountId = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET_NAME;
  return `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
}

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return new Response(JSON.stringify(projects), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  let r2;
  try {
    r2 = getR2Client();
  } catch (configErr) {
    return new Response(JSON.stringify({ error: configErr.message }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let uploadedKey = null;

  try {
    const formData = await request.formData();
    const title = String(formData.get('title') || '').trim();
    const descriptionRaw = formData.get('description');
    const description = typeof descriptionRaw === 'string' ? descriptionRaw.trim() : '';
    const file = formData.get('image');

    if (!title) {
      return new Response(JSON.stringify({ error: 'Project title is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'Project image is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!file.type.startsWith('image/')) {
      return new Response(JSON.stringify({ error: 'Only image files are allowed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const bucket = process.env.R2_BUCKET_NAME;
    if (!bucket) {
      return new Response(JSON.stringify({ error: 'R2_BUCKET_NAME is not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const timestamp = Date.now();
    const safeName = sanitizeFileName(file.name || `project-${timestamp}.jpg`);
    uploadedKey = `projects/${timestamp}-${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    await r2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: uploadedKey,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const imageUrl = buildPublicUrl(uploadedKey);

    const project = await prisma.project.create({
      data: {
        title,
        description: description || null,
        imageUrl,
      },
    });

    return new Response(JSON.stringify({ project, key: uploadedKey }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    if (uploadedKey) {
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: uploadedKey,
          })
        );
      } catch (cleanupErr) {
        console.error('No se pudo limpiar imagen de R2 tras error de BD:', cleanupErr);
      }
    }

    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

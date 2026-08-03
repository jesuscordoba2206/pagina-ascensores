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

function readProjectTextFields(formData, existingProject = null) {
  const hasTitle = formData.has('title');
  const hasDescription = formData.has('description');

  const titleValue = String(formData.get('title') || '').trim();
  const descriptionValue = String(formData.get('description') || '').trim();

  return {
    title: hasTitle ? (titleValue || 'Proyecto sin titulo') : existingProject?.title || 'Proyecto sin titulo',
    description: hasDescription ? (descriptionValue || null) : existingProject?.description || null,
  };
}

export async function GET(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

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
    const { title, description } = readProjectTextFields(formData);
    const file = formData.get('image');

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

export async function PUT(request) {
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
    const id = String(formData.get('id') || '').trim();
    const file = formData.get('image');
    const removeImage = String(formData.get('removeImage') || '') === 'true';

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing project id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { title, description } = readProjectTextFields(formData, existing);

    let imageUrl = existing.imageUrl;
    let replacedOldKey = null;

    if (file && file instanceof File) {
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

      imageUrl = buildPublicUrl(uploadedKey);
      replacedOldKey = extractR2KeyFromUrl(existing.imageUrl);
    } else if (removeImage) {
      imageUrl = '';
      replacedOldKey = extractR2KeyFromUrl(existing.imageUrl);
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        title,
        description: description || null,
        imageUrl,
      },
    });

    if (replacedOldKey && replacedOldKey !== uploadedKey) {
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: replacedOldKey,
          })
        );
      } catch (deleteErr) {
        console.error('No se pudo eliminar imagen anterior de R2:', deleteErr);
      }
    }

    return new Response(JSON.stringify({ project, key: uploadedKey }), {
      status: 200,
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

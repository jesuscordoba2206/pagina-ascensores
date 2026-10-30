import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSessionUser, requireEnterpriseRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getR2Client } from '@/lib/r2';
import { buildContentDisposition, buildPublicUrl, sanitizeFileName } from '@/lib/reports';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SCOPE_GLOBAL = 'GLOBAL';
const SCOPE_SPECIFIC = 'SPECIFIC';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getErrorStatus(err, fallback = 500) {
  return Number.isInteger(err?.status) ? err.status : fallback;
}

function getErrorMessage(err, fallback = 'Error inesperado') {
  if (typeof err?.message === 'string' && err.message.trim()) return err.message;
  if (typeof err === 'string' && err.trim()) return err;
  return fallback;
}

function normalizeScope(value) {
  const normalized = String(value || '').trim().toUpperCase();
  return normalized === SCOPE_SPECIFIC ? SCOPE_SPECIFIC : SCOPE_GLOBAL;
}

function parseAllowedUserIds(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return [...new Set(value.map((item) => String(item || '').trim()).filter(Boolean))];
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return [...new Set(parsed.map((item) => String(item || '').trim()).filter(Boolean))];
      }
    } catch {
      return [...new Set(trimmed.split(',').map((item) => item.trim()).filter(Boolean))];
    }
  }

  return [];
}

function mapFileForResponse(file) {
  return {
    id: file.id,
    fileName: file.fileName,
    size: file.size || null,
    scope: file.scope,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
    allowedUserIds: Array.isArray(file.allowedUsers) ? file.allowedUsers.map((entry) => entry.userId) : [],
    allowedUsers: Array.isArray(file.allowedUsers)
      ? file.allowedUsers
        .map((entry) => entry.user)
        .filter(Boolean)
        .map((user) => ({ id: user.id, name: user.name || null, email: user.email }))
      : [],
  };
}

async function validateClientUsersOrThrow(userIds) {
  if (!Array.isArray(userIds) || userIds.length === 0) return [];

  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
      role: 'CLIENTE',
    },
    select: { id: true },
  });

  const validIds = users.map((user) => user.id);
  if (validIds.length !== userIds.length) {
    throw httpError(400, 'Uno o más usuarios seleccionados no son clientes válidos.');
  }

  return validIds;
}

export async function GET(request) {
  const session = await getSessionUser(request);
  if (!session) return json({ error: 'Forbidden' }, 403);

  try {
    const isEnterprise = session.role === 'EMPRESA';
    const where = isEnterprise
      ? undefined
      : {
        OR: [
          { scope: SCOPE_GLOBAL },
          { scope: SCOPE_SPECIFIC, allowedUsers: { some: { userId: session.id } } },
        ],
      };

    const files = await prisma.ivtPdfFile.findMany({
      where,
      include: {
        allowedUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const payload = isEnterprise
      ? files.map(mapFileForResponse)
      : files.map((file) => ({
        id: file.id,
        fileName: file.fileName,
        size: file.size || null,
        scope: file.scope,
        createdAt: file.createdAt,
      }));

    return json({ files: payload });
  } catch (err) {
    return json({ error: getErrorMessage(err) }, getErrorStatus(err));
  }
}

export async function POST(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  let r2;
  try {
    r2 = getR2Client();
  } catch (configErr) {
    return json({ error: configErr.message }, 503);
  }

  let uploadedKey = null;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const scope = normalizeScope(formData.get('scope'));
    const requestedUserIds = parseAllowedUserIds(formData.get('allowedUserIds'));

    if (!file || !(file instanceof File)) {
      return json({ error: 'Missing file upload' }, 400);
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return json({ error: 'Only PDF files are allowed' }, 400);
    }

    const allowedUserIds = scope === SCOPE_SPECIFIC ? await validateClientUsersOrThrow(requestedUserIds) : [];

    if (scope === SCOPE_SPECIFIC && allowedUserIds.length === 0) {
      return json({ error: 'Debes seleccionar al menos un cliente para alcance específico.' }, 400);
    }

    const timestamp = Date.now();
    const fileName = sanitizeFileName(file.name);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `itv-pdf/${timestamp}-${safeName}`;
    uploadedKey = key;

    const buffer = Buffer.from(await file.arrayBuffer());
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: 'application/pdf',
        ContentDisposition: buildContentDisposition(fileName),
      })
    );

    const url = buildPublicUrl(key);
    const created = await prisma.ivtPdfFile.create({
      data: {
        fileName,
        key,
        url,
        size: buffer.length,
        scope,
        allowedUsers: scope === SCOPE_SPECIFIC
          ? {
            create: allowedUserIds.map((userId) => ({ userId })),
          }
          : undefined,
      },
      include: {
        allowedUsers: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return json({ file: mapFileForResponse(created) }, 201);
  } catch (err) {
    if (uploadedKey) {
      try {
        await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: uploadedKey }));
      } catch (cleanupErr) {
        console.error('No se pudo limpiar archivo ITV tras error:', cleanupErr);
      }
    }

    return json({ error: getErrorMessage(err) }, getErrorStatus(err));
  }
}

export async function PUT(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const id = String(body?.id || '').trim();
    const scope = normalizeScope(body?.scope);
    const requestedUserIds = parseAllowedUserIds(body?.allowedUserIds);

    if (!id) {
      return json({ error: 'Missing file id' }, 400);
    }

    const existing = await prisma.ivtPdfFile.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return json({ error: 'Archivo no encontrado' }, 404);
    }

    const allowedUserIds = scope === SCOPE_SPECIFIC ? await validateClientUsersOrThrow(requestedUserIds) : [];
    if (scope === SCOPE_SPECIFIC && allowedUserIds.length === 0) {
      return json({ error: 'Debes seleccionar al menos un cliente para alcance específico.' }, 400);
    }

    await prisma.ivtPdfAccess.deleteMany({ where: { fileId: id } });

    await prisma.ivtPdfFile.update({
      where: { id },
      data: { scope },
    });

    if (scope === SCOPE_SPECIFIC) {
      await Promise.all(
        allowedUserIds.map((userId) => prisma.ivtPdfAccess.create({
          data: {
            fileId: id,
            userId,
          },
        }))
      );
    }

    const updated = await prisma.ivtPdfFile.findUnique({
      where: { id },
      include: {
        allowedUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return json({ file: mapFileForResponse(updated) });
  } catch (err) {
    return json({ error: getErrorMessage(err) }, getErrorStatus(err));
  }
}

export async function DELETE(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  let r2;
  try {
    r2 = getR2Client();
  } catch {
    r2 = null;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = String(searchParams.get('id') || '').trim();

    if (!id) {
      return json({ error: 'Missing file id' }, 400);
    }

    const existing = await prisma.ivtPdfFile.findUnique({
      where: { id },
      select: { id: true, key: true },
    });

    if (!existing) {
      return json({ error: 'Archivo no encontrado' }, 404);
    }

    await prisma.ivtPdfFile.delete({ where: { id } });

    if (r2 && existing.key) {
      try {
        await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: existing.key }));
      } catch (deleteErr) {
        console.error('No se pudo eliminar PDF ITV de R2:', deleteErr);
      }
    }

    return json({ deleted: true });
  } catch (err) {
    return json({ error: getErrorMessage(err) }, getErrorStatus(err));
  }
}

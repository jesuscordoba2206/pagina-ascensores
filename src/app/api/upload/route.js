import { requireEnterpriseRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client } from '@/lib/r2';
import {
  buildContentDisposition,
  buildPublicUrl,
  normalizeMonthKey,
  sanitizeFileName,
} from '@/lib/reports';

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
    const category = String(formData.get('category') || 'reports').replace(/^\/+|\/+$/g, '');
    const equipmentId = String(formData.get('equipmentId') || '').trim();
    const monthKey = normalizeMonthKey(formData.get('month'));
    const rawYear = formData.get('year');
    const parsedYear = rawYear ? Number(rawYear) : null;
    const year = Number.isInteger(parsedYear) ? parsedYear : new Date().getFullYear();

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

    let equipment = null;
    if (equipmentId) {
      if (!monthKey) {
        return new Response(JSON.stringify({ error: 'Month is required when equipmentId is provided' }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
      }

      equipment = await prisma.equipment.findUnique({
        where: { id: equipmentId },
        select: { id: true, userId: true },
      });
      if (!equipment) {
        return new Response(JSON.stringify({ error: 'Equipment not found' }), {
          status: 404, headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const fileName = sanitizeFileName(file.name);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    // The client is derived from the equipment owner on the server so an
    // arbitrary category value cannot be used to write outside the reports tree.
    const baseCategory = equipment ? `reports/${equipment.userId}` : (category || 'reports');
    const key = equipment && monthKey
      ? `${baseCategory}/${equipment.id}/${monthKey}/${timestamp}-${sanitizedName}`
      : `${baseCategory}/${timestamp}-${sanitizedName}`;

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

    if (equipmentId && equipment) {
      let reportFile;
      try {
        reportFile = await prisma.reportFile.create({
          data: {
            equipmentId: equipment.id,
            month: monthKey,
            year,
            fileName,
            key,
            url,
            size: buffer.length,
          },
        });
      } catch (dbErr) {
        // Best-effort cleanup of the just-uploaded file
        try {
          await r2.send(
            new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key })
          );
        } catch (cleanupErr) {
          console.error('No se pudo limpiar archivo tras error de BD:', cleanupErr);
        }
        throw dbErr;
      }

      return new Response(JSON.stringify({ url, key, month: monthKey, year, file: reportFile }), {
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

import path from 'path';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { Readable } from 'stream';
import { validateCatalogAccessToken } from '@/lib/catalogAccess';

export const runtime = 'nodejs';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseByteRange(rangeHeader, fileSize) {
  if (!rangeHeader || !rangeHeader.startsWith('bytes=')) return null;

  const rawRanges = rangeHeader.replace('bytes=', '').split(',');
  if (rawRanges.length !== 1) return null;

  const [startValue, endValue] = rawRanges[0].trim().split('-');
  if (typeof startValue === 'undefined' || typeof endValue === 'undefined') return null;

  if (!startValue) {
    const suffixLength = Number(endValue);
    if (Number.isNaN(suffixLength) || suffixLength <= 0) return null;

    const length = Math.min(suffixLength, fileSize);
    return {
      start: Math.max(fileSize - length, 0),
      end: fileSize - 1,
    };
  }

  const start = Number(startValue);
  if (Number.isNaN(start) || start < 0 || start >= fileSize) return null;

  if (!endValue) {
    return {
      start,
      end: fileSize - 1,
    };
  }

  const end = Number(endValue);
  if (Number.isNaN(end) || end < start) return null;

  return {
    start,
    end: Math.min(end, fileSize - 1),
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = String(searchParams.get('token') || '').trim();

  if (!validateCatalogAccessToken(token)) {
    return json({ error: 'Invalid or expired token' }, 403);
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'itv catalogo.pdf');
    const fileStats = await stat(filePath);
    const fileSize = fileStats.size;
    const rangeHeader = request.headers.get('range') || '';

    const baseHeaders = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="catalogo-itv.pdf"',
      'Cache-Control': 'private, no-store',
      'Accept-Ranges': 'bytes',
      'X-Content-Type-Options': 'nosniff',
    };

    if (rangeHeader) {
      const range = parseByteRange(rangeHeader, fileSize);
      if (!range) {
        return new Response(null, {
          status: 416,
          headers: {
            ...baseHeaders,
            'Content-Range': `bytes */${fileSize}`,
          },
        });
      }

      const { start, end } = range;
      const chunkSize = end - start + 1;
      const fileStream = createReadStream(filePath, { start, end });

      return new Response(Readable.toWeb(fileStream), {
        status: 206,
        headers: {
          ...baseHeaders,
          'Content-Length': String(chunkSize),
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        },
      });
    }

    const fileStream = createReadStream(filePath);

    return new Response(Readable.toWeb(fileStream), {
      status: 200,
      headers: {
        ...baseHeaders,
        'Content-Length': String(fileSize),
      },
    });
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return json({ error: 'Archivo no encontrado' }, 404);
    }

    console.error('Catalog view error:', error);
    return json({ error: 'No se pudo cargar el catalogo' }, 500);
  }
}

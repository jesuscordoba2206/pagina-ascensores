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
      const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
      if (!match) {
        return new Response(null, {
          status: 416,
          headers: {
            ...baseHeaders,
            'Content-Range': `bytes */${fileSize}`,
          },
        });
      }

      let start = match[1] ? Number(match[1]) : 0;
      let end = match[2] ? Number(match[2]) : fileSize - 1;

      if (
        Number.isNaN(start)
        || Number.isNaN(end)
        || start < 0
        || end < start
        || start >= fileSize
      ) {
        return new Response(null, {
          status: 416,
          headers: {
            ...baseHeaders,
            'Content-Range': `bytes */${fileSize}`,
          },
        });
      }

      end = Math.min(end, fileSize - 1);
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

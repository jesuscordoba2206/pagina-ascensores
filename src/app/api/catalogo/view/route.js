import path from 'path';
import { readFile } from 'fs/promises';
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
    const buffer = await readFile(filePath);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="catalogo-itv.pdf"',
        'Content-Length': String(buffer.length),
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
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

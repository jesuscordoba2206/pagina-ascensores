import { prisma } from '@/lib/prisma';
import { normalizeEmail, normalizeOptionalText, requireEnterpriseRole, sanitizeUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { equipments: { orderBy: { createdAt: 'desc' } } },
      });
      return new Response(JSON.stringify(sanitizeUser(user)), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const clients = await prisma.user.findMany({
      where: { role: 'CLIENTE' },
      include: { equipments: true },
      orderBy: { createdAt: 'desc' },
    });
    return new Response(JSON.stringify(clients.map(sanitizeUser)), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function PUT(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { id, name, email, building } = body;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing user id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: typeof name === 'string' ? normalizeOptionalText(name) : undefined,
        email: typeof email === 'string' ? normalizeEmail(email) : undefined,
        building: typeof building === 'string' ? normalizeOptionalText(building) : undefined,
      },
      include: { equipments: true },
    });
    return new Response(JSON.stringify(sanitizeUser(updated)), { status: 200, headers: { 'Content-Type': 'application/json' } });
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
      return new Response(JSON.stringify({ error: 'Missing user id' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const deleted = await prisma.user.delete({ where: { id } });
    return new Response(JSON.stringify(deleted), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[cliente DELETE] Error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}


export async function POST(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { name, email, building, address, equipments = [] } = body;
    
    return new Response(JSON.stringify({ error: 'Use /api/register-client instead' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

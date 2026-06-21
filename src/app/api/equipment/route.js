import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.equipment.findMany();
    return new Response(JSON.stringify(items), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const created = await prisma.equipment.create({ data: body });
    return new Response(JSON.stringify(created), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, internalCode, ...data } = body;
    if (!id && !internalCode) {
      return new Response(JSON.stringify({ error: 'Missing id or internalCode' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const where = id ? { id } : { internalCode };
    const updated = await prisma.equipment.update({ where, data });
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const internalCode = searchParams.get('internalCode');
    if (!id && !internalCode) {
      return new Response(JSON.stringify({ error: 'Missing id or internalCode' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const where = id ? { id } : { internalCode };
    const deleted = await prisma.equipment.delete({ where });
    return new Response(JSON.stringify(deleted), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

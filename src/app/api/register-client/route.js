import { prisma } from '@/lib/prisma';
import { normalizeEmail, normalizeOptionalText, requireEnterpriseRole } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  const unauthorized = await requireEnterpriseRole(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { name, email, password, building, equipments = [] } = body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedName = normalizeOptionalText(name);
    const normalizedBuilding = normalizeOptionalText(building);

    if (!normalizedName || !normalizedEmail || typeof password !== 'string' || !password) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const equipmentList = Array.isArray(equipments) ? equipments : [];

    const newClient = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        role: 'CLIENTE',
        name: normalizedName,
        building: normalizedBuilding,
      },
    });

    for (const item of equipmentList) {
      if (!item || !item.internalCode || !item.type) continue;

      await prisma.equipment.create({
        data: {
          userId: newClient.id,
          internalCode: String(item.internalCode).trim(),
          type: String(item.type).trim(),
          motorBrand: normalizeOptionalText(item.motorBrand),
          controlBrand: normalizeOptionalText(item.controlBrand),
          cableType: normalizeOptionalText(item.cableType),
          cableGauge: normalizeOptionalText(item.cableGauge),
          maxWeight: item.maxWeight === '' || item.maxWeight == null ? undefined : Number(item.maxWeight),
          capacity: item.capacity === '' || item.capacity == null ? undefined : Number(item.capacity),
        },
      });
    }

    return new Response(JSON.stringify({ id: newClient.id, email: newClient.email, name: newClient.name, building: newClient.building }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[register-client] Error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

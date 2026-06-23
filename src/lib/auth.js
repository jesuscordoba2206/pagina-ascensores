import { prisma } from '@/lib/prisma';

export function normalizeEmail(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

export function normalizeRole(value) {
  if (typeof value !== 'string') return 'CLIENTE';
  const normalizedRole = value.trim().toUpperCase();
  return normalizedRole || 'CLIENTE';
}

export function normalizeOptionalText(value) {
  if (typeof value !== 'string') return undefined;
  return value.trim();
}

export function sanitizeUser(user) {
  if (!user) return null;

  return {
    ...user,
    email: normalizeEmail(user.email),
    password: typeof user.password === 'string' ? user.password.trim() : user.password,
    role: normalizeRole(user.role),
    name: typeof user.name === 'string' ? user.name.trim() : user.name,
    building: typeof user.building === 'string' ? user.building.trim() : user.building,
  };
}

export async function findUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      name: true,
      building: true,
      createdAt: true,
    },
  });
  return sanitizeUser(user);
}

export async function getSessionUser(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parseCookies(cookieHeader);
  const userEmail = normalizeEmail(cookies.userEmail || cookies.email || '');
  if (!userEmail) return null;
  return findUserByEmail(userEmail);
}

export function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach((pair) => {
    const [key, ...value] = pair.trim().split('=');
    cookies[key] = decodeURIComponent(value.join('='));
  });
  return cookies;
}

export async function getUserByRequest(request) {
  return getSessionUser(request);
}

export async function getSessionRole(request) {
  const user = await getUserByRequest(request);
  return normalizeRole(user?.role);
}

export async function requireEnterpriseRole(request) {
  const user = await getUserByRequest(request);
  if (!user || normalizeRole(user.role) !== 'EMPRESA') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}

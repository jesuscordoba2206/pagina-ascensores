import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'userEmail';

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

export function toPublicUser(user) {
  if (!user) return null;

  const sanitized = sanitizeUser(user);
  const { password, ...publicUser } = sanitized;
  return publicUser;
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not configured');
  }
  return secret;
}

function createSignature(payload) {
  return crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

function safeCompare(a, b) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function createSessionCookieValue(email) {
  const payload = Buffer.from(normalizeEmail(email)).toString('base64url');
  const signature = createSignature(payload);
  return `${payload}.${signature}`;
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function buildSessionCookie(email) {
  const cookieValue = encodeURIComponent(createSessionCookieValue(email));
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${secure}`;
}

function readSignedSessionEmail(cookies) {
  const rawValue = cookies[SESSION_COOKIE_NAME] || cookies.email || '';
  if (!rawValue) return '';

  const separatorIndex = rawValue.lastIndexOf('.');
  if (separatorIndex === -1) return '';

  const payload = rawValue.slice(0, separatorIndex);
  const signature = rawValue.slice(separatorIndex + 1);
  if (!payload || !signature) return '';

  const expectedSignature = createSignature(payload);
  if (!safeCompare(signature, expectedSignature)) return '';

  try {
    return normalizeEmail(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return '';
  }
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
  const userEmail = readSignedSessionEmail(cookies);
  if (!userEmail) return null;
  return findUserByEmail(userEmail);
}

export function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach((pair) => {
    const [key, ...value] = pair.trim().split('=');
    try {
      cookies[key] = decodeURIComponent(value.join('='));
    } catch {
      cookies[key] = value.join('=');
    }
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

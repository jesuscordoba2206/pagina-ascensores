import crypto from 'crypto';

const CATALOGO_SCOPE = 'catalogo-view';
const TOKEN_TTL_MS = 5 * 60 * 1000;

function getCatalogSecret() {
  return process.env.CATALOGO_VIEW_SECRET || process.env.SESSION_SECRET || '';
}

function sign(payload) {
  const secret = getCatalogSecret();
  if (!secret) {
    throw new Error('SESSION_SECRET or CATALOGO_VIEW_SECRET is not configured');
  }

  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeCompare(a, b) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function createCatalogAccessToken() {
  const payload = Buffer.from(
    JSON.stringify({
      scope: CATALOGO_SCOPE,
      exp: Date.now() + TOKEN_TTL_MS,
    })
  ).toString('base64url');

  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function validateCatalogAccessToken(token) {
  if (!token || typeof token !== 'string') return false;

  const separatorIndex = token.lastIndexOf('.');
  if (separatorIndex <= 0) return false;

  const payload = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  if (!payload || !signature) return false;

  const expectedSignature = sign(payload);
  if (!safeCompare(signature, expectedSignature)) return false;

  try {
    const parsedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (parsedPayload.scope !== CATALOGO_SCOPE) return false;
    if (typeof parsedPayload.exp !== 'number') return false;
    return Date.now() < parsedPayload.exp;
  } catch {
    return false;
  }
}

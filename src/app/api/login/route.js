import bcrypt from 'bcryptjs';
import { buildSessionCookie, findUserByEmail, normalizeEmail, normalizeRole } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || typeof password !== 'string' || !password) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing credentials' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid credentials' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid credentials' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const headers = new Headers();
    headers.append('Set-Cookie', buildSessionCookie(user.email));
    headers.append('Content-Type', 'application/json');

    return new Response(JSON.stringify({ ok: true, role: normalizeRole(user.role) }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

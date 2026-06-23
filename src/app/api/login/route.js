import bcrypt from 'bcryptjs';
import { findUserByEmail, normalizeEmail, normalizeRole } from '@/lib/auth';

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

    // Set a cookie with the user's email to identify session for this simple example
    const headers = new Headers();
    const cookieValue = encodeURIComponent(user.email);
    // HttpOnly so client JS cannot read it. Include SameSite and Path for basic safety.
    headers.append('Set-Cookie', `userEmail=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`);
    headers.append('Content-Type', 'application/json');

    return new Response(JSON.stringify({ ok: true, role: normalizeRole(user.role) }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

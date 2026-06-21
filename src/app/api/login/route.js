import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing credentials' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const user = await prisma.user.findUnique({ where: { email } });
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

    return new Response(JSON.stringify({ ok: true, role: user.role }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

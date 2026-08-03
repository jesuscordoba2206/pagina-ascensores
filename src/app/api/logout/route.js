import { getSessionCookieName } from '@/lib/auth';

export async function POST() {
  try {
    const cookieName = getSessionCookieName();
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    const cookie = `${cookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

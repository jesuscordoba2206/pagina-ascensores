import { getSessionUser, normalizeRole } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getSessionUser(request);

    if (!user) {
      return new Response(JSON.stringify({ role: 'CLIENTE' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ id: user.id, role: normalizeRole(user?.role), email: user.email, name: user.name || null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ role: 'CLIENTE', error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

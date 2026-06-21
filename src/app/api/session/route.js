import { prisma } from '@/lib/prisma';

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach((pair) => {
    const [k, ...v] = pair.trim().split('=');
    cookies[k] = decodeURIComponent(v.join('='));
  });
  return cookies;
}

export async function GET(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = parseCookies(cookieHeader);
    const userEmail = cookies.userEmail || cookies.email || null;

    if (!userEmail) {
      return new Response(JSON.stringify({ role: 'CLIENTE' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });

    return new Response(JSON.stringify({ role: user?.role || 'CLIENTE' }), {
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

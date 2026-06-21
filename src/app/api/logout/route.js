export async function POST() {
  try {
    // Clear the userEmail cookie by setting Max-Age=0; adjust path/domain as needed
    const headers = new Headers();
    headers.append('Set-Cookie', 'userEmail=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax');

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Set-Cookie': 'userEmail=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

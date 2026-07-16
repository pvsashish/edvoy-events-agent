// Vercel Edge Middleware — auth gate in front of the page AND every /api route.
// Unauthenticated -> redirect pages to /login, return 401 for /api/*.
// /login and /api/auth stay reachable so a signed-out user can reach the form.
//
// Edge runtime can't use `jsonwebtoken` (Node crypto) — the HS256 token minted
// by /api/auth is verified here with Web Crypto. Same SESSION_SECRET, standard
// JWT, so the two verifiers interoperate.

const SESSION_COOKIE = 'edvoy_events_session';

const PUBLIC_PATHS = new Set(['/login', '/login.html', '/api/auth', '/robots.txt', '/favicon.ico']);

export const config = {
  matcher: ['/((?!_next/|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js|woff2?|map)$).*)'],
};

export default async function middleware(request) {
  const { pathname } = new URL(request.url);

  if (PUBLIC_PATHS.has(pathname)) return;

  const token = readCookie(request.headers.get('cookie'), SESSION_COOKIE);
  const valid = await verifyJwt(token, globalThis.process?.env?.SESSION_SECRET);

  if (valid) return;

  if (pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  const loginUrl = new URL('/login', request.url);
  return Response.redirect(loginUrl, 302);
}

function readCookie(cookieHeader, name) {
  for (const part of String(cookieHeader || '').split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
  }
  return null;
}

async function verifyJwt(token, secret) {
  if (!token || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [h, p, s] = parts;
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const ok = await crypto.subtle.verify('HMAC', key, base64urlToBytes(s), enc.encode(`${h}.${p}`));
    if (!ok) return false;
    const payload = JSON.parse(new TextDecoder().decode(base64urlToBytes(p)));
    if (payload.exp && Math.floor(Date.now() / 1000) >= payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

function base64urlToBytes(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64url.length + 3) % 4);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

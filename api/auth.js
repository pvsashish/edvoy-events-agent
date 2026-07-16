// POST /api/auth — exchange the shared password for a session cookie.
//   { action: 'login', password }  -> 200 + Set-Cookie (signed HttpOnly session)
//   { action: 'logout' }           -> 200 + cleared cookie
// Left reachable without a session by middleware so the login page can call it.

import {
  authConfigured, passwordMatches, signSession,
  sessionCookie, clearedSessionCookie,
} from './lib/session.js';

// Best-effort per-instance rate limit to blunt password guessing.
const attempts = new Map(); // ip -> { count, first }
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;

function rateLimited(ip) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: now });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!authConfigured()) {
    res.status(503).json({ error: 'Auth not configured (DASHBOARD_PASSWORD, SESSION_SECRET)' });
    return;
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress || 'unknown';

  let body = {};
  try {
    body = await readJson(req);
  } catch {
    res.status(400).json({ error: 'Request body must be valid JSON' });
    return;
  }

  const action = String(body.action || 'login');

  if (action === 'logout') {
    res.setHeader('Set-Cookie', clearedSessionCookie());
    res.status(200).json({ ok: true });
    return;
  }

  if (rateLimited(ip)) {
    res.setHeader('Retry-After', '60');
    res.status(429).json({ error: 'Too many attempts. Try again in a minute.' });
    return;
  }

  if (!passwordMatches(body.password)) {
    res.status(401).json({ error: 'Incorrect password' });
    return;
  }

  res.setHeader('Set-Cookie', sessionCookie(signSession('events-agent')));
  res.status(200).json({ ok: true });
}

function readJson(req) {
  // In serverless (Vercel) req.body is already parsed; local dev may pass a stream.
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 100_000) reject(new Error('body too large'));
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { reject(new Error('bad json')); }
    });
    req.on('error', reject);
  });
}

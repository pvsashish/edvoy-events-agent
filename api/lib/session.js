// Session + auth helpers (Node runtime: serverless functions and local `vercel dev`).
// Single shared password (DASHBOARD_PASSWORD) exchanged for a signed, HttpOnly
// session cookie. middleware.js (edge) verifies the same JWT with Web Crypto.

import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

export const SESSION_COOKIE = 'edvoy_events_session';
const SESSION_TTL = '12h';

function secret() {
  const s = process.env.SESSION_SECRET || '';
  if (!s || s.length < 16) {
    throw new Error('SESSION_SECRET is missing or too short (need a long random value)');
  }
  return s;
}

export function authConfigured() {
  return Boolean(process.env.DASHBOARD_PASSWORD && process.env.SESSION_SECRET);
}

/** Constant-time password check. Never leaks length via early return. */
export function passwordMatches(candidate) {
  const expected = process.env.DASHBOARD_PASSWORD || '';
  if (!expected) return false;
  const a = crypto.createHash('sha256').update(String(candidate ?? ''), 'utf8').digest();
  const b = crypto.createHash('sha256').update(expected, 'utf8').digest();
  return crypto.timingSafeEqual(a, b);
}

export function signSession(subject = 'events-agent') {
  return jwt.sign({ sub: subject }, secret(), { expiresIn: SESSION_TTL });
}

/** Returns the decoded payload, or null if missing/invalid/expired. */
export function verifySession(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, secret());
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader = '') {
  const out = {};
  for (const part of String(cookieHeader || '').split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

export function sessionCookie(token, { maxAgeSeconds = 12 * 60 * 60 } = {}) {
  return [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ].join('; ');
}

export function clearedSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

/** True when the request carries a valid session cookie. */
export function isAuthenticated(req) {
  const cookies = parseCookies(req.headers?.cookie || '');
  return Boolean(verifySession(cookies[SESSION_COOKIE]));
}

# Operations — Edvoy Events Agent

**Last updated:** 2026-07-16 (shared-password login gate — new env vars + first-time setup) · earlier same day: Replace-delete now scoped to the selected platform only · 2026-07-08 (Scout self-serve uploader — removing a bad upload) · 2026-06-30 (AI provider → Anthropic Sonnet 4.6)

## Run Locally
```bash
cd /Users/ashish/Documents/events-agent
npm install
# Requires .env with ANTHROPIC_API_KEY, DATABASE_URL, DASHBOARD_PASSWORD, SESSION_SECRET
npx vercel@latest dev --listen 3333
# App at http://localhost:3333 — you'll land on /login first (shared team password)
```

`.env` minimum:
```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://...  # Neon connection string
DASHBOARD_PASSWORD=<shared team password>  # the login gate — real value lives only in .env / Vercel env, never committed
SESSION_SECRET=<long random string>  # e.g. `openssl rand -hex 32`
```
Without both `DASHBOARD_PASSWORD` and `SESSION_SECRET`, `/api/auth` responds `503` and the app is unreachable behind the gate (see Troubleshooting).

## Deploy
```bash
# Subsequent deploys — Vercel auto-deploys on push to main
git push

# Manual prod deploy
npx vercel@latest --prod --yes
```

## Add / Update Env Vars on Vercel
```bash
echo "VALUE" | npx vercel@latest env add ANTHROPIC_API_KEY production
echo "VALUE" | npx vercel@latest env add DATABASE_URL production
echo "VALUE" | npx vercel@latest env add DASHBOARD_PASSWORD production
echo "VALUE" | npx vercel@latest env add SESSION_SECRET production
```

## Neon PostgreSQL Setup (first time)
1. Create project at neon.tech
2. Copy connection string (pooled)
3. Add as `DATABASE_URL` in `.env` and Vercel env vars
4. Table `edvoy_specs_history` is auto-created on first request to `/api/history`

## Preview Server (Claude Code)
```bash
# .claude/launch.json configured — use preview_start tool
# Or manually:
npx vercel@latest dev --listen 3333
```

## Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| `AI analysis failed` | Bad/missing `ANTHROPIC_API_KEY` | Check `.env` and Vercel env vars |
| `Anthropic 401` | Invalid/revoked API key | Regenerate at console.anthropic.com, update `.env` + Vercel |
| `Anthropic 429` | Rate limit hit | `anthropicWithRetry` backs off; if persistent, slow down or check usage tier |
| Events array empty | Model returned non-JSON | Retry; check prompt in `prompts/ga4.js` or `prompts/amplitude.js` |
| Image too large | Base64 payload >4MB | Compress screenshot before upload |
| `Method not allowed` on `/api/analyze` | GET instead of POST | Always POST |
| History tab shows empty / localStorage fallback | `DATABASE_URL` missing | Add Neon connection string to env |
| `Database operation failed` | Neon pool exhausted or cold start | Retry once; check Neon dashboard |
| 404 on `/` in production | `outputDirectory` misconfigured | Verify `vercel.json` has `"outputDirectory": "public"` |
| Model not found / 404 | Model ID changed/retired | Update `ANTHROPIC_MODEL` in `api/analyze.js` — check docs.claude.com model list |
| Bad/duplicate Scout upload needs removing | Self-serve uploader is **add-only** (no per-record delete, no approval gate) | Re-upload that whole category with **Replace** ticked (wipes + re-adds **only the records on the platform you're uploading to**, as of the 2026-07-16 platform-scope fix — the other platform's records for that category are left alone), or `DELETE /api/screens` by `id` (get ids from `GET /api/screens`). Note: local `vercel dev` shares the live DB. |
| `/api/auth` returns `503 Auth not configured` | `DASHBOARD_PASSWORD` or `SESSION_SECRET` missing from env | Set both in `.env` (local) and Vercel Production env vars, then redeploy/restart |
| Stuck redirecting to `/login` even with the right password | Session cookie not being set/read — check `SESSION_SECRET` matches between `api/lib/session.js` (Node) and `middleware.js` (Edge); check the cookie isn't blocked (`Secure` flag needs HTTPS — fine on Vercel, also fine on `localhost` per browser exception) | Confirm via `curl -c cookies.txt -X POST /api/auth -d '{"action":"login","password":"..."}'` then reuse `-b cookies.txt` on `/` |
| Whole app unreachable after adding the login gate | `middleware.js` matcher is too broad, or `SESSION_SECRET` rotated without re-issuing sessions | Everyone with an old session cookie gets redirected to `/login` and just needs to sign in again — not a bug, expected after rotating the secret |

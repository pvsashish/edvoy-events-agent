# Operations — Edvoy Events Agent

**Last updated:** 2026-07-16 (Replace-delete now scoped to the selected platform only) · earlier: 2026-07-08 (Scout self-serve uploader — removing a bad upload) · 2026-06-30 (AI provider → Anthropic Sonnet 4.6)

## Run Locally
```bash
cd /Users/ashish/Documents/events-agent
npm install
# Requires .env with ANTHROPIC_API_KEY and DATABASE_URL
npx vercel@latest dev --listen 3333
# App at http://localhost:3333
```

`.env` minimum:
```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://...  # Neon connection string
```

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

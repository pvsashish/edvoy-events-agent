# Operations — Edvoy Events Agent

**Last updated:** 2026-06-08

## Run Locally
```bash
cd /Users/ashish/Documents/events-agent
npm install
# Requires .env with GROQ_API_KEY and DATABASE_URL
npx vercel@latest dev --listen 3333
# App at http://localhost:3333
```

`.env` minimum:
```
GROQ_API_KEY=gsk_...
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
echo "VALUE" | npx vercel@latest env add GROQ_API_KEY production
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
| `AI analysis failed` | Bad/missing `GROQ_API_KEY` | Check `.env` and Vercel env vars |
| Events array empty | Model returned non-JSON | Retry; check prompt in `prompts/ga4.js` or `prompts/amplitude.js` |
| Image too large | Base64 payload >4MB | Compress screenshot before upload |
| `Method not allowed` on `/api/analyze` | GET instead of POST | Always POST |
| History tab shows empty / localStorage fallback | `DATABASE_URL` missing | Add Neon connection string to env |
| `Database operation failed` | Neon pool exhausted or cold start | Retry once; check Neon dashboard |
| 404 on `/` in production | `outputDirectory` misconfigured | Verify `vercel.json` has `"outputDirectory": "public"` |
| Model decommissioned error | Groq retired the model | Update model ID in `api/analyze.js` — check console.groq.com/docs/deprecations |

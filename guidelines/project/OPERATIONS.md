# Operations — Edvoy Events Agent

**Last updated:** 2026-06-07

## Run Locally
```bash
cd /Users/ashish/Documents/events-agent
npm install
npx vercel dev
# App at http://localhost:3000
```
Requires `.env` with `GROQ_API_KEY`.

## Deploy
```bash
# First time
npx vercel --prod

# Subsequent
git push  # Vercel auto-deploys on push to main
```

## Add/Update Env Vars on Vercel
```bash
npx vercel env add GROQ_API_KEY
```

## Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| `AI analysis failed` | Bad/missing GROQ_API_KEY | Check `.env` and Vercel env vars |
| Events array empty | Model returned non-JSON | Check prompt, try different screenshot |
| Image too large | Base64 payload >4MB | Compress screenshot before upload |
| `Method not allowed` | GET to `/api/analyze` | Always POST |

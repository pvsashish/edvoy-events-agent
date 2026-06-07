# Architecture — Edvoy Events Agent

**Last updated:** 2026-06-07

## What It Does
PM tool for Edvoy's analytics team. Upload screenshots of Edvoy web portal or mobile app, select GA4 or Amplitude, and receive correctly formatted analytics events + parameters matching the tracking sheet format.

## Users
Edvoy product managers and analytics team.

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18 (ESM via esm.sh, no build step) |
| Backend | Vercel serverless functions (Node.js ESM) |
| AI | Groq Vision API — `llama-3.2-11b-vision-preview` |
| Hosting | Vercel (static frontend + serverless) |
| Storage | GitHub repo |

## File Structure
```
events-agent/
├── api/
│   └── analyze.js          ← Vercel serverless function — receives images + platform, calls Groq, returns events JSON
├── client/
│   ├── index.html          ← Entry point served as static
│   └── App.jsx             ← Full React app (no bundler — ESM imports from esm.sh)
├── prompts/
│   ├── ga4.js              ← GA4_PROMPT constant — system prompt for GA4 event naming
│   └── amplitude.js        ← AMP_PROMPT constant — system prompt for Amplitude event naming
├── guidelines/             ← Project continuity docs (committed to GitHub)
├── vercel.json             ← Routing: /api/* → serverless, everything else → static
├── .env                    ← Local only (gitignored)
├── .gitignore
└── package.json
```

## Environment Variables
| Variable | Where | Purpose |
|----------|-------|---------|
| `GROQ_API_KEY` | `.env` + Vercel env | Groq API authentication |

## Key Design Decisions
- **No bundler**: React loaded via `esm.sh` CDN. Zero build complexity, instant Vercel deploy.
- **Base64 images**: Screenshots converted to data URLs client-side, sent in POST body. No file storage needed.
- **Groq vision**: `llama-3.2-11b-vision-preview` — fast, cheap, handles UI screenshots well.
- **JSON parse fallback**: API response may wrap JSON in markdown fences — regex fallback extracts array.

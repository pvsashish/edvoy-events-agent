# Architecture — Edvoy Events Agent

**Last updated:** 2026-06-07

## What It Does
PM tool for Edvoy's analytics team. Upload screenshots or videos of Edvoy web portal or mobile app, select GA4 or Amplitude, and receive correctly formatted analytics events + parameters matching the tracking sheet format (Category, Old Event Name, Suggested Event Name, Parameter, Sample Value).

## Users
Edvoy product managers and analytics team.

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18 (UMD via unpkg CDN + Babel standalone — no build step) |
| Backend | Vercel serverless functions (Node.js ESM) |
| AI | Groq API — `meta-llama/llama-4-scout-17b-16e-instruct` (vision) |
| Hosting | Vercel (static from `public/` + serverless from `api/`) |
| Storage | GitHub repo |

## File Structure
```
events-agent/
├── api/
│   └── analyze.js          ← Vercel serverless — POST handler, calls Groq, returns events JSON
├── public/
│   ├── index.html          ← Entry point (Vercel serves public/ as static root)
│   └── app.jsx             ← Full React app loaded via Babel standalone (light mode, Edvoy brand)
├── prompts/
│   ├── ga4.js              ← GA4_PROMPT — system prompt with tracking sheet format spec
│   └── amplitude.js        ← AMP_PROMPT — system prompt with tracking sheet format spec
├── guidelines/             ← Project continuity docs (committed to GitHub)
├── .claude/
│   └── launch.json         ← Preview server config (port 3333)
├── vercel.json             ← outputDirectory: public, api/* rewrites, 30s timeout
├── .env                    ← Local only (gitignored) — GROQ_API_KEY
├── .gitignore
└── package.json
```

## Environment Variables
| Variable | Where | Purpose |
|----------|-------|---------|
| `GROQ_API_KEY` | `.env` + Vercel env | Groq API authentication |

## Key Design Decisions
- **No bundler**: React + ReactDOM loaded via unpkg UMD, JSX transpiled by Babel standalone CDN. Zero build complexity.
- **Base64 images**: Screenshots converted to data URLs client-side, sent in POST body. No file storage needed.
- **Video frame extraction**: Client-side only — Canvas API extracts 3 frames from video files, sent as JPEG images. Groq never sees the video file.
- **outputDirectory: public**: Vercel serves `public/` as static root so `index.html` is found at `/`.
- **Groq model**: `meta-llama/llama-4-scout-17b-16e-instruct` — llama-3.2-11b-vision-preview and llama-3.2-90b-vision-preview were both decommissioned as of June 2026.
- **JSON parse fallback**: API response may wrap JSON in markdown fences — regex fallback extracts array.

## Brand Guidelines
- Gradient: `linear-gradient(45deg, #321386, #9C20D7)` — used in header
- Primary purple: `#7C3AED`
- Background: `#F5F6FA` (light mode — Edvoy does not use dark mode)
- Cards: `#FFFFFF` with `#E5E7EB` border

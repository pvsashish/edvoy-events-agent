# Architecture — Edvoy Events Agent

**Last updated:** 2026-06-08

## What It Does
PM tool for Edvoy's analytics team. Upload screenshots or videos of the Edvoy web portal or mobile app, select GA4 or Amplitude, and receive correctly formatted analytics events + parameters matching the tracking sheet format (Category, Suggested Event Name, Parameter, Sample Value). Specs are persisted to Neon PostgreSQL with localStorage fallback.

## Users
Edvoy product managers and analytics team.

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18 (UMD via CDN + Babel standalone — no build step) |
| Backend | Vercel serverless functions (Node.js ESM) |
| AI | Groq API — `meta-llama/llama-4-scout-17b-16e-instruct` (vision) |
| Database | Neon PostgreSQL (pooled via `pg` — `DATABASE_URL`) |
| Hosting | Vercel (static from `public/` + serverless from `api/`) |

## File Structure
```
events-agent/
├── api/
│   ├── analyze.js       ← POST /api/analyze — calls Groq vision, normalises events JSON
│   ├── db.js            ← Neon PostgreSQL pool + self-initialising table setup
│   └── history.js       ← GET/POST/DELETE /api/history — specs history CRUD
├── public/
│   ├── index.html       ← Entry point; loads React UMD + Babel CDN; global CSS + animations
│   ├── app.jsx          ← Full React app (sidebar nav, Generate tab, History tab, Naming tab)
│   └── logo.png         ← Local brand logo (avoids CORS / hotlink blocks from edvoy.com)
├── prompts/
│   ├── ga4.js           ← GA4_PROMPT — system prompt with tracking sheet format + naming rules
│   └── amplitude.js     ← AMP_PROMPT — system prompt with tracking sheet format + naming rules
├── guidelines/          ← Project continuity docs (committed, pushed to GitHub)
├── .claude/
│   └── launch.json      ← Preview server config (port 3333, vercel dev)
├── vercel.json          ← outputDirectory: public, /api/* rewrites, 30s fn timeout
├── .env                 ← Local only (gitignored) — GROQ_API_KEY, DATABASE_URL
├── .gitignore
└── package.json
```

## Environment Variables
| Variable | Where | Purpose |
|----------|-------|---------|
| `GROQ_API_KEY` | `.env` + Vercel env | Groq API auth |
| `DATABASE_URL` | `.env` + Vercel env | Neon PostgreSQL connection string |

## Database Schema
Table: `edvoy_specs_history`
| Column | Type | Notes |
|--------|------|-------|
| `id` | VARCHAR(255) PK | Client-generated UUID |
| `name` | VARCHAR(255) | Auto-generated from platform + timestamp |
| `timestamp` | VARCHAR(255) | ISO string |
| `platform` | VARCHAR(50) | `ga4` or `amplitude` |
| `events_count` | INT | Row count |
| `events` | TEXT | JSON-serialised events array |
| `feature_context` | TEXT | Optional PM context string |
| `created_at` | TIMESTAMP | Auto-set by DB default |

## Key Design Decisions
- **No bundler**: React + ReactDOM UMD globals; JSX transpiled by Babel standalone at runtime.
- **Base64 images**: Screenshots converted client-side to data URLs, sent in POST body — no file storage.
- **Video frame extraction**: Canvas API extracts 3 JPEG frames client-side; Groq receives images only.
- **`outputDirectory: public`**: Vercel serves `public/` as static root — `index.html` resolves at `/`.
- **Groq model**: `meta-llama/llama-4-scout-17b-16e-instruct` — both llama-3.2 vision variants decommissioned June 2026.
- **JSON parse fallback**: Regex extracts `[…]` from model response in case it wraps in markdown fences.
- **Sample value normalisation**: `is_clicked` params → `true/false`; `*_id` params → `dynamic value` (enforced in `api/analyze.js`).
- **DB-less fallback**: `api/history.js` returns empty array (not an error) when `DATABASE_URL` is unset; frontend falls back to localStorage.

## Brand Guidelines (Edvoy)
- Header gradient: `linear-gradient(45deg, #321386, #9C20D7)`
- Primary purple: `#7C3AED`
- Page bg: `#F8FAFC` (light mode — Edvoy does not use dark mode)
- Cards: `#FFFFFF` with `#EAECF0` border
- Font: Inter (body 400/500/600, display 700/800) + Manrope (display headings)

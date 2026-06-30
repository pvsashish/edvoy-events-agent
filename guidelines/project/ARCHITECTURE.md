# Architecture — Edvoy Events Agent

**Last updated:** 2026-06-30 (Anthropic Sonnet 4.6 only; Groq + Gemini removed; per-generate cost chip; accuracy + UX overhaul)

## What It Does
PM tool for Edvoy's analytics team. Upload screenshots or videos of the Edvoy web portal or mobile app, select GA4 or Amplitude, and receive correctly formatted analytics events + parameters matching the tracking sheet format (Category, Suggested Event Name, Parameter, Sample Value). Specs are persisted to Neon PostgreSQL with localStorage fallback. Also includes Scout — a visual event map that shows real screenshots with highlighted UI elements for each tracked event.

## Users
Edvoy product managers and analytics team.

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18 (UMD via CDN + Babel standalone — no build step) |
| Backend | Vercel serverless functions (Node.js ESM) |
| AI | Anthropic Claude Sonnet 4.6 (`claude-sonnet-4-6`), temperature 0 — 3-step pipeline: identify → match → generate. Paid per token ($3/M in, $15/M out) |
| Database | Neon PostgreSQL (pooled via `pg` — `DATABASE_URL`) |
| Hosting | Vercel (static from `public/` + serverless from `api/`) |

## File Structure
```
events-agent/
├── api/
│   ├── analyze.js       ← POST /api/analyze — Anthropic Sonnet 4.6 3-step pipeline (temperature 0), normalises events JSON, injects matched-event params, returns usage (tokens + $ cost)
│   ├── db.js            ← Neon PostgreSQL pool + self-initialising table setup
│   ├── history.js       ← GET/POST/DELETE /api/history — specs history CRUD
│   ├── screens.js       ← GET/POST/DELETE /api/screens — Scout event map CRUD
│   ├── settings.js      ← GET/POST /api/settings — shared app config (Google Sheets IDs, etc.)
│   └── sheets.js        ← POST /api/sheets — fetch + parse Google Sheets CSV for tracking sheet sync
├── public/
│   ├── index.html       ← Entry point; loads React UMD + Babel CDN; global CSS + animations
│   ├── app.jsx          ← Full React app (sidebar nav, Generate tab, History tab, Naming tab, Scout tab)
│   └── logo.png         ← Local brand logo (avoids CORS / hotlink blocks from edvoy.com)
├── prompts/
│   ├── ga4.js           ← buildGA4Prompt() — Step 3 system prompt with naming rules + resolvedNames injection
│   ├── amplitude.js     ← buildAMPPrompt() — Step 3 system prompt with naming rules + resolvedNames injection
│   ├── identify.js      ← buildIdentifyPrompt() — Step 1: list interactions from screenshot
│   └── match.js         ← buildMatchPrompt() — Step 2: map interactions to existing event names
├── guidelines/          ← Project continuity docs (committed, pushed to GitHub)
├── .claude/
│   └── launch.json      ← Preview server config (port 3333, vercel dev)
├── vercel.json          ← outputDirectory: public, /api/* rewrites, 30s fn timeout
├── .env                 ← Local only (gitignored) — ANTHROPIC_API_KEY, DATABASE_URL
├── .gitignore
└── package.json
```

## Environment Variables
| Variable | Where | Purpose |
|----------|-------|---------|
| `ANTHROPIC_API_KEY` | `.env` + Vercel env (prod + preview) | Anthropic API auth — the sole AI provider (all 3 pipeline steps) |
| `DATABASE_URL` | `.env` + Vercel env | Neon PostgreSQL connection string |

## Database Schema
Table: `edvoy_settings`
| Column | Type | Notes |
|--------|------|-------|
| `key` | VARCHAR PK | Setting name (e.g. `ga4_sheet_id`) |
| `value` | TEXT | Setting value |

Table: `edvoy_screens` (Scout)
| Column | Type | Notes |
|--------|------|-------|
| `id` | VARCHAR PK | `screen_<timestamp>_<random>` |
| `screen_name` | VARCHAR | Must match a `CAT_COLOR` key |
| `platform` | VARCHAR | `ga4` or `amplitude` |
| `image` | TEXT | base64 data URL |
| `events` | JSONB | `[{ event_name, label, bbox: [x,y,w,h] }]` |
| `created_at` | TIMESTAMP | Auto-set |

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
- **Base64 images**: Screenshots converted client-side to data URLs, stored in Neon as TEXT. ⚠️ This causes Neon free-tier data transfer overruns — planned migration to Vercel Blob (store URL in Neon instead). See SCOUT_FLOW.md.
- **Video frame extraction**: Canvas API extracts 3 JPEG frames client-side; the model receives images only.
- **`outputDirectory: public`**: Vercel serves `public/` as static root — `index.html` resolves at `/`.
- **Anthropic Claude Sonnet 4.6 (`claude-sonnet-4-6`)**: sole AI provider, all 3 steps. Messages API via plain `fetch` (no SDK), header `anthropic-version: 2023-06-01`, `x-api-key`. `system` field + images as base64 `image` blocks (`dataUrlToImageBlock` converts data URLs). **temperature 0, max_tokens 8192.** `anthropicWithRetry` retries transient 429/5xx/529. Paid per token — `api/analyze.js` sums usage across all 3 calls → returns `usage: {input_tokens, output_tokens, cost_usd, calls}`; UI shows a `$cost` chip per generate. Groq + Gemini removed 2026-06-30 (Groq Llama-4-Scout was weaker + MoE-nondeterministic; switching surfaced + fixed the `from`-on-Amplitude filler bug).
- **Reuse before inventing**: matched events/params reused verbatim + case-sensitive from the synced sheet. `api/sheets.js` returns `eventParams` (event→its params); `generateSpec` injects a matched-event param hint (e.g. `jump_to_clicked` → `options_name`) so the model doesn't guess a synonym. Screen-view interactions are not emitted (no clean sheet event for them).
- **JSON parse fallback**: Regex extracts `[…]` from model response in case it wraps in markdown fences.
- **Sample value normalisation**: `is_*`/`has_*` → `true/false`; dimension params (`*_id`, `*_name`, `*_category`, `from`, `options_name`, …) → `dynamic value`; parameter casing preserved; rows de-duped one-per event+param (all in `api/analyze.js`).
- **DB-less fallback**: `api/history.js` returns empty array (not an error) when `DATABASE_URL` is unset; frontend falls back to localStorage.
- **Neon SSL retry**: `api/screens.js` wraps all `pool.query` calls in `queryWithRetry` (2 retries, 3s delay) to handle intermittent Neon SSL `bad record mac` errors. Pool is capped at `max: 1` connection.
- **Scout ingestion**: source of truth is PM-provided screenshot folders (one PNG per event, named `<event_name>.png`). `<event_name> - 2.png` = same event firing in a second place; full filename kept as `event_name`. bbox is always `[0,0,0,0]` for manually captured shots.

## Brand Guidelines (Edvoy)
- Header gradient: `linear-gradient(45deg, #321386, #9C20D7)`
- Primary purple: `#7C3AED`
- Page bg: `#F8FAFC` (light mode — Edvoy does not use dark mode)
- Cards: `#FFFFFF` with `#EAECF0` border
- Fonts: two-font system loaded from Google Fonts
  - `--font-display: Manrope` → headings (h1/h2/h3), section labels (uppercase), card titles, table column headers, step numbers/titles, wordmark. Weights: 500/600/700/800.
  - `--font-body: Inter` → all buttons, nav items, inputs, textareas, body/description text, table cell content, supporting text. Weights: 400/500/600/700.
  - `--font-mono` → code snippets only
- Icons: GA4 and Amplitude use official brand SVGs inline (`IconGA4`, `IconAmplitude` components). No external icon font.

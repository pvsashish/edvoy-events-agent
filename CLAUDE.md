# Edvoy Events Agent — Claude Handoff

This file is read automatically at the start of every Claude Code session. It tells you everything you need to pick up where we left off.

## What This Project Is

PM tool for Edvoy's analytics team. Lets PMs upload screenshots/videos of the Edvoy web portal, select GA4 or Amplitude, and get correctly-formatted analytics event specs. Also includes **Scout** — a visual event map showing real screenshots with highlighted UI elements for every tracked event.

**Live URL:** Vercel auto-deploys from `main` branch (check Vercel dashboard for URL).
**Dev server:** `cd /Users/ashish/Documents/events-agent && npx vercel@latest dev --listen 3333`

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 UMD + Babel standalone — **no build step**, edit `public/app.jsx` directly |
| Backend | Vercel serverless (`api/*.js`) |
| Database | Neon PostgreSQL (`DATABASE_URL` env var) |
| AI | Groq Llama-4-Scout (`GROQ_API_KEY`), temperature 0, all steps — 3-step pipeline: identify → match → generate. Gemini removed 2026-06-30 |
| Hosting | Vercel — `public/` is static root, `api/` is serverless |

Key files:
- `public/app.jsx` — entire React frontend (single file, ~2900 lines)
- `api/analyze.js` — Groq 3-step pipeline (temperature 0, deterministic)
- `api/screens.js` — Scout CRUD (`GET/POST/DELETE /api/screens`)
- `api/db.js` — Neon pool + table init
- `prompts/` — `ga4.js`, `amplitude.js`, `identify.js`, `match.js`
- `guidelines/` — all project docs (committed, pushed)
- `SESSION.md` — local-only session state (gitignored)

---

## Current State (as of 2026-06-25, last commit b1feed4)

### ⚠️ BLOCKER: Neon data transfer quota exceeded
- All 105 Scout records are intact in Neon DB — nothing lost
- Reads fail with: `"Your project has exceeded the data transfer quota"`
- **Resets 2026-07-01** (Neon free tier resets monthly)
- Root cause: storing full-resolution screenshots as base64 TEXT in PostgreSQL — each page load preloads all 105 images through Neon

### First thing to do on July 1 (after quota resets)
Migrate images from Neon to **Vercel Blob** (or Cloudflare R2):
1. For each record: read `image` (base64), upload to Blob, get URL
2. Add `image_url VARCHAR` column to `edvoy_screens`
3. Update record: set `image_url`, clear `image`
4. Update `api/screens.js`: POST stores to Blob, returns URL; GET returns URL not base64
5. Update `public/app.jsx`: `<img src={record.image_url}>` instead of base64

This eliminates the transfer problem permanently. Neon only stores metadata (~1KB/record), images served from CDN.

### AI engine (Groq only)
`meta-llama/llama-4-scout-17b-16e-instruct`, temperature 0 + `seed: 42` + `top_p: 1`, all 3 pipeline steps. 1,000 RPD free. `GROQ_API_KEY` in Vercel env. Gemini fully removed 2026-06-30 (was capped at 20 RPD).
**Reproducibility:** Scout is a Mixture-of-Experts model, so output is NOT bit-for-bit deterministic. In practice a real screenshot gives the same spec run-to-run (verified); only contentless/degenerate images vary noticeably.

### Accuracy rules baked into the pipeline (2026-06-30)
- **Reuse before inventing**: events/params reused verbatim (case-sensitive) from the synced sheet; new ones only when nothing matches. Sheet parser returns `eventParams` (event→its params) so matched events reuse exact params (e.g. `jump_to_clicked` → `options_name`).
- **No screen-view events**: identify step never emits "screen viewed" interactions (no clean screen-view event in the sheet → don't mislabel/invent).
- **Deterministic + de-duped**: temperature 0, one row per event+param, varying values → `dynamic value`.

### What's built and working
- **Scout workspace redesign** — pushed to GitHub, will show correctly once DB accessible
  - Unified card (header + canvas + event rail + footer)
  - In-memory search (instant, no DB round-trip)
  - Platform toggle (GA4 / AMP), screen grouping, 10-per-page pagination
  - Copy-to-clipboard per event row with toast
  - Auto-fit canvas (720px, handles any screenshot size)
  - Form-factor chip (Mobile/Desktop from image dimensions)
- **Scout data**: 105 events across 24 screens (all GA4, Amplitude pending)
- **All other features**: Event Generator, Specs History, Naming Converter, Tracking Sheet sync — all working

---

## Scout — Data & Ingestion

**How Scout data gets in:**
1. PM provides a Desktop folder of PNGs, one per event (`event_name.png`)
2. Start dev server
3. Delete existing records for that screenName (GET all → filter → DELETE each by id)
4. POST each PNG via Python ingestion script (see `guidelines/features/scout/SCOUT_FLOW.md`)
5. Verify on localhost → push to live

**screenName must exactly match a `CAT_COLOR` key in `public/app.jsx` (~line 86).** Adding a new category = add it to CAT_COLOR first.

**Current 24 screens:** App, Articles, Career, City Page, Compare, Compare page, Contact, Country Page, Course Shortlist, Courses, Events, Exams, FAQs, Footer Menu, Header Menu, Homepage, IELTS Page, LP3 and LP4, Office Location Pages, Results, Search, Subject Page, Testimonials, Universities

**Country Page has 7 records** (1 duplicate `explore_universities_clicked` from a retry) — intentionally kept, clean up later.

**Amplitude events:** not yet ingested. AMP tab in Scout is built and will activate automatically when Amplitude records exist.

---

## Workflow Rules

- Work locally first, verify on `localhost:3333`, then push
- Never push unverified changes
- After pushing: update `guidelines/features/scout/SCOUT_FLOW.md` record counts + `SESSION.md`
- `SESSION.md` is gitignored (local only). All other docs in `guidelines/` are committed.
- Python ingestion: `os.listdir` not shell `ls` (handles Unicode spaces in folder names)
- Sleep 2s between POSTs to avoid Neon SSL flakiness; retry in 8s on 500

---

## Docs to read for deeper context

| File | What's in it |
|------|-------------|
| `guidelines/features/scout/SCOUT_FLOW.md` | Full Scout spec, ingestion script, DB schema, known issues |
| `guidelines/project/ARCHITECTURE.md` | Stack, file map, DB schema, design decisions |
| `guidelines/project/OPERATIONS.md` | How to run locally, deploy, Neon setup |
| `guidelines/features/FEATURES_INDEX.md` | All features and their status |
| `SESSION.md` | Current local session state (local only) |

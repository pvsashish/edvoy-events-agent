# Edvoy Events Agent — Claude Handoff

This file is read automatically at the start of every Claude Code session. It tells you everything you need to pick up where we left off.

## What This Project Is

PM tool for Edvoy's analytics team. Lets PMs upload screenshots/videos, select GA4 or Amplitude, and get correctly-formatted analytics event specs. A sidebar **Space** switcher (Edvoy Student / Edvoy Connect) scopes tracking-sheet connections + Specs History per Edvoy surface so they never mix. Also includes **Scout** — a visual event map showing real screenshots with highlighted UI elements for every tracked event.

**Live URL:** Vercel auto-deploys from `main` branch (check Vercel dashboard for URL).
**Dev server:** `cd /Users/ashish/Documents/events-agent && npx vercel@latest dev --listen 3333`

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 UMD + Babel standalone — **no build step**, edit `public/app.jsx` directly |
| Backend | Vercel serverless (`api/*.js`) |
| Database | Neon PostgreSQL (`DATABASE_URL` env var) |
| AI | Anthropic Claude Sonnet 4.6 (`ANTHROPIC_API_KEY`), temperature 0, all steps — 3-step pipeline: identify → match → generate. Groq + Gemini removed 2026-06-30 |
| Hosting | Vercel — `public/` is static root, `api/` is serverless |

Key files:
- `public/app.jsx` — entire React frontend (single file, ~2900 lines)
- `api/analyze.js` — Anthropic Sonnet 4.6 3-step pipeline (temperature 0); returns `usage` (tokens + $ cost) per generate
- `api/screens.js` — Scout CRUD (`GET/POST/DELETE /api/screens`)
- `api/db.js` — Neon pool + table init
- `prompts/` — `ga4.js`, `amplitude.js`, `identify.js`, `match.js`
- `guidelines/` — all project docs (committed, pushed)
- `SESSION.md` — local-only session state (gitignored)

---

## Current State (as of 2026-07-07, last commit f1d102b)

No open blockers. DB lives in its own dedicated Neon project (`edvoy-events-agent`, not shared with any other tool). Scout images are on Cloudflare R2, not Neon — the old base64-in-Postgres transfer problem is permanently gone.

### Recent (2026-07-07)
- **Scout: 227 events / 43 screens** (105 GA4 + 122 Amplitude), all `edvoy-student`. Latest ingests: Genie Banner Logged Out, Profile, Shortlist, Country Story, Course Card, Institution Card, Trending Subjects, Refer and Earn.
- **Scout canvas images**: hover-prefetch (warms a row's screenshot on hover) + branded loading animation (shimmer + purple gradient ring + "Loading Screenshot") while a not-yet-cached R2 image downloads.
- **Scout search** normalized + word-order-independent (strips spaces/hyphens/underscores; every query word must appear in the screen or a single event name). **Clear** button next to Search resets query + results + canvas.
- **Scout selection:** click an event to select, click again to deselect (toggle); "No event selected" empty state. **Pagination** is dense-pack + orphan-safe (~10/page, never strands <3 of a category).
- **API Usage counter is now DB-persisted** (`edvoy_usage` table + `api/usage.js`) — survives cache clears, consistent across devices; localStorage is just an offline cache. Was localStorage-only.
- **Feature Context** field now actually steers the pipeline (all 3 steps); **video** attachments play in the lightbox + **scene-change frame extraction** (content-driven count, not fixed 3).

### Platform toggle follows connected sheets (2026-07-06)
GA4/Amplitude toggle is gated on connection for the active Space: only a platform whose tracking sheet has synced `data` (`sheetConfig[space]?.[p]?.data`) is enabled. One connected → auto-selected + other hard-disabled; both → user picks; neither → both disabled + Generate blocked with a hint. Auto-select `useEffect` deps exclude `platform` so history restore isn't clobbered. All `public/app.jsx`.

### Space switcher (2026-07-03)
Sidebar "Space" dropdown: **Edvoy Student** (default — existing GA4+Amplitude sheets, all history) / **Edvoy Connect** (new, counselors/agents surface — Amplitude only so far, starts empty). Scopes tracking-sheet config + Specs History so the two never mix. `sheetConfig` is nested per space (`{[space]:{ga4,amplitude}}`); old flat shape auto-migrates into the `edvoy-student` bucket on load. History rows carry a `space` column (default `edvoy-student`). Edvoy Connect's tracking sheet still needs real event rows synced in — the tab checked so far only had headers.

### Scout images on Cloudflare R2 (2026-07-03)
Images migrated off Neon (was 140MB base64 in Postgres) to R2 (`edvoy-events-assets` bucket, public CDN URL). `edvoy_screens.image_url` is the only image field now (base64 `image` column dropped). R2 env vars are on Vercel (Production) — confirmed working, ingestion (POST) should work live.

### Dedicated Neon project (2026-07-02)
DB moved out of the shared `reddit-tool-staging` Neon project into its own (`edvoy-events-agent`). No more shared quota, no more mystery outages from another tool's usage.

### Postgres pool crash fix (2026-07-03)
`api/db.js` had no `error` listener on the connection pool — Neon dropping an idle connection was an unhandled error that crashed the entire Node process (local `vercel dev` and, in principle, live too). Fixed with `pool.on('error', ...)`.

### AI engine (Anthropic only)
`claude-sonnet-4-6`, temperature 0, all 3 pipeline steps via Messages API (`https://api.anthropic.com/v1/messages`, header `anthropic-version: 2023-06-01`). `ANTHROPIC_API_KEY` in Vercel env (prod + preview) and local `.env`. Paid per token — $3/M input, $15/M output. Groq + Gemini fully removed 2026-06-30.
**Cost visibility:** `api/analyze.js` sums token usage across all 3 calls and returns `usage: { input_tokens, output_tokens, cost_usd, calls }`. UI shows a `$cost` chip next to the results header (hover → token breakdown). Per-generate, not cumulative.
**Why switched:** Groq Llama-4-Scout (MoE) was weaker + not bit-for-bit deterministic; Sonnet follows the sheet rules much more closely. Trade-off: switching surfaced the `from`-on-Amplitude bug (Sonnet obeyed a stale `from` in the default param list) — fixed by removing it from `prompts/amplitude.js` DEFAULT_PARAMETERS + hard server-side filter in `api/analyze.js`.

### Accuracy rules baked into the pipeline (2026-06-30)
- **Reuse before inventing**: events/params reused verbatim (case-sensitive) from the synced sheet; new ones only when nothing matches. Sheet parser returns `eventParams` (event→its params) so matched events reuse exact params (e.g. `jump_to_clicked` → `options_name`).
- **No screen-view events**: identify step never emits "screen viewed" interactions (no clean screen-view event in the sheet → don't mislabel/invent).
- **Deterministic + de-duped**: temperature 0, one row per event+param, varying values → `dynamic value`.

### What's built and working
- **Scout workspace**: unified card (header + canvas + event rail + footer), in-memory search, platform toggle (GA4/AMP), screen grouping, 10-per-page pagination, copy-to-clipboard per row, auto-fit canvas, form-factor chip. Images served from R2 CDN.
- **Scout data**: 227 events across 43 screens (105 GA4 + 122 Amplitude)
- **Event Generator**: Space switcher (Student/Connect) + Specs History + Naming Converter + Tracking Sheet sync — all working

---

## Scout — Data & Ingestion

**How Scout data gets in:**
1. PM provides a Desktop folder of PNGs, one per event (`event_name.png`)
2. Start dev server
3. Delete existing records for that screenName (GET all → filter → DELETE each by id)
4. POST each PNG via Python ingestion script (see `guidelines/features/scout/SCOUT_FLOW.md`)
5. Verify on localhost → push to live

**screenName must exactly match a `CAT_COLOR` key in `public/app.jsx` (~line 86).** Adding a new category = add it to CAT_COLOR first.

**Current: 43 screens, 227 records (105 GA4 + 122 Amplitude), all `edvoy-student`.** Full per-category breakdown + change log in `guidelines/features/scout/SCOUT_FLOW.md` (source of truth for counts).

**Country Page has 7 records** (1 duplicate `explore_universities_clicked` from a retry) — intentionally kept, clean up later.

**Amplitude events:** ingested (80 records — Genie, Onboarding, Login/Sign-up, Settings, Logout, Stand-by, App Update, Genie Banner(+Logged Out), etc.). AMP tab in Scout is active.

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

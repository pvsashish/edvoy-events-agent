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
| Auth | Shared-password gate (`DASHBOARD_PASSWORD` + `SESSION_SECRET`) — Vercel Edge `middleware.js` + signed JWT session cookie. Added 2026-07-16 |

Key files:
- `public/app.jsx` — entire React frontend (single file, ~2900 lines)
- `api/analyze.js` — Anthropic Sonnet 4.6 3-step pipeline (temperature 0); returns `usage` (tokens + $ cost) per generate
- `api/screens.js` — Scout CRUD (`GET/POST/DELETE /api/screens`)
- `api/db.js` — Neon pool + table init
- `middleware.js` — Vercel Edge auth gate (redirects unauthed pages to `/login`, 401s unauthed `/api/*`)
- `api/auth.js` + `api/lib/session.js` — shared-password login → signed JWT session cookie, logout
- `public/login.html` — branded sign-in page
- `prompts/` — `ga4.js`, `amplitude.js`, `identify.js`, `match.js`
- `guidelines/` — all project docs (committed, pushed)
- `SESSION.md` — local-only session state (gitignored)

---

## Current State (as of 2026-07-22)

No open blockers. DB lives in its own dedicated Neon project (`edvoy-events-agent`, not shared with any other tool). Scout images are on Cloudflare R2, not Neon — the old base64-in-Postgres transfer problem is permanently gone. The whole app sits behind a shared-password login gate (2026-07-16). Scout's canvas + the whole app's responsive layout was overhauled 2026-07-21, and a follow-up iOS-only interaction bug in the same area was fixed 2026-07-22 (see below) — both were real-device-only bugs invisible to desktop testing and to a Chromium-based simulated browser.

### Recent (2026-07-22, latest) — Scout: fixed events needing a double-tap on iOS Safari (shipped + live)
User reported that after the 2026-07-21 responsive fix, Scout event rows on a real iPhone still needed **two taps** to select — first tap looked like nothing happened, second tap actually opened it. A first attempted fix (adding an empty `onTouchStart`) shipped but did **not** work — disproven by a screen recording from the user's device.
- **Root cause (confirmed by extracting frames from the recording):** each event row's `onMouseEnter` (used for hover-prefetching the screenshot) visibly reveals a grey background + a copy-icon button. iOS Safari treats any element with hover-triggered visual changes as "hover-reveal content" and requires a first tap just to reveal it, a second to actually fire the click — independent of `cursor: pointer` or `onTouchStart`.
- **Real fix:** hover handlers (`onMouseEnter`/`onMouseLeave`) are now only attached when the device reports genuine hover support — `window.matchMedia('(hover: hover)').matches`, checked once via a `scoutSupportsHover` state at mount. Touchscreens never get the handlers at all, so there's no hover state for iOS to gate behind an extra tap; a single tap goes straight to `onClick`. Desktop/mouse behaviour (hover highlight, copy-icon reveal, image prefetch) is unchanged.
- **Verification:** the exact iOS touch→hover→click synthesis can't be reproduced in the Chromium-based testing browser used for QA (it always reports `hover: hover`, even at mobile viewport widths) — verified instead via React-fiber prop inspection (handlers correctly present/absent), direct handler invocation, and a real single-click-selects check on desktop (proving no regression), plus the underlying mechanism (`matchMedia('(hover: hover)')`) is a standard, reliable platform signal. Confirmed working by the user on their actual iPhone after deploy.
- **QA:** 375px/1280px, zero console errors, zero desktop regression, Specs History + Upload button unaffected.
- **Shipped:** commit `baf2347` (disproven `onTouchStart` attempt) → commit `bf63dad` (real fix) on `main` → pushed → Vercel auto-deployed → confirmed live (`app.jsx?v=31`) and on the user's device. Docs: `CLAUDE.md`, `guidelines/features/scout/SCOUT_FLOW.md`, `guidelines/features/FEATURES_INDEX.md`, `guidelines/features/FEATURE_TO_CODE_OWNERSHIP_MAP.md`.

### Recent (2026-07-21) — Scout canvas responsive fix + tablet breakpoint (shipped + live)
User reported Scout "wasn't responsive at all" on a real iPhone 15 Pro — a screenshot showed the Scout canvas rendering a course-comparison screen cropped into a small, oddly-proportioned sliver. Root cause: the canvas `<img>` (`public/app.jsx`) had a hardcoded `maxHeight: 656px` — hand-tuned for the desktop canvas box (720px − 64px padding) — that never adapted when the mobile CSS shrank the canvas box to 320px. A portrait screenshot laid out at up to 656px tall regardless of viewport, then got silently clipped by the canvas's `overflow:hidden`.
- **Fix:** `<img>` `maxHeight` is now `100%`, resolved against an explicit `height:'100%'` on its wrapper (the canvas's `align-items:'center'` doesn't stretch children, so an unstretched wrapper has no real height for a percentage to resolve against — had to set it explicitly).
- **Mobile canvas box enlarged** 320→460px (`public/index.html`) so screenshots render at a legible size, not a postage stamp, even after fixing the clipping.
- **New tablet breakpoint (769–1200px)**, covering iPad landscape (1024), iPad Air landscape (1180), iPad Pro 11" landscape (1194) — these previously fell into the desktop 3-column grid, which crushed the canvas to ~330px wide next to the fixed 380px event rail. Now they get the same stacked single-column layout as mobile, just bigger (canvas 560px).
- **Mobile header was missing the "Upload screens" button entirely** — it only existed in the desktop-only header bar (`.desktop-header-bar`, hidden ≤768px). Added a purple "+" icon button to the mobile header bar, shown only on the Scout tab.
- **Specs History bug found in QA**: the "Rows: N • Generated: ..." metadata line wrapped mid-word at narrow widths (flex row had no `flexWrap`) — fixed with `flexWrap:'wrap'` + `whiteSpace:'nowrap'` per span.
- **Incident during QA (self-caught, self-fixed):** while exploratory-testing at 375px, a misjudged tap landed on a Specs History delete icon instead of a thumbnail and deleted a real record ("Custom Event Spec", 2 rows, space `edvoy-student`) from the live shared DB. Recovered fully via a prior network-log capture of the exact record (re-POSTed with the same `id`/timestamp/events/context) — only the R2 thumbnail image was unrecoverable (no copy of it existed anywhere), everything else restored byte-for-byte. Confirmed via API + UI.
- **QA:** tested at 375/390/428/768/1024/1194/1280/1440px widths (iPhone SE through iPad Pro landscape to desktop), zero horizontal overflow anywhere, zero desktop regression (1280+ pixel-identical to before), zero console errors. Verified live on `edvoy-events-gen.vercel.app` post-deploy via bundle-version check (`app.jsx?v=29`) and canvas dimension/overflow checks.
- **Shipped:** commit `24fa02d` on `main` → pushed → Vercel auto-deployed. Docs: `CLAUDE.md`, `guidelines/project/ARCHITECTURE.md`, `guidelines/features/FEATURES_INDEX.md`, `guidelines/features/FEATURE_TO_CODE_OWNERSHIP_MAP.md`, `guidelines/features/scout/SCOUT_FLOW.md`, `guidelines/features/specs_history/SPECS_HISTORY_FLOW.md`.

### Recent (2026-07-16) — Shared-password login gate + sign-out (shipped + live)
Whole app (pages + `/api/*`) now requires signing in with a shared team password, same pattern as the Edvoy Reviews Dashboard:
- `middleware.js` (Vercel Edge) — unauthenticated page requests redirect to `/login`; unauthenticated `/api/*` requests get `401`. `/login`, `/login.html`, `/api/auth` stay public so the login flow itself is reachable. Verifies the session JWT with Web Crypto (edge runtime can't use `jsonwebtoken`).
- `api/auth.js` + `api/lib/session.js` — `POST /api/auth {action:'login', password}` checks `DASHBOARD_PASSWORD` (constant-time compare) and sets a signed HttpOnly `edvoy_events_session` cookie (12h TTL, HS256 via `jsonwebtoken` + `SESSION_SECRET`); `{action:'logout'}` clears it. Rate-limited (10 attempts/min/IP, in-memory).
- `public/login.html` — branded split-screen sign-in page (same visual language as the Reviews Dashboard's `login.html`: purple gradient brand panel + card). Logo tile renders `logo.png` at 38px (was 28px) — the asset has ~35% transparent padding baked in, so the smaller size looked tiny next to the tile.
- Sidebar gets a **Sign out** icon button (`handleLogout` in `public/app.jsx`) next to the user block — posts `{action:'logout'}`, then redirects to `/login`.
- **Env vars required** (set on Vercel Production + local `.env`): `DASHBOARD_PASSWORD`, `SESSION_SECRET` (long random string — without both, `/api/auth` responds `503 Auth not configured` and the whole app is unreachable). Password value lives only in `.env` (local, gitignored) and Vercel Production env vars — not written here.
- **QA (local + live):** unauthed `/` → 302 to `/login`; unauthed `/api/*` → 401; wrong password → "Incorrect password", no cookie; correct password → cookie set, `/` and `/api/*` both 200; sign-out clears cookie and redirects back to `/login`. Verified on both `localhost:3333` and the live Vercel deploy. Zero console errors.
- **New deps:** `jsonwebtoken` (Node runtime only — edge `middleware.js` avoids it, uses Web Crypto instead).

### Recent (2026-07-16) — Scout self-serve uploader: dup/exists + Replace scoped by platform (shipped + live)
The `exists`/`dup` badge check and the **Replace** delete in `ScoutUploadModal` only filtered existing records by `screenName` + `space` — not `platform`. A GA4 event and an Amplitude event sharing a name in the same category falsely flagged each other as `exists`, and ticking Replace while uploading to one platform could silently delete the *other* platform's records for that category too. Fixed by adding `r.platform === platform` to both filters. Also fixed the Scout workspace footer's "N events" stat, which always showed the GA4 logo regardless of the active platform filter — now shows the icon(s) matching `scoutPlatformFilter` (both logos when "All" is selected). One file (`public/app.jsx`), no DB/API change. Doc: `guidelines/features/scout/SCOUT_FLOW.md`.

### Recent (2026-07-08) — Scout self-serve uploader (shipped + live)
PMs can now add Scout screens themselves — no more "ask Claude to ingest". **Scout → "Upload screens"** (primary button, top-right of the Scout header) opens `ScoutUploadModal` (`public/app.jsx`): drag-drop a **folder or single files**, pick Category (datalist + folder-name auto-fill) + Platform (GA4/AMP logo toggle), **review each derived `event_name` before commit** (badges: `dup` in-batch, `exists` already-in-category, `no name` empty → skipped), optional **Replace** (deletes the category's existing records first, aborts on any delete-failure so it never silently duplicates), progress bar + result screen. Loops the existing `POST /api/screens`; uploads to the active Space. New categories need **no code change** (`CategoryBadge` greys unknowns). Add-only — no per-record delete, no approval gate (writes straight to live for that Space). Doc: `guidelines/features/scout/SCOUT_FLOW.md` (section A).

### Recent (2026-07-07)
- **Scout: 242 events / 47 screens** (105 GA4 + 137 Amplitude), all `edvoy-student`. Latest ingests: Genie Banner Logged Out, Profile, Shortlist, Country Story, Course Card, Institution Card, Trending Subjects, Refer and Earn.
- **Scout canvas images**: hover-prefetch (warms a row's screenshot on hover) + branded loading animation (shimmer + purple gradient ring + "Loading Screenshot") while a not-yet-cached R2 image downloads. Hover handlers are only attached on devices that report real hover support (`matchMedia('(hover: hover)')`, 2026-07-22) — touchscreens skip them entirely, avoiding an iOS Safari double-tap quirk (see Current State above).
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
- **Scout data**: 242 events across 47 screens (105 GA4 + 137 Amplitude)
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

**Current: 47 screens, 242 records (105 GA4 + 137 Amplitude), all `edvoy-student`.** Full per-category breakdown + change log in `guidelines/features/scout/SCOUT_FLOW.md` (source of truth for counts).

**Country Page has 7 records** (1 duplicate `explore_universities_clicked` from a retry) — intentionally kept, clean up later.

**Amplitude events:** ingested (137 records — Genie, Onboarding, Login/Sign-up, Settings, Logout, Stand-by, App Update, Genie Banner(+Logged Out), Profile, Shortlist, Country Story, Course Card, Institution Card, Trending Subjects, Refer and Earn, Trending Universities, Popular Institutions, Popular Courses, Give Us Feedback, etc.). AMP tab in Scout is active.

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

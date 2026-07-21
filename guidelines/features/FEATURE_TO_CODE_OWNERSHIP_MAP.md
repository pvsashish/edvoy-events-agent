# Feature → Code Ownership Map

**Last updated:** 2026-07-21 (Scout canvas responsive fix + tablet breakpoint — `public/app.jsx`, `public/index.html`) · 2026-07-16 (added `api/auth.js`, `api/lib/session.js`, `middleware.js`, `public/login.html` — shared-password login gate)

| File | Feature | Notes |
|------|---------|-------|
| `api/analyze.js` | Anthropic Vision Analysis, Sample Value Normalisation, Cost Usage | POST handler — validates input, calls Anthropic Sonnet 4.6, normalises events, returns events + usage JSON |
| `api/db.js` | DB layer (Specs History, Scout, Usage) | Neon PostgreSQL pool + self-initialising `edvoy_specs_history`, `edvoy_screens`, `edvoy_settings`, `edvoy_usage` tables; `pool.on('error')` guard |
| `api/history.js` | Specs History CRUD | GET/POST/DELETE handler — wraps db.js; returns `{ history: [], warning }` if `DATABASE_URL` unset; Space-aware |
| `api/screens.js` | Scout CRUD (incl. self-serve upload) | GET/POST/DELETE `/api/screens` — POST uploads image to R2 + stores `image_url`; DELETE cleans the R2 object; Space-aware. Backs both Claude ingestion and the in-product `ScoutUploadModal` |
| `api/usage.js` | API Usage counter (DB-persisted) | GET / POST `{delta}` atomic increment / `{reset}` / `{set}` against singleton `edvoy_usage` row |
| `api/r2.js` | Cloudflare R2 helper | `uploadDataUrl`, `deleteByUrl` (S3-compatible); used by Scout images + History thumbnails |
| `api/auth.js` | Login gate — password exchange | POST `/api/auth` — `{action:'login',password}` → signed session cookie (rate-limited 10/min/IP); `{action:'logout'}` clears it. Added 2026-07-16 |
| `api/lib/session.js` | Login gate — session/JWT helpers | Node runtime: constant-time password check, JWT sign/verify (`jsonwebtoken`), cookie read/write helpers. Added 2026-07-16 |
| `middleware.js` | Login gate — request-level enforcement | Vercel Edge — redirects unauthed pages to `/login`, 401s unauthed `/api/*`; verifies session JWT via Web Crypto (no `jsonwebtoken` on edge). Added 2026-07-16 |
| `public/app.jsx` | All UI features | Upload, video frame extraction, toggle, context, table, exports, history, naming converter, reset, mobile nav, Space switcher, **Scout (search/canvas/pagination + `ScoutUploadModal` self-serve uploader, dup/exists/Replace checks scoped by platform as of 2026-07-16; canvas `<img>` maxHeight now cascades from its real container instead of a hardcoded desktop value, mobile header gained an Upload-screens icon button — 2026-07-21)**, **Sign out button (2026-07-16)** |
| `public/index.html` | App shell + global styles | Loads React UMD + Babel CDN; CSS variables; shimmer/slide animations; mobile breakpoints (≤768px) **+ tablet breakpoint (769–1200px, added 2026-07-21 — keeps Scout's stacked canvas layout instead of the cramped desktop 3-column grid)**; spin keyframes |
| `public/login.html` | Login gate — sign-in page | Branded split-screen sign-in form, posts to `/api/auth`. Added 2026-07-16 |
| `public/logo.png` | Brand logo asset | Served locally — prevents CORS / hotlink protection from edvoy.com |
| `prompts/ga4.js` | GA4 events format | `GA4_PROMPT` — tracking sheet column spec + GA4 snake_case naming rules |
| `prompts/amplitude.js` | Amplitude events format | `AMP_PROMPT` — tracking sheet column spec + Amplitude Title Case naming rules |
| `vercel.json` | Routing + config | `outputDirectory: public`, `/api/*` + `/login` rewrites, 30s serverless fn timeout |

# Feature → Code Ownership Map

**Last updated:** 2026-07-08

| File | Feature | Notes |
|------|---------|-------|
| `api/analyze.js` | Anthropic Vision Analysis, Sample Value Normalisation, Cost Usage | POST handler — validates input, calls Anthropic Sonnet 4.6, normalises events, returns events + usage JSON |
| `api/db.js` | DB layer (Specs History, Scout, Usage) | Neon PostgreSQL pool + self-initialising `edvoy_specs_history`, `edvoy_screens`, `edvoy_settings`, `edvoy_usage` tables; `pool.on('error')` guard |
| `api/history.js` | Specs History CRUD | GET/POST/DELETE handler — wraps db.js; returns `{ history: [], warning }` if `DATABASE_URL` unset; Space-aware |
| `api/screens.js` | Scout CRUD (incl. self-serve upload) | GET/POST/DELETE `/api/screens` — POST uploads image to R2 + stores `image_url`; DELETE cleans the R2 object; Space-aware. Backs both Claude ingestion and the in-product `ScoutUploadModal` |
| `api/usage.js` | API Usage counter (DB-persisted) | GET / POST `{delta}` atomic increment / `{reset}` / `{set}` against singleton `edvoy_usage` row |
| `api/r2.js` | Cloudflare R2 helper | `uploadDataUrl`, `deleteByUrl` (S3-compatible); used by Scout images + History thumbnails |
| `public/app.jsx` | All UI features | Upload, video frame extraction, toggle, context, table, exports, history, naming converter, reset, mobile nav, Space switcher, **Scout (search/canvas/pagination + `ScoutUploadModal` self-serve uploader)** |
| `public/index.html` | App shell + global styles | Loads React UMD + Babel CDN; CSS variables; shimmer/slide animations; mobile breakpoints; spin keyframes |
| `public/logo.png` | Brand logo asset | Served locally — prevents CORS / hotlink protection from edvoy.com |
| `prompts/ga4.js` | GA4 events format | `GA4_PROMPT` — tracking sheet column spec + GA4 snake_case naming rules |
| `prompts/amplitude.js` | Amplitude events format | `AMP_PROMPT` — tracking sheet column spec + Amplitude Title Case naming rules |
| `vercel.json` | Routing + config | `outputDirectory: public`, `/api/*` rewrites, 30s serverless fn timeout |

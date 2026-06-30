# Feature → Code Ownership Map

**Last updated:** 2026-06-08

| File | Feature | Notes |
|------|---------|-------|
| `api/analyze.js` | Anthropic Vision Analysis, Sample Value Normalisation, Cost Usage | POST handler — validates input, calls Anthropic Sonnet 4.6, normalises events, returns events + usage JSON |
| `api/db.js` | Specs History (DB layer) | Neon PostgreSQL pool + self-initialising `edvoy_specs_history` table via singleton `initPromise` |
| `api/history.js` | Specs History CRUD | GET/POST/DELETE handler — wraps db.js; returns `{ history: [], warning }` if `DATABASE_URL` unset |
| `public/app.jsx` | All UI features | Upload, video frame extraction, toggle, context, table, exports, history, naming converter, reset, mobile nav |
| `public/index.html` | App shell + global styles | Loads React UMD + Babel CDN; CSS variables; shimmer/slide animations; mobile breakpoints; spin keyframes |
| `public/logo.png` | Brand logo asset | Served locally — prevents CORS / hotlink protection from edvoy.com |
| `prompts/ga4.js` | GA4 events format | `GA4_PROMPT` — tracking sheet column spec + GA4 snake_case naming rules |
| `prompts/amplitude.js` | Amplitude events format | `AMP_PROMPT` — tracking sheet column spec + Amplitude Title Case naming rules |
| `vercel.json` | Routing + config | `outputDirectory: public`, `/api/*` rewrites, 30s serverless fn timeout |

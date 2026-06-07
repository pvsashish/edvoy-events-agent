# Feature → Code Ownership Map

| File | Feature | Notes |
|------|---------|-------|
| `api/analyze.js` | Groq Vision Analysis | POST handler — validates input, calls Groq, parses JSON with regex fallback |
| `public/app.jsx` | All UI features | Upload, video frame extraction, toggle, context input, table, TSV copy, specs history, naming guidelines tab, inline validator, reset tools |
| `public/index.html` | App shell + mobile responsive | Loads React UMD + Babel standalone CDN; global styles; mobile breakpoints (hamburger nav, guidelines grid, tab padding) |
| `prompts/ga4.js` | GA4 events format | GA4_PROMPT — defines tracking sheet columns + GA4 naming rules |
| `prompts/amplitude.js` | Amplitude events format | AMP_PROMPT — defines tracking sheet columns + Amplitude naming rules |
| `vercel.json` | Routing + config | outputDirectory=public, /api/* rewrites, 30s fn timeout |

# Feature → Code Ownership Map

| File | Feature | Notes |
|------|---------|-------|
| `api/analyze.js` | Groq Vision Analysis | Serverless function — receives POST, calls Groq, returns events |
| `client/App.jsx` | All UI features | Upload, toggle, context input, table, TSV copy |
| `client/index.html` | App shell | Static entry point |
| `prompts/ga4.js` | GA4 Toggle | GA4_PROMPT system prompt constant |
| `prompts/amplitude.js` | Amplitude Toggle | AMP_PROMPT system prompt constant |
| `vercel.json` | Routing | /api/* → serverless rewrites |

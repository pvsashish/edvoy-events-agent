# Features Index

| Feature | Doc | Status | Key Files |
|---------|-----|--------|-----------|
| Screenshot Upload | — | complete | `public/app.jsx` |
| Video Upload + Frame Extraction | — | complete | `public/app.jsx` (extractVideoFrames fn) |
| GA4 / Amplitude Toggle | — | complete | `public/app.jsx`, `prompts/ga4.js`, `prompts/amplitude.js` |
| Feature Context Input | — | complete | `public/app.jsx` |
| Groq Vision Analysis | — | complete | `api/analyze.js` |
| Events Table Output (tracking sheet format) | — | complete | `public/app.jsx` |
| Copy as TSV | — | complete | `public/app.jsx` (copyTsv fn) |
| Export CSV | — | complete | `public/app.jsx` (downloadCsv fn) |
| Copy JSON | — | complete | `public/app.jsx` (copyJson fn) |
| Specs History Log | — | complete | `public/app.jsx`, `api/history.js` (Neon PostgreSQL + localStorage fallback) |
| Specs History Pagination | — | complete | `public/app.jsx` (historyPage state, 5 items/page) |
| Naming Converter Tab | — | complete | `public/app.jsx` |
| Batch Naming Converter | — | complete | `public/app.jsx` (standalone batch converter card in Naming Converter tab — real-time snake_case conversion of single/multiple names) |
| Workspace Reset Tool | — | complete | `public/app.jsx` (resetWorkspace fn) |
| Duplicate Generation Prevention | — | complete | `public/app.jsx` (generatedAttachments state lock + hint text) |
| File Type Validation | — | complete | `public/app.jsx` (addFiles — MIME type + extension fallback, explicit error on unsupported type) |
| Mobile Responsive Layout | — | complete | `public/index.html` (hamburger nav, guidelines grid single-col, reduced tab padding ≤768px) |


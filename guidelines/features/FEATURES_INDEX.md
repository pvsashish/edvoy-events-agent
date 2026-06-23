# Features Index

**Last updated:** 2026-06-23

| Feature | Doc | Status | Key Files |
|---------|-----|--------|-----------|
| Screenshot Upload | [UPLOAD_FLOW.md](upload/UPLOAD_FLOW.md) | complete | `public/app.jsx` (addFiles, toDataUrl) |
| Video Upload + Frame Extraction | [UPLOAD_FLOW.md](upload/UPLOAD_FLOW.md) | complete | `public/app.jsx` (extractVideoFrames) |
| GA4 / Amplitude Toggle | — | complete | `public/app.jsx`, `prompts/ga4.js`, `prompts/amplitude.js` |
| Feature Context Input | — | complete | `public/app.jsx` |
| Groq Vision Analysis | [GROQ_ANALYSIS_FLOW.md](groq_analysis/GROQ_ANALYSIS_FLOW.md) | complete | `api/analyze.js`, `prompts/ga4.js`, `prompts/amplitude.js` |
| Events Table Output | — | complete | `public/app.jsx` |
| Inline Table Editing | — | complete | `public/app.jsx` (handleCellChange) |
| Copy as TSV | — | complete | `public/app.jsx` (copyTsv) |
| Export CSV | — | complete | `public/app.jsx` (downloadCsv) |
| Copy JSON | — | complete | `public/app.jsx` (copyJson) |
| Specs History Log | [SPECS_HISTORY_FLOW.md](specs_history/SPECS_HISTORY_FLOW.md) | complete | `api/history.js`, `api/db.js`, `public/app.jsx` |
| Specs History Pagination | [SPECS_HISTORY_FLOW.md](specs_history/SPECS_HISTORY_FLOW.md) | complete | `public/app.jsx` (historyPage state, 5 items/page) |
| Naming Converter Tab | [NAMING_CONVERTER_FLOW.md](naming_converter/NAMING_CONVERTER_FLOW.md) | complete | `public/app.jsx` (getValidationError, autoCorrect) |
| Batch Naming Converter | [NAMING_CONVERTER_FLOW.md](naming_converter/NAMING_CONVERTER_FLOW.md) | complete | `public/app.jsx` |
| Workspace Reset Tool | — | complete | `public/app.jsx` (resetWorkspace) |
| Duplicate Generation Prevention | — | complete | `public/app.jsx` (generatedAttachments state lock) |
| File Type Validation | [UPLOAD_FLOW.md](upload/UPLOAD_FLOW.md) | complete | `public/app.jsx` (addFiles — MIME + extension fallback) |
| Mobile Responsive Layout | — | complete | `public/index.html` (hamburger nav, single-col grid ≤768px) |
| Sample Value Normalisation | [GROQ_ANALYSIS_FLOW.md](groq_analysis/GROQ_ANALYSIS_FLOW.md) | complete | `api/analyze.js` (is_clicked → true/false, *_id → dynamic value) |
| Scout — Event Map | [SCOUT_FLOW.md](scout/SCOUT_FLOW.md) | complete | `api/screens.js`, `api/db.js`, `public/app.jsx` — 105 events, 24 screens. Redesigned workspace (unified card, in-memory search, pagination, copy button, auto-fit canvas). ⚠️ Neon quota blocked until 2026-07-01. |

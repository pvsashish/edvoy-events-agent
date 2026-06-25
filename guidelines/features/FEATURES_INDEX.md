# Features Index

**Last updated:** 2026-06-25 (Groq auto-fallback on Gemini 429)

| Feature | Doc | Status | Key Files |
|---------|-----|--------|-----------|
| Screenshot Upload | [UPLOAD_FLOW.md](upload/UPLOAD_FLOW.md) | complete | `public/app.jsx` (addFiles, toDataUrl) |
| Video Upload + Frame Extraction | [UPLOAD_FLOW.md](upload/UPLOAD_FLOW.md) | complete | `public/app.jsx` (extractVideoFrames) |
| GA4 / Amplitude Toggle | — | complete | `public/app.jsx`, `prompts/ga4.js`, `prompts/amplitude.js` |
| Feature Context Input | — | complete | `public/app.jsx` |
| Gemini Analysis (3-step pipeline) | [GEMINI_ANALYSIS_FLOW.md](gemini_analysis/GEMINI_ANALYSIS_FLOW.md) | complete | `api/analyze.js`, `prompts/ga4.js`, `prompts/amplitude.js`, `prompts/identify.js`, `prompts/match.js` — Gemini 2.5 Flash primary; Groq Llama-4-Scout auto-fallback on 429 |
| Cross-Platform Consistency | [GEMINI_ANALYSIS_FLOW.md](gemini_analysis/GEMINI_ANALYSIS_FLOW.md) | complete | `api/analyze.js` (sessionEvents), `public/app.jsx` (eventsPlatform state) |
| Events Table Output | — | complete | `public/app.jsx` |
| Inline Table Editing | — | complete | `public/app.jsx` (handleCellChange) |
| Copy as TSV | — | complete | `public/app.jsx` (copyTsv) |
| Export CSV | — | complete | `public/app.jsx` (downloadCsv) |
| Copy JSON | — | complete | `public/app.jsx` (copyJson — _rowId stripped from output) |
| Specs History Log | [SPECS_HISTORY_FLOW.md](specs_history/SPECS_HISTORY_FLOW.md) | complete | `api/history.js`, `api/db.js`, `public/app.jsx` |
| Specs History Pagination | [SPECS_HISTORY_FLOW.md](specs_history/SPECS_HISTORY_FLOW.md) | complete | `public/app.jsx` (historyPage state, 5 items/page) |
| Naming Converter Tab | [NAMING_CONVERTER_FLOW.md](naming_converter/NAMING_CONVERTER_FLOW.md) | complete | `public/app.jsx` (getValidationError, autoCorrect) |
| Batch Naming Converter | [NAMING_CONVERTER_FLOW.md](naming_converter/NAMING_CONVERTER_FLOW.md) | complete | `public/app.jsx` |
| Workspace Reset Tool | — | complete | `public/app.jsx` (resetWorkspace) |
| Duplicate Generation Prevention | — | complete | `public/app.jsx` (generatedAttachments state lock + eventsPlatform check) |
| File Type Validation | [UPLOAD_FLOW.md](upload/UPLOAD_FLOW.md) | complete | `public/app.jsx` (addFiles — MIME + extension fallback) |
| Mobile Responsive Layout | — | complete | `public/index.html` (hamburger nav, single-col grid ≤768px) |
| Sample Value Normalisation | [GEMINI_ANALYSIS_FLOW.md](gemini_analysis/GEMINI_ANALYSIS_FLOW.md) | complete | `api/analyze.js` (is_clicked → true/false, *_id → dynamic value) |
| TrackingSheets Cards | — | complete | `public/app.jsx` (`TrackingSheetCard` component) — compact single-row card with provider logo, connected dot, icon-only Edit + Re-sync buttons, hover lift. Wired to existing `syncSheet` / `sheetConfig` state. |
| Manrope / Inter font system | — | complete | `public/index.html` — Manrope for headings/labels/display, Inter for buttons/nav/body. `--font-display: Manrope`, `--font-body: Inter`. |
| Scout — Event Map | [SCOUT_FLOW.md](scout/SCOUT_FLOW.md) | complete | `api/screens.js`, `api/db.js`, `public/app.jsx` — 105 events, 24 screens. Redesigned workspace (unified card, in-memory search, pagination, copy button, auto-fit canvas). ⚠️ Neon quota blocked until 2026-07-01. |

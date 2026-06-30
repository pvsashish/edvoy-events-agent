# Features Index

**Last updated:** 2026-06-30 (Groq-only; accuracy overhaul; merged table, paste, toggle lock)

| Feature | Doc | Status | Key Files |
|---------|-----|--------|-----------|
| Screenshot Upload | [UPLOAD_FLOW.md](upload/UPLOAD_FLOW.md) | complete | `public/app.jsx` (addFiles, toDataUrl) |
| Video Upload + Frame Extraction | [UPLOAD_FLOW.md](upload/UPLOAD_FLOW.md) | complete | `public/app.jsx` (extractVideoFrames) |
| GA4 / Amplitude Toggle | — | complete | `public/app.jsx`, `prompts/ga4.js`, `prompts/amplitude.js` |
| Feature Context Input | — | complete | `public/app.jsx` |
| AI Analysis (3-step pipeline) | [GEMINI_ANALYSIS_FLOW.md](gemini_analysis/GEMINI_ANALYSIS_FLOW.md) | complete | `api/analyze.js`, `prompts/*` — **Groq Llama-4-Scout only, temperature 0** (deterministic). Reuse-before-inventing, matched-event param hints, no screen-view events, dedup. Gemini removed 2026-06-30 |
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
| Merged events table | — | complete | `public/app.jsx` — Category + Event Name cells vertically merged (rowSpan) across an event's param rows, like the tracking spreadsheet. `handleGroupFieldChange` propagates merged-cell edits to the group. Data stays one-row-per-param (export unchanged). |
| Paste-to-upload | — | complete | `public/app.jsx` — ⌘V an image from the clipboard (iPhone screenshot → Mac) into the same `addFiles` flow. Generator tab only; ignores text paste. Drop zone auto-focuses so ⌘V works without clicking first. |
| Platform toggle lock | — | complete | `public/app.jsx` — GA4/Amplitude toggle `disabled` while `loading \|\| processing`; inactive option dimmed. Prevents switching platform mid-generation. |

# AI Analysis Flow (Groq)

**Last updated:** 2026-06-30 (Groq-only; Gemini removed)
**Status:** active
_(Filename kept as GEMINI_ANALYSIS_FLOW.md to avoid breaking doc links; the pipeline is Groq-only as of 2026-06-30.)_

## What It Does
3-step pipeline that receives base64 image(s) + platform + optional context from the frontend, runs them through Groq Llama-4-Scout (`meta-llama/llama-4-scout-17b-16e-instruct`, temperature 0 + seed 42), and returns a normalised JSON array of analytics events matching the tracking sheet format. Reproducible on real screenshots; Scout is a Mixture-of-Experts model so output is not bit-for-bit deterministic (contentless images vary).

## Entry Points
- File: `api/analyze.js`
- Route: `POST /api/analyze`
- Required env var: `GROQ_API_KEY` (sole AI provider — Gemini removed 2026-06-30)

## The 3-Step Pipeline

### Step 1 — Identify (vision)
Lists every distinct ACTIVE user interaction as plain English strings. Collapses repeated controls (a `+` on each list row = one interaction; the item is a param value). **Does not emit screen/page/tab views.**
- Prompt: `prompts/identify.js`
- Returns: `string[]` e.g. `["User clicks the add button on a document", "User clicks the Jump To button"]`
- On failure: skips gracefully, returns `[]` (Step 3 still runs without interaction context)

### Step 2 — Match (text-only)
Maps each interaction to an existing event name from the sheets/session, matching on **object + intent** (control-activation verbs are synonyms: clicked≈tapped≈selected). A tab/button CLICK is never treated as a screen VIEW. Reuse-first: only returns null when no existing event involves the same object.
- Prompt: `prompts/match.js`
- Input sources: `sheetData.eventNames` + `crossData.eventNames` + `sessionEvents.eventNames`
- Returns: `{ "User clicks the Jump To button": "jump_to_clicked" }` (nulls filtered out)
- On failure: skips gracefully, returns `{}` (Step 3 runs without pre-matched names)

### Step 3 — Generate (vision + text)
Produces the full tracking spec. Pre-matched names from Step 2 are injected as hard constraints ("PRE-MATCHED EVENT NAMES — MANDATORY"). For each matched event, its **known parameters** (from `sheetData.eventParams` / `crossData.eventParams`) are injected as "KNOWN PARAMETERS FOR MATCHED EVENTS — MANDATORY" so the model reuses the sheet's exact params (e.g. `jump_to_clicked` → `options_name`) instead of guessing. Prompts enforce reuse-before-inventing and case-sensitivity.
- Prompt: `prompts/ga4.js` or `prompts/amplitude.js` (with `resolvedNames` parameter)
- Returns: full events array

## Cross-Platform Consistency
When the user generates GA4 first and then switches to Amplitude (or vice versa), the frontend passes the already-generated events as `sessionEvents` in the request body. Step 2 includes these in its reference pool, so the new platform reuses the same event names instead of inventing new ones.

## Request Body
```json
{
  "images": ["data:image/png;base64,..."],
  "platform": "ga4",
  "featureContext": "optional string",
  "sheetData": { "eventNames": [], "parameters": [], "categories": [], "eventParams": { "jump_to_clicked": ["options_name"] } },
  "crossData": { "eventNames": [], "parameters": [] },
  "sessionEvents": { "eventNames": [], "parameters": [] }
}
```

## Response
```json
{ "events": [{ "category": "Search", "suggested_event_name": "search_bar_clicked", "parameter": "search_term", "sample_value": "MSc Computer Science UK" }] }
```

## Error Handling
- Non-POST → 405
- Empty images / bad platform → 400 with descriptive message
- JSON parse fully fails → 500 `"Failed to parse event specifications..."`
- Transient Groq errors (429 / 5xx) → `groqWithRetry` retries up to 2× with exponential backoff (3s → 6s), then throws
- Steps 1 & 2 fail silently to `[]` / `{}`; Step 3 failure throws 500

## Post-Processing (server-side)
Applied to every row before returning:
- Deletes `old_event_name` if model returns it
- `is_*` / `has_*` parameter → forces sample value to `true` or `false`
- Dimension params (`*_id`, `*_name`, `*_category`, `*_sub_category`, `*_term`, `*_code`, `from`, `options_name`, `option_selected`, `name`, `title`, `search_term`, `university`) → forces `"dynamic value"`
- Sample values over 60 chars → truncated with `…`
- **Parameter casing preserved** (only lowercased internally for the rule checks — names are case-sensitive)
- **Dedup**: one row per `event_name + parameter` (kills weak-model row-explosion)

## Architecture Decisions
- **Groq Llama-4-Scout** (`meta-llama/llama-4-scout-17b-16e-instruct`): sole provider, all 3 steps. 1,000 RPD free. Plain `fetch` to `api.groq.com/openai/v1/chat/completions`. `system` role message + images as `image_url` data URLs. No SDK. **temperature 0 + `seed: 42` + `top_p: 1`** → reproducible on real screenshots (MoE → not bit-for-bit deterministic).
- **Reuse before inventing**: prompts + the matched-event param hint push the model to reuse the sheet's exact events/params (case-sensitive) before coining new ones.
- **No screen-view events**: identify never emits "screen viewed" — there is no clean screen-view event in the sheet, so the tool doesn't mislabel (as a tab click) or invent one.
- **Regex JSON fallback**: Model occasionally wraps JSON in markdown fences — regex extracts `[…]` or `{…}`.
- **Steps 1 & 2 fail silently**: If Identify or Match fail, Step 3 still runs and produces a reasonable (if less consistent) spec.

## Change Log
| Date | Change |
|------|--------|
| 2026-06-30 | **Gemini fully removed — Groq-only, temperature 0 + seed 42 (reproducible on real screenshots; MoE not bit-for-bit).** Reuse-before-inventing for events + params; sheet parser returns `eventParams`; matched-event param hint injected; no screen-view events; matcher tightened (tab_clicked ≠ screen view); parameter casing preserved; row dedup. |
| 2026-06-25 | Added Groq Llama-4-Scout as auto-fallback when Gemini returns 429; llama-3.2-90b-vision-preview decommissioned by Groq → updated to llama-4-scout-17b-16e-instruct |
| 2026-06-25 | Migrated from Groq to Gemini 2.5 Flash as primary; added 3-step pipeline; cross-platform session events; 503 auto-retry |
| 2026-06-08 | Removed old_event_name from output; added is_clicked/id normalisation |
| 2026-06-07 | Switched Groq model from llama-3.2-11b-vision-preview to llama-4-scout-17b |
| 2026-06-07 | Initial implementation |

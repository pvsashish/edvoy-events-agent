# Gemini Analysis Flow

**Last updated:** 2026-06-25
**Status:** active

## What It Does
3-step pipeline that receives base64 image(s) + platform + optional context from the frontend, runs them through Gemini 2.5 Flash, and returns a normalised JSON array of analytics events matching the tracking sheet format.

## Entry Points
- File: `api/analyze.js`
- Route: `POST /api/analyze`
- Required env vars: `GEMINI_API_KEY`

## The 3-Step Pipeline

### Step 1 — Identify (vision)
Looks at the screenshot and lists every distinct user interaction as plain English strings.
- Prompt: `prompts/identify.js`
- Returns: `string[]` e.g. `["User taps search bar", "User clicks course card"]`
- On failure: skips gracefully, returns `[]` (Step 3 still runs without interaction context)

### Step 2 — Match (text-only)
Takes the identified interactions and checks them against all known event names from Google Sheets + session events. Returns a mapping of interaction → existing event name where a match exists.
- Prompt: `prompts/match.js`
- Input sources: `sheetData.eventNames` + `crossData.eventNames` + `sessionEvents.eventNames`
- Returns: `{ "User taps search bar": "search_bar_clicked" }` (nulls filtered out)
- On failure: skips gracefully, returns `{}` (Step 3 runs without pre-matched names)

### Step 3 — Generate (vision + text)
Produces the full tracking spec. Pre-matched names from Step 2 are injected as hard constraints ("PRE-MATCHED EVENT NAMES — MANDATORY").
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
  "sheetData": { "eventNames": [], "parameters": [], "categories": [] },
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
- Gemini 503 → auto-retried up to 2× with exponential backoff (3s → 6s), then 500

## Post-Processing (server-side)
Applied to every row before returning:
- Deletes `old_event_name` if model returns it
- `is_clicked` parameter → forces sample value to `true` or `false`
- `*_id` parameter → forces sample value to `"dynamic value"`
- Sample values over 60 chars → truncated with `…`
- Parameter names lowercased and trimmed

## Architecture Decisions
- **Gemini 2.5 Flash**: free tier, fast, strong instruction following. `gemini-2.5-pro` has 0 free quota on the free tier.
- **`systemInstruction` not user turn**: Gemini takes system prompts via the `systemInstruction` param, not as a message in the content array.
- **`inlineData` not `image_url`**: Gemini image format strips the `data:image/...;base64,` prefix and uses `{ inlineData: { mimeType, data } }`.
- **Regex JSON fallback**: Model occasionally wraps JSON in markdown fences — regex extracts `[…]` or `{…}`.
- **Steps 1 & 2 fail silently**: If Identify or Match fail, Step 3 still runs and produces a reasonable (if less consistent) spec.

## Change Log
| Date | Change |
|------|--------|
| 2026-06-25 | Migrated from Groq (Llama 4 Scout) to Gemini 2.5 Flash; added 3-step pipeline (identify → match → generate); added cross-platform session events; added 503 auto-retry with exponential backoff |
| 2026-06-08 | Removed old_event_name from output; added is_clicked/id normalisation |
| 2026-06-07 | Switched Groq model from llama-3.2-11b-vision-preview to llama-4-scout-17b |
| 2026-06-07 | Initial implementation |

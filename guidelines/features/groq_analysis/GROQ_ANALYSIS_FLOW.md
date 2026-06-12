# Groq Vision Analysis Flow

**Last updated:** 2026-06-08
**Status:** active

## What It Does
Receives base64 image(s) + platform + optional context from the frontend, sends them to Groq's vision model, and returns a normalised JSON array of analytics events matching the tracking sheet format.

## Entry Points
- File: `api/analyze.js`
- Route: `POST /api/analyze`
- Required env vars: `GROQ_API_KEY`

## End-to-End Flow
1. Frontend POSTs `{ images, platform, featureContext }` — `api/analyze.js:1`
2. Validates method is POST — returns 405 if not — `api/analyze.js:13`
3. Validates `images` array is non-empty — returns 400 — `api/analyze.js:19`
4. Validates `platform` is `ga4` or `amplitude` — returns 400 — `api/analyze.js:23`
5. Selects system prompt: `GA4_PROMPT` or `AMP_PROMPT` from `prompts/` — `api/analyze.js:27`
6. Builds `userContent` array: text message + one `image_url` entry per image — `api/analyze.js:29`
7. Calls `groq.chat.completions.create()` with model `meta-llama/llama-4-scout-17b-16e-instruct`, temp 0.3, max 4096 tokens — `api/analyze.js:51`
8. Parses response: tries `JSON.parse(raw)` first; falls back to regex `\[[\s\S]*\]` extraction — `api/analyze.js:58`
9. Normalises each event:
   - Deletes `old_event_name` if model returns it
   - Forces `is_clicked` parameter sample value to `true` or `false`
   - Forces `*_id` parameter sample value to `"dynamic value"`
   — `api/analyze.js:72`
10. Returns `{ events }` — `api/analyze.js:93`

## Hard Invariants
- `images` must contain at least one entry — API rejects empty array
- `platform` must be exactly `"ga4"` or `"amplitude"`
- Response is always `{ events: [] }` on success, never null

## API Contract
**Input:**
```json
{ "images": ["data:image/jpeg;base64,..."], "platform": "ga4", "featureContext": "optional string" }
```
**Output:**
```json
{ "events": [{ "category": "Search", "suggested_event_name": "university_searched", "parameter": "search_term", "sample_value": "MSc Computer Science UK" }] }
```
**Fallback:** JSON parse failure → 400 with message. Groq error → 500.

## Error Handling
- Non-POST → 405
- Empty images / bad platform → 400 with descriptive message
- JSON parse fully fails (no array extractable) → 400 `"Failed to parse event specifications..."`
- Groq SDK error → 500 `err.message || "AI analysis failed"`

## Architecture Decisions
- **temp 0.3**: Low temperature for consistent, deterministic naming
- **Regex fallback**: Model occasionally wraps JSON in markdown fences — regex extracts the array
- **Client-side normalisation skipped**: Sample value rules enforced server-side so TSV/CSV/JSON exports are always clean

## Change Checklist
Before modifying:
- [ ] Verify Groq model ID not decommissioned — check console.groq.com/docs/deprecations
- [ ] Test JSON parse fallback still works if prompt changes
- [ ] Verify `is_clicked` and `*_id` normalisation still correct
- [ ] Run curl test: `POST /api/analyze` with a real image

## Change Log
| Date | Change | Author |
|------|--------|--------|
| 2026-06-08 | Removed old_event_name from output; added is_clicked/id normalisation | session |
| 2026-06-07 | Switched model from llama-3.2-11b-vision-preview (decommissioned) to llama-4-scout-17b | session |
| 2026-06-07 | Initial implementation | session |

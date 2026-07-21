# Specs History Flow

**Last updated:** 2026-07-21 (list-row responsive fix — see below) · 2026-07-03 (Space-scoped; thumbnails moved to Cloudflare R2 + auto-migration)
**Status:** active

## What It Does
Persists every generated event spec to Neon PostgreSQL so PMs can retrieve and re-use past work. Falls back to localStorage if `DATABASE_URL` is unset. Supports pagination (5 items/page), individual delete, and clear-all. Scoped by **Space** (`edvoy-student` / `edvoy-connect`, see the sidebar "Space" dropdown) — each space only sees its own history, `clearAll` only wipes the active space's rows. Each item's preview thumbnail lives on Cloudflare R2 (`history/<id>`), not just the generating browser.

## Entry Points
- Files: `api/history.js`, `api/db.js`
- Routes: `GET /api/history`, `POST /api/history`, `DELETE /api/history`
- Required env vars: `DATABASE_URL` (optional — degrades gracefully without it)

## End-to-End Flow

### Write (after Generate)
1. User clicks "Generate Events" — frontend calls `POST /api/analyze` — `public/app.jsx:analyze()`
2. On success, frontend constructs history item `{ id, name, timestamp, platform, eventsCount, events, featureContext }`
3. Frontend POSTs item to `POST /api/history` — `public/app.jsx`
4. `api/history.js` checks `DATABASE_URL` — if missing, returns `{ history: [], warning: '...' }` — `api/history.js:4`
5. Calls `initDb()` from `api/db.js` — creates table if not exists (idempotent, singleton promise) — `api/db.js:14`
6. INSERTs row, serialises `events` as JSON string — `api/history.js:48`
7. Returns full updated history (DESC by `created_at`) — `api/history.js:55`

### Read (History tab load)
1. History tab mounts → frontend GETs `/api/history` — `public/app.jsx`
2. `api/history.js` queries all rows ORDER BY `created_at DESC` — `api/history.js:27`
3. Each row's `events` field parsed back from JSON string — `api/history.js:32`
4. Frontend paginates: 5 items per page via `historyPage` state

### Delete
1. User clicks delete icon on history item — frontend DELETEs `{ id }` to `/api/history`
2. `api/history.js` runs `DELETE WHERE id = $1` — `api/history.js:72`
3. Returns full updated history
4. `clearAll: true` in body → `DELETE FROM edvoy_specs_history` (no WHERE)

## Hard Invariants
- `DATABASE_URL` absence must NOT throw — returns empty array + warning
- `initDb()` is idempotent — singleton `initPromise` prevents duplicate table creation on concurrent cold starts
- `events` column stored as TEXT (JSON string), never raw object

## API Contract
**GET** → `{ history: HistoryItem[] }`
**POST** body: `{ item: HistoryItem, thumbnail?: string }` → `{ success: true, history: HistoryItem[] }` — `thumbnail` is a base64 data URL, uploaded to R2 (`history/<id>.<ext>`) if present; the row's `thumbnail_url` stores the CDN link.
**PATCH** body: `{ id: string, thumbnail: string }` → `{ success: true, thumbnailUrl, skipped?: true }` — one-time migration hook: attaches a thumbnail to a record that doesn't have one yet (`skipped: true` if it already does, never overwrites).
**DELETE** body: `{ id: string }` or `{ clearAll: true, space?: string }` → `{ success: true, history: HistoryItem[] }` — deletes the R2 thumbnail object(s) too, not just the DB row(s).

```ts
type HistoryItem = {
  id: string;
  name: string;
  timestamp: string; // ISO 8601 string (new Date().toISOString()); displayed via formatTimestamp() helper
  platform: 'ga4' | 'amplitude';
  eventsCount: number;
  events: Event[];
  featureContext?: string;
  space?: string; // 'edvoy-student' (default) | 'edvoy-connect'
  thumbnailUrl?: string; // R2 CDN link, null until a thumbnail exists
}
```

## Thumbnail migration (self-healing, client-side)
Items generated before 2026-07-03 only have their thumbnail cached in the generating browser's `localStorage` (`edvoy_history_thumbs`) — the DB has no `thumbnail_url` for them. On every app load, `public/app.jsx` checks for history items missing `thumbnailUrl` that this browser happens to have cached, and PATCHes them up to R2 automatically. Runs once per session (ref guard), safe to re-run (server-side skip if already migrated). Only recovers a thumbnail if opened in the browser that originally generated it — no way to recover a thumbnail that was never cached anywhere.

## Fallback Behaviour
If `DATABASE_URL` missing → `api/history.js` returns `{ history: [], warning }`. Frontend reads `warning` field and activates localStorage mode — stores/reads from `localStorage.getItem('edvoy_specs_history')`.

## Error Handling
- DB connection fail → 500 `err.message`
- Missing `item` in POST → 400
- Missing `id` in DELETE (non-clearAll) → 400
- Non-GET/POST/DELETE → 405

## Change Checklist
Before modifying:
- [ ] Verify `initDb()` singleton still works if called concurrently
- [ ] Test DB-less fallback: remove DATABASE_URL, verify localStorage kicks in
- [ ] Test pagination: generate >5 specs, verify page navigation works

## Change Log
| Date | Change | Author |
|------|--------|--------|
| 2026-07-21 | List row's "Rows: N • Generated: ..." metadata line wrapped mid-word at narrow widths (the flex row had no `flexWrap`, so individual spans shrank and their text broke instead of the whole label unit dropping to the next line). Added `flexWrap:'wrap'` + `whiteSpace:'nowrap'` on each span so "Rows: N" and "Generated: ..." always wrap as intact units. | session |
| 2026-07-06 | History thumbnails are now clickable → open the shared image-preview lightbox (prev/next across all history items with a thumbnail; `stopPropagation` so the click doesn't also load the spec). See "Image Preview Lightbox" in FEATURES_INDEX. | session |
| 2026-07-03 | Thumbnails moved to Cloudflare R2 (`history/<id>`); added PATCH for self-healing client-side migration of pre-existing localStorage-only thumbnails | session |
| 2026-07-03 | Scoped by Space (`edvoy-student`/`edvoy-connect`); `clearAll` accepts optional `space` | session |
| 2026-06-08 | Added delete individual + clearAll support | session |
| 2026-06-08 | Added pagination (5 items/page, historyPage state) | session |
| 2026-06-07 | Initial implementation — Neon PostgreSQL + localStorage fallback | session |

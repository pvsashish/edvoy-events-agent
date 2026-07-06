# Scout — Event Map

**Last updated:** 2026-06-23

## What It Does
Visual analytics dictionary. Search an event name or screen category → see the real screenshot with the highlighted UI element. Useful for onboarding, QA, and confirming which element fires which event.

## How Data Gets In
Data is ingested manually per session:
1. Take screenshots of the relevant edvoy page with the triggering element visible
2. Save to a Desktop folder named after the screen category (e.g. `Homepage/`, `Search/`)
3. Name each file `<event_name>.png` — the filename IS the event_name
4. For the same event firing in multiple places, use `<event_name> - 2.png`, `<event_name> - 3.png` etc. (keep the full filename as event_name — do NOT strip the ` - 2` suffix)
5. Claude reads the folder, POSTs each file to `POST /api/screens`

**Source of truth:** the images folder. If an event has no image, it is not in Scout. If a folder is replaced, all old records for that screen are deleted first and re-ingested from scratch.

One DB record per event/image. Same event firing in multiple places = multiple records.

## DB Table (`edvoy_screens`)
```sql
edvoy_screens (
  id          VARCHAR PRIMARY KEY,
  screen_name VARCHAR NOT NULL,   -- MUST match a CAT_COLOR key (e.g. "Search", "Homepage")
  platform    VARCHAR NOT NULL,   -- 'ga4' | 'amplitude'
  image       TEXT NOT NULL,      -- base64 data URL (png)
  events      JSONB NOT NULL,     -- [{ event_name, label, bbox: [x,y,w,h] }]
  created_at  TIMESTAMP
)
```

**bbox:** `[x, y, width, height]` in raw pixels of the screenshot. Always `[0,0,0,0]` for manually captured screenshots (highlight is drawn into the image itself). Scout skips rendering the overlay when `bbox[2] === 0`.

## Current Categories (206 records total: 126 GA4 + 80 Amplitude)
The table below is the original **GA4** set (105 records / 24 screens). **Amplitude** screens and later GA4 additions (Profile, Shortlist) were added afterwards (see notes) and are not all itemised here.

| screenName (GA4) | Records |
|---|---|
| App | 2 |
| Articles | 3 |
| Career | 1 |
| City Page | 6 |
| Compare | 1 |
| Compare page | 1 |
| Contact | 7 |
| Country Page | 7 |
| Course Shortlist | 1 |
| Courses | 3 |
| Events | 6 |
| Exams | 2 |
| FAQs | 1 |
| Footer Menu | 4 |
| Header Menu | 10 |
| Homepage | 9 |
| IELTS Page | 7 |
| LP3 and LP4 | 11 |
| Office Location Pages | 4 |
| Results | 1 |
| Search | 5 |
| Subject Page | 8 |
| Testimonials | 2 |
| Universities | 3 |

> **Note:** Country Page has 7 records (1 duplicate of `explore_universities_clicked` from a retry during ingestion). Intentionally kept — can be cleaned up later.

> **Amplitude screens (80 records, `platform: amplitude`, `space: edvoy-student`):** ingested in later batches, incl. `Genie Banner` (3) and — added 2026-07-06 — **`Genie Banner Logged Out`** (3: `genie_banner_viewed_logged_out`, `genie_banner_clicked_logged_out`, `genie_banner_closed_logged_out`). CAT_COLOR entry for the new category was added in `public/app.jsx` (same purple as Genie Banner).

> **Later GA4 additions (2026-07-06):** `Profile` (19 events) and `Shortlist` (2: `courses_under_shortlist_clicked`, `shortlist_tab_clicked`), `platform: ga4`, `space: edvoy-student`. Both categories already existed in `CAT_COLOR`/`GA4_CATEGORIES` (no code change needed). Event names kept verbatim from filenames incl. ` - 1`/` -2` suffixes.

> **Pagination is group-aware (2026-07-06):** the rail packs whole screen groups into pages (~10 events/page, never splitting a group across a page boundary). Previously it sliced the flat event list 10/page then grouped, so a large category's header repeated across pages showing partial slices. A single group >10 events now owns its own page.

## API
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/screens` | List all (no image field — fast) |
| GET | `/api/screens?q=foo` | Search by screen_name OR event_name (ILIKE) |
| GET | `/api/screens?id=<id>` | Fetch single record with image |
| POST | `/api/screens` | Create: `{ screenName, platform, image, events }` |
| DELETE | `/api/screens` | `{ id }` for one, `{ clearAll: true }` for all |

## Frontend (app.jsx)
State: `scoutQuery`, `scoutResults`, `scoutAllResults`, `scoutSelected`, `scoutActiveEvent`, `scoutImgDims`, `scoutImgLoading`, `scoutSearched`, `scoutLoading`, `scoutLastSearchQuery`, `scoutDisplayedImage`, `scoutPlatformFilter`, `scoutPage`, `scoutToast`, `scoutHoveredId`

Key behaviours:
- **In-memory search**: full list loaded once on mount into `scoutAllResults`; `runScoutSearch(q)` filters in-memory (instant, no DB round-trip). DB query only as fallback if mount preload hasn't landed yet.
- **Image preloading**: on mount, all images fetched in background (batches of 4) into `scoutAllResults` + `scoutResults` — selecting any event is instant
- **Platform toggle**: All / GA4 / AMP segmented tabs in workspace header; AMP disabled until Amplitude events exist
- **Screen grouping**: events grouped by screenName with coloured section headers, 10 per page
- **Pagination**: client-side, 10 events/page, shown in workspace footer
- **Copy button**: per event row, copies event name to clipboard, shows dark toast confirmation
- **Auto-fit canvas**: screenshot centered in 720px fixed-height canvas, `max-width/max-height: 100%; object-fit: contain` — any size screenshot fits without layout break
- **Red highlight box**: `#E53935`, `border-radius: 14px`, positioned via bbox % of natural image dims (only when `bbox[2] > 0`)
- **Form-factor chip**: Mobile if `imgH > imgW`, Desktop otherwise

## Workspace redesign (2026-06-23)
Replaced the old two-card layout (preview card + list card) with a single unified workspace card:
- **Header strip**: screen name + GA4 chip + form-factor chip (left) · All/GA4/AMP segmented filter (right)
- **Body**: radial purple gradient canvas (left, 720px) + event rail (right, 380px) in CSS grid
- **Footer**: GA4 event count + screen count stats (left) · Prev/page numbers/Next pagination (right)
- Design tokens from handoff: `--purple: #7C3AED`, `--red: #E53935`, card shadow `0 16px 48px -24px rgba(15,15,20,.10)`

## Screen Name Rules
`screenName` MUST exactly match a key in `CAT_COLOR` (line ~86 of `app.jsx`). Using an invalid name still saves to DB but renders without a category colour badge.

## Space (2026-07-03)
Scout is now scoped by the same "Space" dropdown as sheet config + history (`edvoy-student` / `edvoy-connect`). Pass `space` in the POST body — defaults to `edvoy-student` if omitted (so all pre-2026-07-03 records + this doc's example stay correct without a migration).

## Ingestion Script (reusable)
```python
import base64, json, urllib.request, os, time

def post_event(filepath, event_name, screen_name, space='edvoy-student'):
    with open(filepath, 'rb') as f:
        b64 = 'data:image/png;base64,' + base64.b64encode(f.read()).decode()
    data = json.dumps({
        'screenName': screen_name, 'platform': 'ga4', 'space': space, 'image': b64,
        'events': [{'event_name': event_name, 'label': event_name, 'bbox': [0,0,0,0]}]
    }).encode()
    req = urllib.request.Request(
        'http://localhost:3333/api/screens', data=data,
        headers={'Content-Type': 'application/json'}, method='POST'
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

# Ingest a full folder
folder = '/path/to/ScreenName'
screen_name = 'ScreenName'
for fname in sorted(f for f in os.listdir(folder) if f.endswith('.png')):
    event_name = fname.replace('.png', '')  # keep full name including ' - 2' suffixes
    result = post_event(os.path.join(folder, fname), event_name, screen_name)
    print(f'{event_name}: {result}')
    time.sleep(2)  # avoid Neon SSL flakiness
```

Note: Neon DB has occasional SSL connection flakiness — `api/screens.js` has `queryWithRetry` (2 retries, 3s delay) to handle this server-side. If a POST returns 500, wait 8s and retry manually.

## Resolved: images moved to Cloudflare R2 (2026-07-03)
Images used to be base64 TEXT in Postgres, which burned through Neon's free transfer quota (105 screenshots preloaded on every mount). Fixed permanently: all images now live on Cloudflare R2 (bucket `edvoy-events-assets`), served straight from its public CDN URL.
- Neon holds only metadata: `id`, `screen_name`, `platform`, `events`, `image_url` (the old base64 `image` column was dropped, ~140MB reclaimed)
- `api/r2.js` — reusable S3-compatible upload/delete helper
- R2 env vars are set on Vercel (Production) — ingestion (POST) works live

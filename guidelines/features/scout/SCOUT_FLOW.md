# Scout — Event Map

**Last updated:** 2026-06-21

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

## Current Categories (90 records across 22 screens)
| screenName | Records |
|---|---|
| App | 2 |
| Articles | 3 |
| Career | 1 |
| City Page | 6 |
| Compare | 1 |
| Compare page | 1 |
| Contact | 7 |
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
| Testimonials | 2 |
| Universities | 3 |

## API
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/screens` | List all (no image field — fast) |
| GET | `/api/screens?q=foo` | Search by screen_name OR event_name (ILIKE) |
| GET | `/api/screens?id=<id>` | Fetch single record with image |
| POST | `/api/screens` | Create: `{ screenName, platform, image, events }` |
| DELETE | `/api/screens` | `{ id }` for one, `{ clearAll: true }` for all |

## Frontend (app.jsx)
State: `scoutQuery`, `scoutResults`, `scoutSelected`, `scoutActiveEvent`, `scoutImgDims`, `scoutImgLoading`, `scoutSearched`, `scoutLoading`

Key behaviours:
- Auto-loads all records on Scout tab open (`runScoutSearch('')`)
- **Image preloading**: on app mount, after list loads, all images are fetched in background (batches of 4) and stored in `scoutResults` state — clicking any event is instant
- On-demand fetch (`GET /api/screens?id=`) remains as fallback if preload hasn't reached that image yet
- Event list shows `event_name` (mono font) + `screenName` below it for disambiguation
- Clicking an event → if `bbox[2] > 0`, renders red-orange highlight box (`#FF3D00`) positioned via `%` of natural image dimensions

## Screen Name Rules
`screenName` MUST exactly match a key in `CAT_COLOR` (line ~86 of `app.jsx`). Using an invalid name still saves to DB but renders without a category colour badge.

## Ingestion Script (reusable)
```python
import base64, json, urllib.request, os, time

def post_event(filepath, event_name, screen_name):
    with open(filepath, 'rb') as f:
        b64 = 'data:image/png;base64,' + base64.b64encode(f.read()).decode()
    data = json.dumps({
        'screenName': screen_name, 'platform': 'ga4', 'image': b64,
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

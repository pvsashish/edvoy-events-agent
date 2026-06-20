# Scout — Event Map

**Last updated:** 2026-06-21

## What It Does
Visual analytics dictionary. Search an event name or screen category → see the real screenshot with the highlighted UI element. Useful for onboarding, QA, and confirming which element fires which event.

## How Data Gets In
Data is ingested manually per session:
1. Take viewport screenshots of the relevant edvoy page
2. Draw a red highlight box over the element that fires the event
3. Save screenshots to Desktop (one file per event, named after the event)
4. Claude reads the files, POSTs each to `POST /api/screens`

One DB record per event. Same event firing in multiple places = multiple records with the same `event_name`.

## DB Table (`edvoy_screens`)
```sql
edvoy_screens (
  id          VARCHAR PRIMARY KEY,
  screen_name VARCHAR NOT NULL,   -- MUST match a CAT_COLOR key (e.g. "Articles", "IELTS Page")
  platform    VARCHAR NOT NULL,   -- 'ga4' | 'amplitude'
  image       TEXT NOT NULL,      -- base64 data URL (jpeg 0.85 or png)
  events      JSONB NOT NULL,     -- [{ event_name, label, bbox: [x,y,w,h] }]
  created_at  TIMESTAMP
)
```

**bbox:** `[x, y, width, height]` in raw pixels of the screenshot. Set to `[0,0,0,0]` when the highlight is already drawn in the image (Scout skips rendering the overlay when `bbox[2] === 0`).

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
`screenName` MUST exactly match a key in `CAT_COLOR` (line ~86 of `app.jsx`). Current valid values:
- `Articles`, `Course Page`, `Countries`, `Compare`, `Compare page`
- `LP3 and LP4`, `IELTS Page`, `Home`, `University Page`, `Portal`
- (see full list in `CAT_COLOR`)

Using an invalid name still saves to DB but renders without a category colour badge.

## Ingestion Script (reusable)
```python
import base64, json, urllib.request, time

def post_event(dir_path, filename, screen_name, event_name, label=''):
    with open(f'{dir_path}/{filename}', 'rb') as f:
        b64 = 'data:image/png;base64,' + base64.b64encode(f.read()).decode()
    data = json.dumps({
        'screenName': screen_name, 'platform': 'ga4', 'image': b64,
        'events': [{'event_name': event_name, 'label': label or event_name, 'bbox': [0,0,0,0]}]
    }).encode()
    req = urllib.request.Request(
        'http://localhost:3333/api/screens', data=data,
        headers={'Content-Type': 'application/json'}, method='POST'
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())
```

Note: Neon DB has occasional SSL connection flakiness — retry after 5–8s on 500 errors.

# Upload + Video Frame Extraction Flow

**Last updated:** 2026-07-06 (scene-change frame extraction; original video kept for playback)
**Status:** active

## What It Does
Accepts image files (PNG/JPG/WEBP) and video files (MP4/MOV/AVI/any format) via drag-and-drop or file browser. Images are read as base64 data URLs. Videos are processed client-side via Canvas API — **scene-change** JPEG frames extracted (one per distinct screen, not a fixed count), so the model only ever receives image data. The original video is also kept (in-memory blob URL) so the preview lightbox can play it.

## Entry Points
- File: `public/app.jsx` — `addFiles()` function
- Trigger: drop event, file input `onChange`, or programmatic call

## End-to-End Flow

### Image files
1. User drops/selects file(s) — `onDrop` or `fileRef.current.onChange` fires — `public/app.jsx`
2. `addFiles(files)` filters for `image/*` or `video/*` MIME type; invalid types show error — `public/app.jsx:addFiles()`
3. For image: `toDataUrl(file)` wraps `FileReader.readAsDataURL` in a Promise — returns `"data:image/jpeg;base64,..."`
4. Item pushed to `attachments` state as `{ id, type: 'image', name, dataUrl }`
5. Thumbnail renders: `<img src={dataUrl} />` in `AttachmentThumb` component

### Video files (scene-change extraction)
1. Same entry as above — type check routes to `extractVideoFrames(file)` (no fixed count)
2. Hidden `<video>` loads a blob URL. If `duration` is non-finite (some stream/webm recordings report `Infinity`), it's resolved first by seeking to `1e7` (clamps to the real end) before sampling.
3. **Densely samples** the video (~every 0.5s, up to `MAX_SAMPLES=60` probe points): at each probe, draws to a tiny 64×36 canvas and computes a normalised **RGB** mean-difference vs the last *kept* frame. (RGB, not grayscale — a grayscale diff misses colour-only screen changes.)
4. Keeps a full-res JPEG frame only when the diff exceeds `DIFF_THRESH=0.075` (a "new screen"); the first frame is always kept. Loading/scrolling/static stretches produce no extra frames.
5. Frame count is therefore **content-driven** (= number of distinct screens), hard-capped at `MAX_KEEP=12` (even-spread downsample if exceeded) to bound AI cost.
6. The **original video is retained** as `videoUrl = URL.createObjectURL(file)` for lightbox playback; revoked on remove / workspace reset / history load.
7. Item pushed to `attachments` as `{ id, type: 'video', name, frames[], thumb: frames[0], frameCount, videoUrl }`
8. Thumbnail shows first frame + play icon + frame-count badge; clicking opens the lightbox, which plays `videoUrl` (`<video controls>`) rather than showing stills.

### At analysis time
- `analyze()` function flattens attachments: images → `[dataUrl]`, videos → `[...frames]`
- All collected into `images` array sent to `POST /api/analyze`

## Hard Invariants
- Blob URL always revoked after frame extraction (memory leak prevention)
- MIME type check must pass (`image/*` or `video/*`) — extension fallback if MIME is empty
- `processing` state set during async frame extraction — blocks Generate button

## Error Handling
- Unsupported file type → `setError('Unsupported file type...')` — explicit message, file not added
- Video with `error` event (corrupt/unreadable) → `resolve([])` — empty frames, item still added with frameCount 0
- Stale error cleared on next valid file add

## Architecture Decisions
- **Client-side frame extraction**: the AI receives only images. No server-side video processing needed — keeps API simple and avoids large payload uploads.
- **3 frames**: Balances coverage vs. payload size. Frame timestamps at 25%, 50%, 75% of duration.
- **JPEG 0.85 quality**: Good fidelity for UI screenshots, keeps base64 size reasonable.

## Change Checklist
Before modifying:
- [ ] Test video extraction with MP4, MOV formats
- [ ] Verify blob URL always revoked (check for memory leaks in DevTools)
- [ ] Verify `processing` state correctly blocks Generate button during extraction

## Change Log
| Date | Change | Author |
|------|--------|--------|
| 2026-06-08 | Added MIME type + extension fallback validation, explicit error on unsupported type | session |
| 2026-06-07 | Added video frame extraction (3 frames via Canvas API) | session |
| 2026-06-07 | Initial image upload implementation | session |

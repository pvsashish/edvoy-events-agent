# Upload + Video Frame Extraction Flow

**Last updated:** 2026-06-08
**Status:** active

## What It Does
Accepts image files (PNG/JPG/WEBP) and video files (MP4/MOV/AVI/any format) via drag-and-drop or file browser. Images are read as base64 data URLs. Videos are processed client-side — 3 JPEG frames extracted via Canvas API — so Groq only ever receives image data.

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

### Video files
1. Same entry as above — type check routes to `extractVideoFrames(file, 3)`
2. `URL.createObjectURL(file)` creates blob URL — `public/app.jsx:extractVideoFrames()`
3. Hidden `<video>` element loads the blob URL with `preload: 'metadata'`
4. On `loadedmetadata`: calculates 3 evenly-spaced timestamps across duration
5. Seeks video to each timestamp via `video.currentTime = times[idx]`
6. On each `seeked` event: draws frame to `<canvas>`, calls `canvas.toDataURL('image/jpeg', 0.85)`
7. After all frames captured: `URL.revokeObjectURL(url)` cleans up blob
8. Item pushed to `attachments` state as `{ id, type: 'video', name, frames[], thumb: frames[0], frameCount }`
9. Thumbnail shows first frame as preview with play icon overlay + frame count badge

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
- **Client-side frame extraction**: Groq API receives only images. No server-side video processing needed — keeps API simple and avoids large payload uploads.
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

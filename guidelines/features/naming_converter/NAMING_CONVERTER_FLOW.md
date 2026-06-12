# Naming Converter Tab Flow

**Last updated:** 2026-06-08
**Status:** active

## What It Does
Standalone tab (no AI call required) that converts free-text event/property names into correctly formatted GA4 (snake_case) or Amplitude (Title Case) names in real time. Includes batch mode for converting multiple names at once, and inline validation with click-to-apply auto-correct.

## Entry Points
- File: `public/app.jsx` — Naming Converter tab section
- Trigger: user navigates to "Naming Converter" in sidebar

## End-to-End Flow

### Single name conversion
1. User types in naming input field — `onChange` fires
2. `getValidationError(value, type, platform)` runs synchronously — checks naming rules:
   - GA4: must be snake_case, no spaces, max 40 chars, no reserved names
   - Amplitude: must be Title Case, verb + noun pattern
3. If invalid: red border + error message + "Auto-correct" button shown
4. User clicks "Auto-correct" → `autoCorrect(value, platform)` converts: lowercases + replaces spaces with `_` (GA4) or Title Cases words (Amplitude)
5. Corrected name applied to input field

### Batch conversion
1. User pastes multiple names (one per line) into batch textarea
2. Each line processed through same `autoCorrect()` function
3. Converted names rendered in output list
4. "Copy all" button copies newline-separated converted names to clipboard

### Inline table validation (Generate tab)
- Each editable cell in the events table runs `getValidationError()` on blur
- Red highlight + tooltip if invalid naming
- User can manually fix or click auto-correct per cell

## Hard Invariants
- Conversion is purely client-side — no API call
- Platform toggle affects conversion rules immediately (switching GA4 → Amplitude re-validates all current inputs)

## API Contract
N/A — purely client-side.

## Error Handling
- Empty input → no error shown (validation only on non-empty values)
- All-invalid batch → each line shows individual error

## Architecture Decisions
- **Synchronous validation**: No debounce needed — regex-based, runs in <1ms even on long names.
- **Click-to-apply**: Auto-correct is opt-in, not auto-applied, so PM retains control over naming choices.

## Change Checklist
Before modifying:
- [ ] Verify GA4 reserved name list is up to date (check GA4 docs)
- [ ] Test batch mode with 50+ names — ensure no UI freezing
- [ ] Verify platform toggle correctly re-runs validation

## Change Log
| Date | Change | Author |
|------|--------|--------|
| 2026-06-08 | Added batch naming converter card | session |
| 2026-06-08 | Initial inline naming validator in Generate tab | session |

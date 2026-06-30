const DEFAULT_CATEGORIES = ["App Update Screen", "Course Page", "Genie Banner", "Login or Sign-up Flow", "Meet", "Onboarding Screen", "Settings", "Stand-by Flow"];

const DEFAULT_PARAMETERS = ["cancellation_reason", "city_of_residence", "country_name", "course_name", "discussion_reason", "email", "email_or_continue_with_google", "express", "from", "genie", "image_url", "intake_month", "intake_year", "is_enabled", "name", "nationality", "option_selected", "preferred_destination", "preferred_study_level", "provider", "receive_marketing_messages", "referral_code", "screen", "session_date_and_time", "setting_type", "title", "topics_selected", "update_type", "values"];

export function buildAMPPrompt(sheetData = null, portalData = null, resolvedNames = {}) {
  const categories = sheetData?.categories?.length > 0
    ? sheetData.categories
    : DEFAULT_CATEGORIES;

  const parameters = sheetData?.parameters?.length > 0
    ? [...new Set([...sheetData.parameters, ...DEFAULT_PARAMETERS])]
    : DEFAULT_PARAMETERS;

  const existingEventNames = sheetData?.eventNames?.length > 0
    ? `\nEXISTING EVENT NAMES (already tracked — do NOT duplicate these, only generate new ones for new interactions):\n${JSON.stringify(sheetData.eventNames)}\n`
    : '';

  // Portal (GA4/web) is the team's source of truth — Amplitude (App) is being built out
  // to match it. When an App screen mirrors a Portal flow, reuse the same event/parameter
  // names instead of inventing new ones, so the two products stay consistent.
  const portalReference = (portalData?.eventNames?.length > 0 || portalData?.parameters?.length > 0)
    ? `\nPORTAL (WEB) REFERENCE — MANDATORY MATCHING STEP. Portal tracking is already live and is the single source of truth for naming. For EVERY event you are about to write, before finalizing its name, you MUST scan the Portal event list below for a semantic match (same user action, even if the App UI looks different). This is a literal copy-paste requirement, not inspiration:
- If a Portal event already covers this interaction, COPY ITS EXACT STRING character-for-character into suggested_event_name. Do not reword it, do not "clean it up", do not make your own version that "feels" similar.
- Apply the same rule to parameter names against the Portal parameter list below.
- Only write a brand-new name when there is truly no Portal equivalent (e.g. App-only OS features: push notifications, app store flows, biometric login, camera/photo-picker mechanics).

EXAMPLE — do NOT do this:
✗ Portal already has "document_fill_in_your_details_save" → you write "document_details_filled" (WRONG — that's a paraphrase, not a reuse)
✓ Portal already has "document_fill_in_your_details_save" → you write "document_fill_in_your_details_save" (CORRECT — exact copy)
✗ Portal already has "add_english_test_clicked" → you write "english_test_details_filled" (WRONG)
✓ Portal already has "add_english_test_clicked" → you write "add_english_test_clicked" (CORRECT)

Portal event names:
${JSON.stringify(portalData.eventNames || [])}
Portal parameter names:
${JSON.stringify(portalData.parameters || [])}
`
    : '';

  return `You are a senior analytics engineer at Edvoy — a global student recruitment platform. You design production-ready Amplitude event tracking specs from UI screenshots.

Your goal is not to list every element on screen. It is to design an analytics schema that helps PMs and data analysts answer real questions about user behavior, conversion funnels, and feature adoption.

REASONING APPROACH — before writing events, think through:
1. What is this screen/feature and what is the user trying to accomplish?
2. Which interactions are decision-relevant (move a user through a funnel, signal intent, or drive retention)?
3. For each trackable event: what 2–4 properties would let a PM slice and answer "why did this happen?"
   • "Who did this?" → user_type (student/counsellor), platform (web/ios/android)
   • "From where in the product?" → screen, placement
   • "What was the context?" → country_name, course_name, title, provider
   • "What did they choose/do?" → option_selected, setting_type, update_type, intent

QUALITY STANDARD:
✓ GOOD — "university_shortlist_cta_clicked" with props: country_name, course_name
✗ BAD  — "cta_clicked" with only is_clicked: true  →  tells you nothing
✗ BAD  — new property name that means the same as an existing one (e.g. "btn_label" when "title" exists)
✗ BAD  — inventing a near-duplicate of an existing event (e.g. "document_item_clicked" when "add_document_clicked" already covers that same tap) — reuse the existing event, do not split one action into two
✗ BAD  — tracking passive scroll/hover events unless they are core to the UX
✗ BAD  — sample_value of "value", "string", or "N/A"  →  use \`dynamic value\` for varying props, a concrete literal only for genuinely fixed ones

PROPERTY ROWS, NOT VALUE ROWS — CRITICAL:
- Output EXACTLY ONE row per property of an event. NEVER create extra rows to enumerate the different possible values a property can take. If \`document_category\` can be "Identity", "Academic Certificates", etc., that is still ONE row, not one row per category.
- sample_value rule: if the value changes from one firing to the next (categories, names, IDs, free text, search terms, user selections), write EXACTLY \`dynamic value\`. Only write a concrete literal when the value is truly fixed for every firing (e.g. a hardcoded platform, or a boolean).

REUSE BEFORE INVENTING — CRITICAL:
- Create a NEW event name ONLY when no existing event name covers the interaction. Otherwise reuse the existing name verbatim (case-sensitive).
- Add a NEW property ONLY when no existing property fits the purpose. Otherwise reuse the existing property verbatim (case-sensitive).
- Inventing is the last resort, never the default. When unsure, pick the closest existing name/property from the lists below rather than coining a new one.

TRACKING SHEET FORMAT — return a JSON array. One object per property row:
{
  "category":             string,
  "suggested_event_name": string,
  "parameter":            string,
  "sample_value":         string
}

If an event has 3 properties, produce 3 rows with the same event name, one per property.
${Object.keys(resolvedNames).length > 0 ? `\nPRE-MATCHED EVENT NAMES — MANDATORY. These have been confirmed against your existing taxonomy. Copy them character-for-character, do not rename:\n${JSON.stringify(resolvedNames, null, 2)}\n` : ''}${existingEventNames}${portalReference}
EXISTING CATEGORIES (prefer these; only add a new one if the screen is genuinely a new feature area):
${JSON.stringify(categories)}

EXISTING PROPERTIES — you MUST reuse these when purpose matches; inventing synonyms bloats the schema:
${JSON.stringify(parameters)}

AMPLITUDE NAMING RULES:
- Properties are OPTIONAL — an Amplitude event may have ZERO properties. NEVER add a generic "from" (or any filler property) just to give the event a parameter. The "from"-as-minimum rule is GA4-only and does NOT apply to Amplitude. Only include "from" when it is a genuinely relevant, real property of the interaction.
- Event names and properties are CASE-SENSITIVE. When reusing an existing name or property from the tracking sheet, copy its EXACT casing verbatim — never change its case. The rule below applies only to brand-new names you invent.
- Lowercase snake_case only — no spaces, no camelCase, no uppercase, no hyphens
- Event name must describe the object AND the action: "profile_step_completed" not just "step_completed"
- Screen views: use "_screen" or "_viewed" suffix (e.g., "welcome_screen", "onboarding_preferences_viewed")
- Never use generic "Page Viewed" or "page_view" — always make it specific to the screen
- Add user_type / platform ONLY when they are genuinely relevant to slicing that event — do NOT force them onto every event

WHAT TO TRACK:
- Every CTA / button tap — name the object and where it lives
- Every screen / page view — include relevant state (e.g., which step in a flow)
- Every form submission — include key field values as properties
- Every search or filter action — what was searched/filtered
- Every item selection — university, course, counsellor — include the item name
- Every navigation action — include destination context

Return ONLY the JSON array. No markdown, no explanation, no code fences. Start with [ and end with ].`;
}

export const AMP_PROMPT = buildAMPPrompt();

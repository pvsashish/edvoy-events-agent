const DEFAULT_CATEGORIES = ["App", "Applications", "Articles", "Career", "City Page", "Compare", "Contact", "Country Page", "Course Page", "Course Shortlist", "Courses", "Documents", "Events", "Exams", "FAQs", "Footer Menu", "Genie Chatbot", "Genie or Check-Eligibility", "Get Started", "Header Menu", "Home", "Homepage", "IELTS Page", "Institution Page", "Login", "Login or Sign-up Flow", "Logout", "Meet", "Office Location Pages", "One Tap Signup", "Profile", "Refer and Earn", "Referral", "Results", "Search", "Search Filter", "Shortlist", "Subject Page", "Testimonials", "Universities"];

const DEFAULT_PARAMETERS = ["about_edvoy", "amount", "app_store", "article_name", "back", "before_or_after_signup", "book_appoinment", "bottom_cta", "budget_per_week", "cancel_application", "cancellation_reason", "card_interacted_with", "card_status", "card_type", "card_value", "choose_students_or_partners", "city_name", "city_of_residence", "clicked_from", "closure_date", "contact_us", "content_title", "continue_with_google_from", "country_name", "course_cta_name", "course_duration", "course_name", "currency", "currency_change", "destination", "discussion_reason", "document_status", "document_category", "document_name", "document_sub_category", "duration", "email", "email_or_continue_with_google", "email_signup_from", "english_test_details", "event_name", "events_form_submission", "events_list_card", "exam_cta", "exams_form_submission", "explore_stories_cta_clicked", "express", "fees_range_selected", "from", "genie", "google_play_store", "gs_mobile_number", "header_log_in_btn", "icon_value", "intake_details", "intake_month", "intake_month_selected", "intake_year", "intake_year_selected", "intent", "is_clicked", "is_email", "is_limited_seats", "is_otp_verified", "is_shortlisted", "is_show_all", "is_viewed", "loan_amount", "menu_name", "mobile_otp_verified_from", "mode_of_study", "move_in_month", "move_in_year", "name", "nationality", "number", "option_selected", "options_name", "placement", "preference_details", "preferred_study_level", "product", "qualification_date_of_completion", "qualification_details", "qualification_study_level", "reason", "receive_marketing_messages", "referral_code", "referred_student_name", "resent_otp_from", "search_term", "session_date_and_time", "share_item", "shortlist_from", "show_all", "show_all_courses_in_expand", "show_all_courses_in_mobile_sticky", "show_or_hide", "sign_up_cta_mobile_top_navbar", "standardised_test_details", "start_date_month", "start_date_year", "status", "step", "subject_name", "subject_names", "subjects", "subscribed_to_newsletter", "suggested_value", "tab_clicked", "tab_name", "terms_and_conditions_accepted", "title", "title_of_the_event", "top_courses", "topics_selected", "true_or_false", "university", "university_name", "url", "value", "values", "vc_scheduled_day", "vc_scheduled_month", "vc_scheduled_time", "vc_scheduled_year", "via"];

export function buildGA4Prompt(sheetData = null, appData = null) {
  const categories = sheetData?.categories?.length > 0
    ? sheetData.categories
    : DEFAULT_CATEGORIES;

  const parameters = sheetData?.parameters?.length > 0
    ? [...new Set([...sheetData.parameters, ...DEFAULT_PARAMETERS])]
    : DEFAULT_PARAMETERS;

  const existingEventNames = sheetData?.eventNames?.length > 0
    ? `\nEXISTING EVENT NAMES (already tracked — do NOT duplicate these, only generate new ones for new interactions):\n${JSON.stringify(sheetData.eventNames)}\n`
    : '';

  // App (Amplitude) may already track something Portal doesn't yet. When a Portal
  // screenshot mirrors an existing App flow, reuse the same naming so both stay consistent.
  const appReference = (appData?.eventNames?.length > 0 || appData?.parameters?.length > 0)
    ? `\nAPP (AMPLITUDE) REFERENCE — MANDATORY MATCHING STEP. For EVERY event you are about to write, before finalizing its name, you MUST scan the App event list below for a semantic match (same user action, even if the Portal UI looks different). This is a literal copy-paste requirement, not inspiration:
- If an App event already covers this interaction, COPY ITS EXACT STRING character-for-character into suggested_event_name. Do not reword it, do not "clean it up", do not make your own version that "feels" similar.
- Apply the same rule to parameter names against the App parameter list below.
- Only write a brand-new name when there is truly no App equivalent (e.g. Web-only features: browser-based search filters, footer/header nav, desktop-only UI).

EXAMPLE — do NOT do this:
✗ App already has "document_fill_in_your_details_save" → you write "document_details_filled" (WRONG — that's a paraphrase, not a reuse)
✓ App already has "document_fill_in_your_details_save" → you write "document_fill_in_your_details_save" (CORRECT — exact copy)

App event names:
${JSON.stringify(appData.eventNames || [])}
App parameter names:
${JSON.stringify(appData.parameters || [])}
`
    : '';

  return `You are a senior analytics engineer at Edvoy — a global student recruitment platform. You design production-ready GA4 event tracking specs from UI screenshots.

Your goal is not to list every element on screen. It is to design an analytics schema that helps PMs and data analysts answer real questions about user behavior, conversion funnels, and feature adoption.

REASONING APPROACH — before writing events, think through:
1. What is this screen/feature and what is the user trying to accomplish?
2. Which interactions are decision-relevant (move a user through a funnel, signal intent, or drive retention)?
3. For each trackable event: what 2–4 parameters would let a PM slice and answer "why did this happen?"
   • "Who did this?" → user_type (student/counsellor), platform (web/ios/android)
   • "From where in the product?" → from, placement, tab_name, clicked_from
   • "What was the context?" → university_name, course_name, country_name, search_term
   • "What did they choose/do?" → option_selected, status, intent, step

QUALITY STANDARD:
✓ GOOD — "offer_card_apply_cta_clicked" with params: university_name, course_name, from, user_type
✗ BAD  — "button_clicked" with only is_clicked: true  →  tells you nothing
✗ BAD  — new parameter name that means the same as an existing one (e.g. "btn_name" when "options_name" exists)
✗ BAD  — tracking passive scroll/hover events unless they are core to the UX (e.g. scroll-to-load)
✗ BAD  — sample_value of "value", "string", or "N/A"  →  use a realistic concrete example

TRACKING SHEET FORMAT — return a JSON array. One object per parameter row:
{
  "category":             string,
  "suggested_event_name": string,
  "parameter":            string,
  "sample_value":         string
}

If an event has 3 parameters, produce 3 rows with the same event name, one per parameter.
${existingEventNames}${appReference}
EXISTING CATEGORIES (prefer these; only add a new one if the screen is genuinely a new feature area):
${JSON.stringify(categories)}

EXISTING PARAMETERS — you MUST reuse these when purpose matches; inventing synonyms bloats the schema:
${JSON.stringify(parameters)}

GA4 NAMING RULES:
- Lowercase snake_case only — no spaces, no camelCase, no uppercase, no hyphens
- Event name must describe the object AND the action: "course_shortlist_cta_clicked" not just "cta_clicked"
- Screen views: use "_viewed" suffix (e.g., "application_status_screen_viewed", "university_profile_viewed")
- Never use a generic "page_view" — always make it specific to the screen
- Avoid reserved prefixes: firebase_*, ga_*
- Always include per event: user_type (student/counsellor), platform (web/ios/android)

WHAT TO TRACK:
- Every CTA / button tap — name the object and where it lives
- Every screen / page view — include relevant state (e.g., which step in a flow)
- Every form submission — include key field values as parameters
- Every search or filter action — what was searched/filtered
- Every item selection — university, course, counsellor — include the item name
- Every navigation action — include destination context

Return ONLY the JSON array. No markdown, no explanation, no code fences. Start with [ and end with ].`;
}

export const GA4_PROMPT = buildGA4Prompt();

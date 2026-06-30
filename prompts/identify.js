export function buildIdentifyPrompt(featureContext = '') {
  const context = featureContext ? `Feature context provided by PM: ${featureContext}\n\n` : '';

  return `${context}You are analyzing a UI screenshot to identify every distinct user interaction worth tracking analytically.

Your only job: list what a user can DO on this screen. One interaction per distinct CONTROL TYPE.

Focus on ACTIVE interactions only:
- Button / CTA clicks
- Form submissions
- Search and filter actions
- Item selections (cards, dropdowns, tabs, checkboxes)
- Navigation actions

CRITICAL — collapse repetition, do not over-decompose:
- A repeated control across many list items is ONE interaction, NOT one per item. If every document/card row has an "Add (+)" button, list it ONCE as "User clicks the add button on a document" — do NOT emit a separate entry for Passport, Graduation Certificate, Semester Marksheets, etc. The specific item is a PARAMETER value, not a new interaction.
- A single list item with one primary action is ONE interaction. Do NOT split a card with one "+" button into both an "item click" and an "add click" — there is only the one tap. Only emit two interactions if the card genuinely has two separate tappable targets.
- Never invent an interaction the screenshot does not clearly show.

Do NOT include:
- Screen / page / tab VIEWS — never emit a "screen is viewed" or "page view" interaction. Only list things the user actively does.
- Passive scrolling or hovering
- System events (page loads, API calls)
- Duplicate variations of the same action (same control, different item/value)

Return ONLY a JSON array of plain English strings. No markdown, no explanation.
Example: ["User clicks the add button on a document", "User clicks the Jump To button"]`;
}

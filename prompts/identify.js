export function buildIdentifyPrompt(featureContext = '') {
  const context = featureContext ? `Feature context provided by PM: ${featureContext}\n\n` : '';

  return `${context}You are analyzing a UI screenshot to identify every distinct user interaction worth tracking analytically.

Your only job: list what a user can DO on this screen. One interaction per item.

Focus on:
- Button / CTA clicks
- Form submissions
- Search and filter actions
- Item selections (cards, dropdowns, tabs, checkboxes)
- Screen / page views (one per distinct state)
- Navigation actions

Do NOT include:
- Passive scrolling or hovering
- System events (page loads, API calls)
- Duplicate variations of the same action

Return ONLY a JSON array of plain English strings. No markdown, no explanation.
Example: ["User clicks the Apply Now button", "User types in the search box", "User selects a country from the dropdown filter", "University listing page is viewed"]`;
}

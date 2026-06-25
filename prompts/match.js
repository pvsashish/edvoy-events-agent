export function buildMatchPrompt(interactions, referenceNames) {
  return `You are matching UI interactions to existing analytics event names.

For each interaction below, decide if an existing event name already covers that exact user action.

Rules:
- Only match when you are confident it is THE SAME user action (not just similar wording)
- Return the EXACT string from the reference list — copy character-for-character, no paraphrasing
- Return null when no confident match exists
- Every interaction must appear as a key in your response

INTERACTIONS TO MATCH:
${JSON.stringify(interactions)}

EXISTING EVENT NAMES (source of truth):
${JSON.stringify(referenceNames)}

Return ONLY a JSON object. No markdown, no explanation.
Example: { "User clicks Apply Now button": "apply_now_clicked", "User views search results": null }`;
}

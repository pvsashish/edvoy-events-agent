export function buildMatchPrompt(interactions, referenceNames, featureContext = '') {
  const context = featureContext
    ? `Feature context provided by PM: "${featureContext}"\nUse this ONLY to break ties when several existing events look equally plausible — prefer the one that fits this flow. It does NOT relax the null rule: if no existing event involves the same object, still return null.\n\n`
    : '';
  return `${context}You are matching UI interactions to existing analytics event names.

For each interaction below, decide if an existing event name already tracks that same user action on the same UI object. The reference list is the source of truth — strongly prefer reusing an existing name over leaving it unmatched.

Rules:
- Match on the OBJECT + INTENT, not on exact wording. The verb and suffix are interchangeable synonyms:
    • activating a control: "clicked" ≈ "tapped" ≈ "selected" ≈ "pressed"
  Do NOT treat a screen/page VIEW as the same action as a tab/button CLICK — "..._tab_clicked" is a click on a tab, never a screen view.
  If an existing event names the SAME screen/object as the interaction, reuse it even when the verb differs.
- Pick the closest single existing event when several look plausible (prefer one whose name contains the screen/object word from the interaction).
- Return the EXACT string from the reference list — copy character-for-character, no paraphrasing.
- Return null ONLY when no existing event involves the same object at all — do not invent.
- Every interaction must appear as a key in your response.

INTERACTIONS TO MATCH:
${JSON.stringify(interactions)}

EXISTING EVENT NAMES (source of truth):
${JSON.stringify(referenceNames)}

Return ONLY a JSON object. No markdown, no explanation.
Example: { "User clicks Apply Now button": "apply_now_clicked", "User views search results": null }`;
}

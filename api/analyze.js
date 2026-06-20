import Groq from 'groq-sdk';
import { buildGA4Prompt } from '../prompts/ga4.js';
import { buildAMPPrompt } from '../prompts/amplitude.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { images, platform, featureContext, sheetData, crossData } = req.body;

  if (!images || !images.length) {
    return res.status(400).json({ error: 'No images provided' });
  }

  if (!['ga4', 'amplitude'].includes(platform)) {
    return res.status(400).json({ error: 'platform must be ga4 or amplitude' });
  }

  // Build prompt with live sheet data if available (dynamic parameter/category lists)
  const systemPrompt = platform === 'ga4'
    ? buildGA4Prompt(sheetData || null, crossData || null)
    : buildAMPPrompt(sheetData || null, crossData || null);

  const contextText = featureContext
    ? `Feature context: ${featureContext}\n\n`
    : '';

  const userContent = [
    {
      type: 'text',
      text: `${contextText}Carefully analyze the screenshot(s). Think through the user journey on this screen and what interactions are worth tracking analytically. Then output the JSON array of event specs.`,
    },
    ...images.map((img) => ({
      type: 'image_url',
      image_url: { url: img },
    })),
  ];

  try {
    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.2,
      max_tokens: 4096,
    });

    const raw = completion.choices[0]?.message?.content || '[]';

    let events;
    try {
      events = JSON.parse(raw);
    } catch {
      try {
        const match = raw.match(/\[[\s\S]*\]/);
        events = match ? JSON.parse(match[0]) : [];
      } catch (parseErr) {
        console.error('JSON extraction failed:', parseErr, 'Raw:', raw);
        return res.status(400).json({ error: 'Failed to parse event specifications from the AI response. Please try again.' });
      }
    }

    if (Array.isArray(events)) {
      events = events.map(e => {
        if (e && typeof e === 'object') {
          delete e.old_event_name;

          const param = (e.parameter || '').trim().toLowerCase();
          let val = (e.sample_value || '').trim();

          if (param === 'is_clicked') {
            val = (val.toLowerCase() === 'false') ? 'false' : 'true';
          } else if (param.endsWith('_id')) {
            val = 'dynamic value';
          } else if (val.length > 60) {
            // AI sometimes pastes full article/paragraph text — keep sample values short
            val = val.slice(0, 55).trimEnd() + '…';
          }

          return {
            ...e,
            parameter: param,
            sample_value: val,
          };
        }
        return e;
      });

      // Cross-platform consistency pass: the first call tends to paraphrase
      // ("document_details_filled") instead of reusing an existing name
      // ("document_fill_in_your_details_save") even when told to copy verbatim —
      // a single-shot scan against 600+ names asks too much of a 17B model.
      // A second, narrowly-scoped matching call performs much better at this.
      if (crossData && crossData.eventNames?.length > 0) {
        try {
          const eventNameMap = await matchCrossPlatformNames(events, crossData);
          events = events.map(e => ({
            ...e,
            suggested_event_name: eventNameMap[e.suggested_event_name] || e.suggested_event_name,
          }));
        } catch (matchErr) {
          console.error('Cross-platform matching pass failed, keeping original names:', matchErr);
        }
      }
    }

    return res.status(200).json({ events });
  } catch (err) {
    console.error('Groq error:', err);
    return res.status(500).json({ error: err.message || 'AI analysis failed' });
  }
}

// Narrow, text-only matching pass: given a short list of newly drafted event
// names, decide for each one whether it's the exact same user action as an
// existing event on the other platform. Returns exact-string replacements only —
// no rewriting, no new names, just a name -> name map applied in code.
// Parameter names are intentionally NOT cross-matched here — parameter equivalence
// depends heavily on the surrounding event context, and a name-only comparison
// (e.g. "upload_method" vs "document_category") produces false-positive matches
// that would corrupt the schema rather than clean it up.
async function matchCrossPlatformNames(events, crossData) {
  const draftEventNames = [...new Set(events.map(e => e.suggested_event_name).filter(Boolean))];
  if (draftEventNames.length === 0) return {};

  const matchPrompt = `You are auditing draft analytics event names against an existing reference taxonomy from the same product's other platform (Portal/web vs App/mobile — same company, same user actions, different surface).

Your only job: for each DRAFT name below, decide if it represents the EXACT SAME user action as one of the REFERENCE names. If yes, return that reference name's exact string. If no confident match exists, return the draft name unchanged. Be strict — only map when you're confident it's the same action, not just similar wording.

DRAFT EVENT NAMES:
${JSON.stringify(draftEventNames)}

REFERENCE EVENT NAMES (existing, source of truth — copy these exactly when matched):
${JSON.stringify(crossData.eventNames || [])}

Return ONLY this JSON object, no markdown, no explanation:
{ "draft_name": "matched_reference_name_or_same_draft_name_if_no_match" }
Every draft name must appear as a key, even if unchanged.`;

  const completion = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [{ role: 'user', content: matchPrompt }],
    temperature: 0.2,
    max_tokens: 2048,
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    try { return match ? JSON.parse(match[0]) : {}; } catch { return {}; }
  }
}

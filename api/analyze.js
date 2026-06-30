import { buildGA4Prompt } from '../prompts/ga4.js';
import { buildAMPPrompt } from '../prompts/amplitude.js';
import { buildIdentifyPrompt } from '../prompts/identify.js';
import { buildMatchPrompt } from '../prompts/match.js';

const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { images, platform, featureContext, sheetData, crossData, sessionEvents } = req.body;

  if (!images || !images.length) {
    return res.status(400).json({ error: 'No images provided' });
  }
  if (!['ga4', 'amplitude'].includes(platform)) {
    return res.status(400).json({ error: 'platform must be ga4 or amplitude' });
  }

  try {
    // Step 1: Identify — what interactions exist on this screen?
    const interactions = await identifyInteractions(images, featureContext);

    // Step 2: Match — do any of those interactions already have event names?
    const resolvedNames = await matchInteractions(interactions, sheetData, crossData, sessionEvents);

    // Step 3: Generate — produce the full spec with pre-matched names + params as hard constraints
    let events = await generateSpec(images, platform, featureContext, interactions, resolvedNames, sheetData, crossData);

    if (Array.isArray(events)) {
      events = events.map(e => {
        if (e && typeof e === 'object') {
          delete e.old_event_name;

          // Preserve the parameter's original casing in the output; only lowercase a copy
          // for the rule checks below (event/param names are case-sensitive — see SESSION).
          const rawParam = (e.parameter || '').trim();
          const param = rawParam.toLowerCase();
          let val = (e.sample_value || '').trim();

          // Dimension params vary per firing → always 'dynamic value', never a literal.
          const isDynamicParam = /(_id|_name|_category|_sub_category|_term|_code)$/.test(param)
            || ['from', 'name', 'title', 'option_selected', 'options_name', 'search_term', 'university'].includes(param);

          if (param === 'is_clicked' || param.startsWith('is_') || param.startsWith('has_')) {
            val = (val.toLowerCase() === 'false') ? 'false' : 'true';
          } else if (isDynamicParam) {
            val = 'dynamic value';
          } else if (val.length > 60) {
            val = val.slice(0, 55).trimEnd() + '…';
          }

          return { ...e, parameter: rawParam, sample_value: val };
        }
        return e;
      });

      // Kill row-explosion: one row per (event_name + parameter). Weak models sometimes
      // emit a row per possible value of the same param — those collapse to identical
      // rows after normalisation, so we drop the duplicates here. (Case-insensitive key.)
      const seen = new Set();
      events = events.filter(e => {
        if (!e || typeof e !== 'object') return true;
        const key = `${(e.suggested_event_name || '').trim().toLowerCase()}|${(e.parameter || '').trim().toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    return res.status(200).json({ events });
  } catch (err) {
    console.error('Analysis error:', err);
    return res.status(500).json({ error: err.message || 'AI analysis failed' });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Groq OpenAI-compatible chat completion (vision + text). Single model for the whole pipeline.
async function groqGenerate({ system, user, images = [] }) {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not set');

  const userContent = images.length
    ? [...images.map(img => ({ type: 'image_url', image_url: { url: img } })), { type: 'text', text: user }]
    : user;

  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: userContent });

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    // temperature 0 → deterministic: same screenshot returns the same spec every run.
    body: JSON.stringify({ model: GROQ_MODEL, messages, temperature: 0 }),
  });

  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

// Retry transient Groq failures (rate limit / overloaded).
async function groqWithRetry(args, retries = 2, delayMs = 3000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await groqGenerate(args);
    } catch (err) {
      const msg = err.message || '';
      const transient = /\b(429|500|502|503)\b/.test(msg) || /rate.?limit|overloaded|Too Many Requests/i.test(msg);
      if (transient && attempt < retries) {
        await new Promise(r => setTimeout(r, delayMs));
        delayMs *= 2;
      } else {
        throw err;
      }
    }
  }
}

function parseJson(raw, fallback) {
  try { return JSON.parse(raw); } catch {}
  const arrMatch = raw.match(/\[[\s\S]*\]/);
  if (arrMatch) { try { return JSON.parse(arrMatch[0]); } catch {} }
  const objMatch = raw.match(/\{[\s\S]*\}/);
  if (objMatch) { try { return JSON.parse(objMatch[0]); } catch {} }
  return fallback;
}

// ─── Step 1: Identify interactions ───────────────────────────────────────────

async function identifyInteractions(images, featureContext) {
  const prompt = buildIdentifyPrompt(featureContext);
  try {
    const raw = await groqWithRetry({ user: prompt, images });
    const parsed = parseJson(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Identify step failed, skipping:', err.message);
    return [];
  }
}

// ─── Step 2: Match interactions to existing event names ──────────────────────

async function matchInteractions(interactions, sheetData, crossData, sessionEvents) {
  if (!interactions.length) return {};

  const referenceNames = [
    ...(sheetData?.eventNames || []),
    ...(crossData?.eventNames || []),
    ...(sessionEvents?.eventNames || []),
  ].filter(Boolean);

  const unique = [...new Set(referenceNames)];
  if (unique.length === 0) return {};

  const prompt = buildMatchPrompt(interactions, unique);

  try {
    const raw = await groqWithRetry({ user: prompt });
    const parsed = parseJson(raw, {});
    if (typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, v]) => v && typeof v === 'string'));
  } catch (err) {
    console.error('Match step failed, skipping:', err.message);
    return {};
  }
}

// ─── Step 3: Generate spec ────────────────────────────────────────────────────

async function generateSpec(images, platform, featureContext, interactions, resolvedNames, sheetData, crossData) {
  const systemPrompt = platform === 'ga4'
    ? buildGA4Prompt(sheetData || null, crossData || null, resolvedNames)
    : buildAMPPrompt(sheetData || null, crossData || null, resolvedNames);

  const contextText = featureContext ? `Feature context: ${featureContext}\n\n` : '';
  const interactionContext = interactions.length > 0
    ? `Identified interactions on this screen:\n${interactions.map((x, i) => `${i + 1}. ${x}`).join('\n')}\n\n`
    : '';

  // For events that already exist in the tracking sheet, inject their EXACT parameter
  // names so the model reuses them verbatim (e.g. jump_to_clicked → options_name) instead
  // of guessing a synonym like "from". Sheet (primary) overrides cross-platform reference.
  const eventParamMap = { ...(crossData?.eventParams || {}), ...(sheetData?.eventParams || {}) };
  const matchedEvents = [...new Set(Object.values(resolvedNames))];
  const paramHintLines = matchedEvents
    .map(ev => {
      const ps = eventParamMap[ev];
      return (ps && ps.length) ? `- ${ev}: ${ps.join(', ')}` : null;
    })
    .filter(Boolean);
  const paramHint = paramHintLines.length
    ? `KNOWN PARAMETERS FOR MATCHED EVENTS — MANDATORY. These events already exist in the tracking sheet with these EXACT parameters. Use exactly these parameter names, copied verbatim and case-sensitive. Do NOT substitute a synonym (e.g. do NOT write "from" where the sheet uses "options_name"):\n${paramHintLines.join('\n')}\n\n`
    : '';

  const userText = `${contextText}${interactionContext}${paramHint}Generate the complete event tracking spec for this screen.`;

  const raw = await groqWithRetry({ system: systemPrompt, user: userText, images });
  const parsed = parseJson(raw, null);
  if (!parsed) throw new Error('Failed to parse event specifications from the AI response. Please try again.');
  return parsed;
}

import { buildGA4Prompt } from '../prompts/ga4.js';
import { buildAMPPrompt } from '../prompts/amplitude.js';
import { buildIdentifyPrompt } from '../prompts/identify.js';
import { buildMatchPrompt } from '../prompts/match.js';

const ANTHROPIC_MODEL = 'claude-sonnet-4-6';

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

  // Accumulates token usage across all 3 Anthropic calls so we can report cost.
  const usageLog = [];

  try {
    // Step 1: Identify — what interactions exist on this screen?
    const interactions = await identifyInteractions(images, featureContext, usageLog);

    // Step 2: Match — do any of those interactions already have event names?
    const resolvedNames = await matchInteractions(interactions, sheetData, crossData, sessionEvents, usageLog);

    // Step 3: Generate — produce the full spec with pre-matched names + params as hard constraints
    let events = await generateSpec(images, platform, featureContext, interactions, resolvedNames, sheetData, crossData, usageLog);

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

      // Amplitude has no "from"-as-minimum rule (GA4-only). Drop any "from" the model
      // still emits for Amplitude — it's filler here, not a real property.
      if (platform === 'amplitude') {
        events = events.filter(e =>
          !(e && typeof e === 'object' && (e.parameter || '').trim().toLowerCase() === 'from')
        );
      }

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

    // Sum tokens across all calls and compute cost. Sonnet 4.6: $3/M input, $15/M output.
    // cache_read is ~0.1x input; cache_creation ~1.25x. No caching yet, so they're 0.
    const totals = usageLog.reduce((acc, u) => {
      acc.input += (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
      acc.output += u.output_tokens || 0;
      return acc;
    }, { input: 0, output: 0 });
    const cost = (totals.input / 1e6) * 3 + (totals.output / 1e6) * 15;
    const usage = {
      input_tokens: totals.input,
      output_tokens: totals.output,
      cost_usd: Math.round(cost * 10000) / 10000, // round to 4dp ($0.0001 precision)
      calls: usageLog.length,
    };

    return res.status(200).json({ events, usage });
  } catch (err) {
    console.error('Analysis error:', err);
    return res.status(500).json({ error: err.message || 'AI analysis failed' });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// data:<mime>;base64,<data> → Anthropic image content block
function dataUrlToImageBlock(dataUrl) {
  const match = /^data:(.+?);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const [, mediaType, data] = match;
  return { type: 'image', source: { type: 'base64', media_type: mediaType, data } };
}

// Anthropic Messages API (vision + text). Single model for the whole pipeline.
async function anthropicGenerate({ system, user, images = [] }) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');

  const userContent = images.length
    ? [...images.map(dataUrlToImageBlock).filter(Boolean), { type: 'text', text: user }]
    : user;

  const body = {
    model: ANTHROPIC_MODEL,
    max_tokens: 8192,
    temperature: 0,
    messages: [{ role: 'user', content: userContent }],
  };
  if (system) body.system = system;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const textBlock = data.content.find(b => b.type === 'text');
  return { text: textBlock ? textBlock.text : '', usage: data.usage || null };
}

// Retry transient Anthropic failures (rate limit / overloaded).
async function anthropicWithRetry(args, retries = 2, delayMs = 3000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await anthropicGenerate(args);
    } catch (err) {
      const msg = err.message || '';
      const transient = /\b(429|500|502|503|529)\b/.test(msg) || /rate.?limit|overloaded|Too Many Requests/i.test(msg);
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

async function identifyInteractions(images, featureContext, usageLog) {
  const prompt = buildIdentifyPrompt(featureContext);
  try {
    const { text: raw, usage } = await anthropicWithRetry({ user: prompt, images });
    if (usage) usageLog.push(usage);
    const parsed = parseJson(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Identify step failed, skipping:', err.message);
    return [];
  }
}

// ─── Step 2: Match interactions to existing event names ──────────────────────

async function matchInteractions(interactions, sheetData, crossData, sessionEvents, usageLog) {
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
    const { text: raw, usage } = await anthropicWithRetry({ user: prompt });
    if (usage) usageLog.push(usage);
    const parsed = parseJson(raw, {});
    if (typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, v]) => v && typeof v === 'string'));
  } catch (err) {
    console.error('Match step failed, skipping:', err.message);
    return {};
  }
}

// ─── Step 3: Generate spec ────────────────────────────────────────────────────

async function generateSpec(images, platform, featureContext, interactions, resolvedNames, sheetData, crossData, usageLog) {
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

  const { text: raw, usage } = await anthropicWithRetry({ system: systemPrompt, user: userText, images });
  if (usage) usageLog.push(usage);
  const parsed = parseJson(raw, null);
  if (!parsed) throw new Error('Failed to parse event specifications from the AI response. Please try again.');
  return parsed;
}

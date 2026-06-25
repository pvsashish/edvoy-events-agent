import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildGA4Prompt } from '../prompts/ga4.js';
import { buildAMPPrompt } from '../prompts/amplitude.js';
import { buildIdentifyPrompt } from '../prompts/identify.js';
import { buildMatchPrompt } from '../prompts/match.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = 'gemini-2.5-flash';
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

    // Step 3: Generate — produce the full spec with pre-matched names as hard constraints
    let events = await generateSpec(images, platform, featureContext, interactions, resolvedNames, sheetData, crossData);

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
            val = val.slice(0, 55).trimEnd() + '…';
          }

          return { ...e, parameter: param, sample_value: val };
        }
        return e;
      });
    }

    return res.status(200).json({ events });
  } catch (err) {
    console.error('Analysis error:', err);
    return res.status(500).json({ error: err.message || 'AI analysis failed' });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function is429(err) {
  const msg = err.message || '';
  return msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests') || msg.includes('RESOURCE_EXHAUSTED');
}

async function withRetry(fn, retries = 2, delayMs = 3000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const is503 = err.message?.includes('503') || err.message?.includes('Service Unavailable') || err.message?.includes('overloaded');
      if (is503 && attempt < retries) {
        console.warn(`Gemini 503, retrying in ${delayMs}ms (attempt ${attempt + 1}/${retries})...`);
        await new Promise(r => setTimeout(r, delayMs));
        delayMs *= 2;
      } else {
        throw err;
      }
    }
  }
}

// Groq OpenAI-compatible fallback (vision + text)
async function groqGenerate({ system, user, images = [] }) {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not set — cannot fall back');

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
    body: JSON.stringify({ model: GROQ_MODEL, messages, temperature: 0.2 }),
  });

  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

function parseDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Invalid image data URL');
  return { mimeType: match[1], data: match[2] };
}

function imageParts(images) {
  return images.map(img => {
    const { mimeType, data } = parseDataUrl(img);
    return { inlineData: { mimeType, data } };
  });
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
    const raw = await withRetry(async () => {
      const model = genAI.getGenerativeModel({ model: MODEL });
      const result = await model.generateContent([prompt, ...imageParts(images)]);
      return result.response.text();
    });
    const parsed = parseJson(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (is429(err)) {
      console.warn('Gemini quota hit on Step 1 — falling back to Groq');
      try {
        const raw = await groqGenerate({ user: prompt, images });
        const parsed = parseJson(raw, []);
        return Array.isArray(parsed) ? parsed : [];
      } catch (groqErr) {
        console.error('Groq Step 1 also failed:', groqErr.message);
      }
    } else {
      console.error('Identify step failed, skipping:', err.message);
    }
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

  const toResult = (raw) => {
    const parsed = parseJson(raw, {});
    if (typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, v]) => v && typeof v === 'string'));
  };

  try {
    const raw = await withRetry(async () => {
      const model = genAI.getGenerativeModel({ model: MODEL });
      const result = await model.generateContent(prompt);
      return result.response.text();
    });
    return toResult(raw);
  } catch (err) {
    if (is429(err)) {
      console.warn('Gemini quota hit on Step 2 — falling back to Groq');
      try {
        const raw = await groqGenerate({ user: prompt });
        return toResult(raw);
      } catch (groqErr) {
        console.error('Groq Step 2 also failed:', groqErr.message);
      }
    } else {
      console.error('Match step failed, skipping:', err.message);
    }
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

  const userText = `${contextText}${interactionContext}Generate the complete event tracking spec for this screen.`;

  try {
    const model = genAI.getGenerativeModel({ model: MODEL, systemInstruction: systemPrompt });
    const result = await withRetry(() => model.generateContent([userText, ...imageParts(images)]));
    const raw = result.response.text();
    const parsed = parseJson(raw, null);
    if (!parsed) throw new Error('Failed to parse event specifications from the AI response. Please try again.');
    return parsed;
  } catch (err) {
    if (is429(err)) {
      console.warn('Gemini quota hit on Step 3 — falling back to Groq');
      const raw = await groqGenerate({ system: systemPrompt, user: userText, images });
      const parsed = parseJson(raw, null);
      if (!parsed) throw new Error('Failed to parse event specifications from the AI response. Please try again.');
      return parsed;
    }
    throw err;
  }
}

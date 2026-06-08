import Groq from 'groq-sdk';
import { GA4_PROMPT } from '../prompts/ga4.js';
import { AMP_PROMPT } from '../prompts/amplitude.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { images, platform, featureContext } = req.body;

  if (!images || !images.length) {
    return res.status(400).json({ error: 'No images provided' });
  }

  if (!['ga4', 'amplitude'].includes(platform)) {
    return res.status(400).json({ error: 'platform must be ga4 or amplitude' });
  }

  const systemPrompt = platform === 'ga4' ? GA4_PROMPT : AMP_PROMPT;

  const userContent = [
    {
      type: 'text',
      text: featureContext
        ? `Feature context: ${featureContext}\n\nAnalyze the screenshot(s) and return analytics events.`
        : 'Analyze the screenshot(s) and return analytics events.',
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
      temperature: 0.3,
      max_tokens: 4096,
    });

    const raw = completion.choices[0]?.message?.content || '[]';

    let events;
    try {
      events = JSON.parse(raw);
    } catch {
      try {
        // Try extracting JSON array from response
        const match = raw.match(/\[[\s\S]*\]/);
        events = match ? JSON.parse(match[0]) : [];
      } catch (parseErr) {
        console.error('JSON Extraction failed:', parseErr, 'Raw content:', raw);
        return res.status(400).json({ error: 'Failed to parse event specifications from the AI model response. Please try again.' });
      }
    }

    // Normalize and clean events
    if (Array.isArray(events)) {
      events = events.map(e => {
        // Remove old_event_name if returned
        if (e && typeof e === 'object') {
          delete e.old_event_name;
          
          const param = (e.parameter || '').trim().toLowerCase();
          let val = (e.sample_value || '').trim();
          
          if (param === 'is_clicked') {
            if (val.toLowerCase() !== 'true' && val.toLowerCase() !== 'false') {
              val = 'true';
            } else {
              val = val.toLowerCase();
            }
          } else if (param.endsWith('_id')) {
            val = 'dynamic value';
          }
          
          return {
            ...e,
            parameter: e.parameter ? param : '',
            sample_value: val
          };
        }
        return e;
      });
    }

    return res.status(200).json({ events });
  } catch (err) {
    console.error('Groq error:', err);
    return res.status(500).json({ error: err.message || 'AI analysis failed' });
  }
}

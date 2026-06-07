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
      model: 'llama-3.2-11b-vision-preview',
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
      // Try extracting JSON array from response
      const match = raw.match(/\[[\s\S]*\]/);
      events = match ? JSON.parse(match[0]) : [];
    }

    return res.status(200).json({ events });
  } catch (err) {
    console.error('Groq error:', err);
    return res.status(500).json({ error: err.message || 'AI analysis failed' });
  }
}

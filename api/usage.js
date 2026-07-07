import pool, { initDb } from './db.js';

const ZERO = { input_tokens: 0, output_tokens: 0, cost_usd: 0, generations: 0 };

// pg returns BIGINT as a string — coerce everything to Number for the client.
const normalize = (row) => ({
  input_tokens:  Number(row?.input_tokens)  || 0,
  output_tokens: Number(row?.output_tokens) || 0,
  cost_usd:      Number(row?.cost_usd)      || 0,
  generations:   Number(row?.generations)   || 0,
});

// Cumulative Anthropic API usage counter, persisted server-side so it survives a
// browser cache clear and stays consistent across devices (was localStorage-only).
// Single row (id=1).
export default async function handler(req, res) {
  if (!process.env.DATABASE_URL) {
    return res.status(200).json({ usage: ZERO });
  }

  try {
    await initDb();

    if (req.method === 'GET') {
      const r = await pool.query('SELECT input_tokens, output_tokens, cost_usd, generations FROM edvoy_usage WHERE id = 1');
      return res.status(200).json({ usage: normalize(r.rows[0]) });
    }

    if (req.method === 'POST') {
      const { delta, set, reset } = req.body || {};

      if (reset) {
        const r = await pool.query(
          `UPDATE edvoy_usage SET input_tokens = 0, output_tokens = 0, cost_usd = 0, generations = 0, updated_at = NOW()
           WHERE id = 1 RETURNING input_tokens, output_tokens, cost_usd, generations`
        );
        return res.status(200).json({ usage: normalize(r.rows[0]) });
      }

      if (set) {
        const r = await pool.query(
          `INSERT INTO edvoy_usage (id, input_tokens, output_tokens, cost_usd, generations, updated_at)
           VALUES (1, $1, $2, $3, $4, NOW())
           ON CONFLICT (id) DO UPDATE SET input_tokens = $1, output_tokens = $2, cost_usd = $3, generations = $4, updated_at = NOW()
           RETURNING input_tokens, output_tokens, cost_usd, generations`,
          [set.input_tokens || 0, set.output_tokens || 0, set.cost_usd || 0, set.generations || 0]
        );
        return res.status(200).json({ usage: normalize(r.rows[0]) });
      }

      // Default: atomic increment by delta (avoids read-modify-write races).
      const d = delta || {};
      const r = await pool.query(
        `INSERT INTO edvoy_usage (id, input_tokens, output_tokens, cost_usd, generations, updated_at)
         VALUES (1, $1, $2, $3, $4, NOW())
         ON CONFLICT (id) DO UPDATE SET
           input_tokens  = edvoy_usage.input_tokens  + $1,
           output_tokens = edvoy_usage.output_tokens + $2,
           cost_usd      = edvoy_usage.cost_usd      + $3,
           generations   = edvoy_usage.generations   + $4,
           updated_at    = NOW()
         RETURNING input_tokens, output_tokens, cost_usd, generations`,
        [d.input_tokens || 0, d.output_tokens || 0, d.cost_usd || 0, d.generations || 0]
      );
      return res.status(200).json({ usage: normalize(r.rows[0]) });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Usage API error:', err);
    return res.status(500).json({ error: err.message });
  }
}

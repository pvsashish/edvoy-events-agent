import pool, { initDb } from './db.js';

export default async function handler(req, res) {
  if (!process.env.DATABASE_URL) {
    return res.status(200).json({ settings: {} });
  }

  try {
    await initDb();

    if (req.method === 'GET') {
      const result = await pool.query('SELECT key, value FROM edvoy_settings');
      const settings = {};
      for (const row of result.rows) {
        try { settings[row.key] = JSON.parse(row.value); }
        catch { settings[row.key] = row.value; }
      }
      return res.status(200).json({ settings });
    }

    if (req.method === 'POST') {
      const { key, value } = req.body || {};
      if (!key) return res.status(400).json({ error: 'key required' });
      await pool.query(
        `INSERT INTO edvoy_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, JSON.stringify(value)]
      );
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Settings API error:', err);
    return res.status(500).json({ error: err.message });
  }
}

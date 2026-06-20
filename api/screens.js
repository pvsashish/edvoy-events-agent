import pool, { initDb } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (!process.env.DATABASE_URL) {
    return res.status(200).json({
      screens: [],
      warning: 'DATABASE_URL env variable not set.',
    });
  }

  try {
    await initDb();

    if (req.method === 'GET') {
      const { q, id } = req.query;

      // Single screen with image (for lazy load on select)
      if (id) {
        const dbRes = await pool.query(
          `SELECT id, screen_name AS "screenName", platform, image, events, created_at AS "createdAt"
           FROM edvoy_screens WHERE id = $1`,
          [id]
        );
        if (!dbRes.rows.length) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json({ screen: dbRes.rows[0] });
      }

      // List — no image column (fast)
      if (q) {
        const dbRes = await pool.query(
          `SELECT id, screen_name AS "screenName", platform, events, created_at AS "createdAt"
           FROM edvoy_screens
           WHERE screen_name ILIKE $1
              OR EXISTS (
                SELECT 1 FROM jsonb_array_elements(events) ev
                WHERE ev->>'event_name' ILIKE $1
              )
           ORDER BY created_at DESC`,
          [`%${q}%`]
        );
        return res.status(200).json({ screens: dbRes.rows });
      }

      const dbRes = await pool.query(
        `SELECT id, screen_name AS "screenName", platform, events, created_at AS "createdAt"
         FROM edvoy_screens ORDER BY created_at DESC`
      );
      return res.status(200).json({ screens: dbRes.rows });
    }

    if (req.method === 'POST') {
      const { id, screenName, platform, image, events } = req.body;

      if (!screenName || !platform || !image || !Array.isArray(events)) {
        return res.status(400).json({ error: 'Missing screenName, platform, image, or events' });
      }

      const rowId = id || `screen_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      await pool.query(
        `INSERT INTO edvoy_screens (id, screen_name, platform, image, events)
         VALUES ($1, $2, $3, $4, $5)`,
        [rowId, screenName, platform, image, JSON.stringify(events)]
      );

      return res.status(200).json({ success: true, id: rowId });
    }

    if (req.method === 'DELETE') {
      const { id, clearAll } = req.body || {};

      if (clearAll) {
        await pool.query('DELETE FROM edvoy_screens');
        return res.status(200).json({ success: true });
      }

      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }

      await pool.query('DELETE FROM edvoy_screens WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Screens API error:', err);
    return res.status(500).json({ error: err.message || 'Database operation failed' });
  }
}

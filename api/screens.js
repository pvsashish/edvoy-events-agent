import pool, { initDb } from './db.js';
import { uploadDataUrl, deleteByUrl } from './r2.js';

async function queryWithRetry(text, params, retries = 2, delayMs = 3000) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      const isSSL = err.message?.includes('SSL') || err.message?.includes('ssl');
      if (isSSL && i < retries) {
        await new Promise(r => setTimeout(r, delayMs));
        continue;
      }
      throw err;
    }
  }
}

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

      // Single screen (image_url is a CDN link; legacy `image` kept as fallback)
      if (id) {
        const dbRes = await queryWithRetry(
          `SELECT id, screen_name AS "screenName", platform, image_url AS "imageUrl", events, created_at AS "createdAt"
           FROM edvoy_screens WHERE id = $1`,
          [id]
        );
        if (!dbRes.rows.length) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json({ screen: dbRes.rows[0] });
      }

      // List — includes tiny image_url (CDN), never the heavy base64
      if (q) {
        const dbRes = await queryWithRetry(
          `SELECT id, screen_name AS "screenName", platform, image_url AS "imageUrl", events, created_at AS "createdAt"
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

      const dbRes = await queryWithRetry(
        `SELECT id, screen_name AS "screenName", platform, image_url AS "imageUrl", events, created_at AS "createdAt"
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

      // Upload the image to R2 (CDN) and store only its URL — keeps Postgres tiny.
      // `image` column stays empty; image_url is the source of truth.
      const imageUrl = await uploadDataUrl(image, `scout/${rowId}`);

      await queryWithRetry(
        `INSERT INTO edvoy_screens (id, screen_name, platform, image_url, events)
         VALUES ($1, $2, $3, $4, $5)`,
        [rowId, screenName, platform, imageUrl, JSON.stringify(events)]
      );

      return res.status(200).json({ success: true, id: rowId, imageUrl });
    }

    if (req.method === 'DELETE') {
      const { id, clearAll } = req.body || {};

      if (clearAll) {
        await queryWithRetry('DELETE FROM edvoy_screens');
        return res.status(200).json({ success: true });
      }

      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }

      // Grab the CDN url first so we can clean up the R2 object after the row is gone.
      const existing = await queryWithRetry('SELECT image_url FROM edvoy_screens WHERE id = $1', [id]);
      await queryWithRetry('DELETE FROM edvoy_screens WHERE id = $1', [id]);
      if (existing.rows[0]?.image_url) await deleteByUrl(existing.rows[0].image_url);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Screens API error:', err);
    return res.status(500).json({ error: err.message || 'Database operation failed' });
  }
}

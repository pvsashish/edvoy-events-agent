import pool, { initDb } from './db.js';
import { uploadDataUrl, deleteByUrl } from './r2.js';

const SELECT_COLS = `id, name, timestamp, platform, events_count AS "eventsCount", events, feature_context AS "featureContext", space, thumbnail_url AS "thumbnailUrl"`;

async function fetchHistory() {
  const dbRes = await pool.query(`SELECT ${SELECT_COLS} FROM edvoy_specs_history ORDER BY created_at DESC`);
  return dbRes.rows.map(row => ({
    ...row,
    events: row.events ? JSON.parse(row.events) : []
  }));
}

export default async function handler(req, res) {
  if (!process.env.DATABASE_URL) {
    return res.status(200).json({
      history: [],
      warning: 'DATABASE_URL env variable not set. Falling back to local storage.'
    });
  }

  try {
    // Await database table verification to prevent first-request race conditions
    await initDb();
    if (req.method === 'GET') {
      const history = await fetchHistory();
      return res.status(200).json({ history });
    }

    if (req.method === 'POST') {
      const { item, thumbnail } = req.body;
      if (!item) {
        return res.status(400).json({ error: 'Missing item' });
      }

      const { id, name, timestamp, platform, eventsCount, events, featureContext, space } = item;

      // Thumbnail is optional — upload to R2 under its own prefix, store only the URL.
      let thumbnailUrl = null;
      if (thumbnail) {
        try {
          thumbnailUrl = await uploadDataUrl(thumbnail, `history/${id}`);
        } catch (e) {
          console.error('History thumbnail upload failed (continuing without it):', e.message);
        }
      }

      await pool.query(
        `INSERT INTO edvoy_specs_history (id, name, timestamp, platform, events_count, events, feature_context, space, thumbnail_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, name, timestamp, platform, eventsCount, JSON.stringify(events), featureContext, space || 'edvoy-student', thumbnailUrl]
      );

      const history = await fetchHistory();
      return res.status(200).json({ success: true, history });
    }

    if (req.method === 'PATCH') {
      // One-time migration path: attach a thumbnail (found in a browser's localStorage
      // cache) to a record that predates R2-backed thumbnails. Only fills in a missing
      // one — never overwrites a thumbnail that's already there.
      const { id, thumbnail } = req.body || {};
      if (!id || !thumbnail) {
        return res.status(400).json({ error: 'Missing id or thumbnail' });
      }

      const existing = await pool.query('SELECT thumbnail_url FROM edvoy_specs_history WHERE id = $1', [id]);
      if (!existing.rows.length) {
        return res.status(404).json({ error: 'History item not found' });
      }
      if (existing.rows[0].thumbnail_url) {
        return res.status(200).json({ success: true, thumbnailUrl: existing.rows[0].thumbnail_url, skipped: true });
      }

      const thumbnailUrl = await uploadDataUrl(thumbnail, `history/${id}`);
      await pool.query('UPDATE edvoy_specs_history SET thumbnail_url = $1 WHERE id = $2', [thumbnailUrl, id]);
      return res.status(200).json({ success: true, thumbnailUrl });
    }

    if (req.method === 'DELETE') {
      const { id, clearAll, space } = req.body || {};

      if (clearAll) {
        const toClean = space
          ? await pool.query('SELECT thumbnail_url FROM edvoy_specs_history WHERE space = $1', [space])
          : await pool.query('SELECT thumbnail_url FROM edvoy_specs_history');
        await Promise.all(toClean.rows.map(r => r.thumbnail_url ? deleteByUrl(r.thumbnail_url) : null));

        if (space) {
          await pool.query('DELETE FROM edvoy_specs_history WHERE space = $1', [space]);
        } else {
          await pool.query('DELETE FROM edvoy_specs_history');
        }
        const history = await fetchHistory();
        return res.status(200).json({ success: true, history });
      }

      if (!id) {
        return res.status(400).json({ error: 'Missing item id for deletion' });
      }

      const existing = await pool.query('SELECT thumbnail_url FROM edvoy_specs_history WHERE id = $1', [id]);
      await pool.query('DELETE FROM edvoy_specs_history WHERE id = $1', [id]);
      if (existing.rows[0]?.thumbnail_url) await deleteByUrl(existing.rows[0].thumbnail_url);

      const history = await fetchHistory();
      return res.status(200).json({ success: true, history });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('History API error:', err);
    return res.status(500).json({ error: err.message || 'Database operation failed' });
  }
}

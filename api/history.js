import pool, { initDb } from './db.js';

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
      const dbRes = await pool.query(
        'SELECT id, name, timestamp, platform, events_count AS "eventsCount", events, feature_context AS "featureContext", space FROM edvoy_specs_history ORDER BY created_at DESC'
      );
      
      const history = dbRes.rows.map(row => ({
        ...row,
        events: row.events ? JSON.parse(row.events) : []
      }));
      
      return res.status(200).json({ history });
    }

    if (req.method === 'POST') {
      const { item } = req.body;
      if (!item) {
        return res.status(400).json({ error: 'Missing item' });
      }

      const { id, name, timestamp, platform, eventsCount, events, featureContext, space } = item;

      await pool.query(
        `INSERT INTO edvoy_specs_history (id, name, timestamp, platform, events_count, events, feature_context, space)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, name, timestamp, platform, eventsCount, JSON.stringify(events), featureContext, space || 'edvoy-student']
      );

      // Fetch latest history
      const dbRes = await pool.query(
        'SELECT id, name, timestamp, platform, events_count AS "eventsCount", events, feature_context AS "featureContext", space FROM edvoy_specs_history ORDER BY created_at DESC'
      );
      const history = dbRes.rows.map(row => ({
        ...row,
        events: row.events ? JSON.parse(row.events) : []
      }));

      return res.status(200).json({ success: true, history });
    }

    if (req.method === 'DELETE') {
      const { id, clearAll, space } = req.body || {};

      if (clearAll) {
        if (space) {
          await pool.query('DELETE FROM edvoy_specs_history WHERE space = $1', [space]);
        } else {
          await pool.query('DELETE FROM edvoy_specs_history');
        }
        const dbRes = await pool.query(
          'SELECT id, name, timestamp, platform, events_count AS "eventsCount", events, feature_context AS "featureContext", space FROM edvoy_specs_history ORDER BY created_at DESC'
        );
        const history = dbRes.rows.map(row => ({
          ...row,
          events: row.events ? JSON.parse(row.events) : []
        }));
        return res.status(200).json({ success: true, history });
      }

      if (!id) {
        return res.status(400).json({ error: 'Missing item id for deletion' });
      }

      await pool.query('DELETE FROM edvoy_specs_history WHERE id = $1', [id]);

      // Fetch latest history
      const dbRes = await pool.query(
        'SELECT id, name, timestamp, platform, events_count AS "eventsCount", events, feature_context AS "featureContext", space FROM edvoy_specs_history ORDER BY created_at DESC'
      );
      const history = dbRes.rows.map(row => ({
        ...row,
        events: row.events ? JSON.parse(row.events) : []
      }));

      return res.status(200).json({ success: true, history });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('History API error:', err);
    return res.status(500).json({ error: err.message || 'Database operation failed' });
  }
}

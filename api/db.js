import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 10000,
});

// Self-initializing table verification
let initPromise = null;

export const initDb = () => {
  if (initPromise) return initPromise;

  const queryText = `
    CREATE TABLE IF NOT EXISTS edvoy_specs_history (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      timestamp VARCHAR(255) NOT NULL,
      platform VARCHAR(50) NOT NULL,
      events_count INT NOT NULL,
      events TEXT NOT NULL,
      feature_context TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS edvoy_settings (
      key VARCHAR(255) PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS edvoy_screens (
      id VARCHAR(255) PRIMARY KEY,
      screen_name VARCHAR(255) NOT NULL,
      platform VARCHAR(50) NOT NULL,
      image_url VARCHAR NOT NULL,
      events JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  initPromise = (async () => {
    try {
      const client = await pool.connect();
      try {
        await client.query(queryText);
        console.log('Postgres initialized: edvoy_specs_history table verified.');
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Postgres initialization failed:', err);
      initPromise = null; // Reset to allow retry on next request
      throw err;
    }
  })();

  return initPromise;
};

export default pool;

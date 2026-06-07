import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Self-initializing table verification
const initDb = async () => {
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
  `;
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
  }
};

initDb();

export default pool;

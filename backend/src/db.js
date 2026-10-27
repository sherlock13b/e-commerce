const { Pool } = require('pg');
const config = require('./config');
const { products } = require('./seed-data');

// The database password never goes into the image or the task definition.
// In AWS the task role reads it from Secrets Manager when the container starts.
// The secret can be a plain string or JSON like {"password": "..."}.
async function resolvePassword() {
  if (!config.db.secretArn) return config.db.password;

  const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
  const client = new SecretsManagerClient({ region: config.region });
  const result = await client.send(new GetSecretValueCommand({ SecretId: config.db.secretArn }));
  const raw = result.SecretString || '';

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.password === 'string') return parsed.password;
  } catch (_) {
    // not JSON, so the secret itself is the password
  }
  return raw;
}

async function createPool() {
  const password = await resolvePassword();
  return new Pool({
    host: config.db.host,
    port: config.db.port,
    database: config.db.name,
    user: config.db.user,
    password,
    // Encrypts the connection. rejectUnauthorized:false skips certificate
    // verification, which is fine for this learning project. In production,
    // load the RDS CA bundle and set it to true.
    ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
    max: 10,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  });
}

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS products (
    id           SERIAL PRIMARY KEY,
    title        TEXT NOT NULL,
    price        NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    description  TEXT NOT NULL DEFAULT '',
    category     TEXT NOT NULL,
    image        TEXT NOT NULL DEFAULT '',
    rating_rate  NUMERIC(3,2) NOT NULL DEFAULT 0,
    rating_count INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
`;

const LOCK_ID = 727001;

// Creates the table and loads sample data when the table is empty.
// The advisory lock makes two containers starting at once take turns,
// so the data is never loaded twice.
async function initSchema(pool) {
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [LOCK_ID]);
    await client.query(SCHEMA_SQL);

    const { rows } = await client.query('SELECT COUNT(*)::int AS n FROM products');
    if (rows[0].n === 0) {
      for (const p of products) {
        await client.query(
          `INSERT INTO products (title, price, description, category, image, rating_rate, rating_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [p.title, p.price, p.description, p.category, p.image, p.rate, p.count]
        );
      }
      console.log(`Seeded ${products.length} products`);
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [LOCK_ID]).catch(() => {});
    client.release();
  }
}

module.exports = { createPool, initSchema };

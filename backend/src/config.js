// All settings come from environment variables, so the same image runs
// locally, in Review, RC and Prod. Only the values change per environment.

const bool = (value, fallback) =>
  value === undefined ? fallback : String(value).toLowerCase() === 'true';

module.exports = {
  port: Number(process.env.PORT || 3000),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  region: process.env.AWS_REGION || 'ap-south-1',

  // Create the table and load sample products on startup (safe to repeat).
  initDb: bool(process.env.INIT_DB, true),

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    name: process.env.DB_NAME || 'ecommerce',
    user: process.env.DB_USER || 'postgres',
    // Used only when DB_SECRET_ARN is empty (local development).
    password: process.env.DB_PASSWORD || '',
    // RDS requires SSL. Keep false for a local Postgres.
    ssl: bool(process.env.DB_SSL, false),
    // If set, the password is read from AWS Secrets Manager at startup.
    secretArn: process.env.DB_SECRET_ARN || '',
  },
};

const config = require('./config');
const { createPool, initSchema } = require('./db');
const { createRepo } = require('./repo');
const { createApp } = require('./app');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The database may need a few seconds after a deploy. Try a few times, then
// exit with an error. ECS shows the stopped task with this log line, which is
// the first place to look in an incident.
async function connectWithRetry(attempts = 5, delayMs = 3000) {
  const pool = await createPool();
  for (let i = 1; i <= attempts; i += 1) {
    try {
      await pool.query('SELECT 1');
      console.log('Connected to the database');
      return pool;
    } catch (err) {
      console.error(`Database connection attempt ${i}/${attempts} failed: ${err.message}`);
      if (i === attempts) throw err;
      await sleep(delayMs);
    }
  }
  return pool;
}

async function main() {
  const pool = await connectWithRetry();
  if (config.initDb) await initSchema(pool);

  const app = createApp({
    repo: createRepo(pool),
    corsOrigin: config.corsOrigin,
    collectDefaultMetrics: true,
  });

  const server = app.listen(config.port, () => {
    console.log(`Backend listening on port ${config.port}`);
  });

  // ECS sends SIGTERM when it stops a task (deploy, scale in). Finish the
  // requests in progress, close the database connections, then exit cleanly.
  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await pool.end().catch(() => {});
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

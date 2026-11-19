const express = require('express');
const cors = require('cors');
const client = require('prom-client');
const { SORT_OPTIONS } = require('./repo');

// The repository is passed in, so tests can use a fake one and run without a database.
function createApp({ repo, corsOrigin = '*', collectDefaultMetrics = false }) {
  const app = express();

  const register = new client.Registry();
  if (collectDefaultMetrics) client.collectDefaultMetrics({ register });
  const httpRequests = new client.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [register],
  });

  app.disable('x-powered-by');
  app.use(cors({ origin: corsOrigin }));

  // One JSON log line per request, written to stdout. ECS sends stdout to
  // CloudWatch Logs. Health checks are skipped so they don't flood the log.
  app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      const route = req.route ? `${req.baseUrl}${req.route.path}` : 'unmatched';
      httpRequests.inc({ method: req.method, route, status: res.statusCode });
      if (req.path !== '/api/health') {
        console.log(
          JSON.stringify({
            time: new Date().toISOString(),
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            ms: Math.round(ms),
          })
        );
      }
    });
    next();
  });

  // Liveness: is the process up? Never touches the database. The ALB health
  // check uses this path, so a database outage doesn't get containers killed.
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Readiness: can we reach the database?
  app.get('/api/ready', async (req, res) => {
    try {
      await repo.ping();
      res.json({ status: 'ready' });
    } catch (err) {
      console.error('Readiness check failed:', err.message);
      res.status(503).json({ status: 'unavailable' });
    }
  });

  app.get('/api/categories', async (req, res) => {
    res.json(await repo.categories());
  });

  app.get('/api/products', async (req, res) => {
    const { category, sort } = req.query;
    if (category !== undefined && typeof category !== 'string') {
      return res.status(400).json({ error: 'category must be a single value' });
    }
    if (sort !== undefined && !SORT_OPTIONS.includes(sort)) {
      return res.status(400).json({ error: `sort must be one of: ${SORT_OPTIONS.join(', ')}` });
    }
    res.json(await repo.list({ category, sort }));
  });

  app.get('/api/products/:id', async (req, res) => {
    if (!/^\d+$/.test(req.params.id)) {
      return res.status(400).json({ error: 'id must be a whole number' });
    }
    const product = await repo.get(Number(req.params.id));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  });

  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.send(await register.metrics());
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Express 5 sends rejected promises from async handlers here.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };

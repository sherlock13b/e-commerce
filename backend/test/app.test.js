const test = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../src/app');

const sample = [
  { id: 1, title: 'A', price: 10, description: '', category: 'x', image: '', rating: { rate: 4, count: 2 } },
  { id: 2, title: 'B', price: 5, description: '', category: 'y', image: '', rating: { rate: 3, count: 1 } },
];

function fakeRepo(overrides = {}) {
  return {
    list: async ({ category } = {}) => (category ? sample.filter((p) => p.category === category) : sample),
    get: async (id) => sample.find((p) => p.id === id) || null,
    categories: async () => ['x', 'y'],
    ping: async () => {},
    ...overrides,
  };
}

async function withServer(repo, fn) {
  const server = createApp({ repo }).listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await fn(base);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}

test('GET /api/health returns ok without touching the database', async () => {
  const repo = fakeRepo({ ping: async () => { throw new Error('db down'); } });
  await withServer(repo, async (base) => {
    const res = await fetch(`${base}/api/health`);
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(await res.json(), { status: 'ok' });
  });
});

test('GET /api/ready returns 200 when the database answers', async () => {
  await withServer(fakeRepo(), async (base) => {
    const res = await fetch(`${base}/api/ready`);
    assert.strictEqual(res.status, 200);
  });
});

test('GET /api/ready returns 503 when the database is down', async () => {
  const repo = fakeRepo({ ping: async () => { throw new Error('db down'); } });
  await withServer(repo, async (base) => {
    const res = await fetch(`${base}/api/ready`);
    assert.strictEqual(res.status, 503);
  });
});

test('GET /api/products returns the list', async () => {
  await withServer(fakeRepo(), async (base) => {
    const res = await fetch(`${base}/api/products`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual((await res.json()).length, 2);
  });
});

test('GET /api/products filters by category', async () => {
  await withServer(fakeRepo(), async (base) => {
    const res = await fetch(`${base}/api/products?category=y`);
    const body = await res.json();
    assert.strictEqual(body.length, 1);
    assert.strictEqual(body[0].category, 'y');
  });
});

test('GET /api/products rejects an unknown sort value', async () => {
  await withServer(fakeRepo(), async (base) => {
    const res = await fetch(`${base}/api/products?sort=drop-table`);
    assert.strictEqual(res.status, 400);
  });
});

test('GET /api/products/:id returns one product', async () => {
  await withServer(fakeRepo(), async (base) => {
    const res = await fetch(`${base}/api/products/1`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual((await res.json()).title, 'A');
  });
});

test('GET /api/products/:id returns 400 for a non-number', async () => {
  await withServer(fakeRepo(), async (base) => {
    const res = await fetch(`${base}/api/products/abc`);
    assert.strictEqual(res.status, 400);
  });
});

test('GET /api/products/:id returns 404 when missing', async () => {
  await withServer(fakeRepo(), async (base) => {
    const res = await fetch(`${base}/api/products/999`);
    assert.strictEqual(res.status, 404);
  });
});

test('an error inside a handler returns 500, not a crash', async () => {
  const repo = fakeRepo({ list: async () => { throw new Error('boom'); } });
  await withServer(repo, async (base) => {
    const res = await fetch(`${base}/api/products`);
    assert.strictEqual(res.status, 500);
    assert.deepStrictEqual(await res.json(), { error: 'Internal server error' });
  });
});

test('unknown routes return 404', async () => {
  await withServer(fakeRepo(), async (base) => {
    const res = await fetch(`${base}/api/nothing-here`);
    assert.strictEqual(res.status, 404);
  });
});

test('GET /metrics exposes Prometheus metrics', async () => {
  await withServer(fakeRepo(), async (base) => {
    const res = await fetch(`${base}/metrics`);
    assert.strictEqual(res.status, 200);
    assert.match(await res.text(), /http_requests_total/);
  });
});

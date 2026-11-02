import { test } from 'node:test';
import assert from 'node:assert';
import app from '../src/index';

test('App health check endpoint returns 200 OK', async () => {
  const req = new Request('http://localhost:8787/health');
  const res = await app.fetch(req, {} as any);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'ok');
});

test('App responds with HTML on 404', async () => {
  const req = new Request('http://localhost:8787/nonexistent-static-page');
  const res = await app.fetch(req, {
    DB: {
      prepare: () => ({
        bind: () => ({
          raw: async () => [],
          all: async () => ({ results: [] }),
          first: async () => null,
          run: async () => ({}),
        }),
      }),
    },
  } as any);
  assert.strictEqual(res.status, 404);
  const html = await res.text();
  assert.match(html, /Not Found/);
});

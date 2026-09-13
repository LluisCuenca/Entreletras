const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require.resolve('../sw.js'), 'utf8');
function worker() {
  const handlers = {}, removed = [], requests = [];
  let networkCalls = 0;
  const context = {
    URL, Request,
    self: { registration: { scope: 'https://example.test/Entreletras/' }, addEventListener: (type, cb) => handlers[type] = cb, skipWaiting: async () => {}, clients: { claim: async () => {} } },
    caches: {
      open: async () => ({ addAll: async entries => requests.push(...entries), match: async () => ({ cached: true }) }),
      keys: async () => ['another-app', 'entreletras:/other/:v1', 'entreletras:/Entreletras/:v1', 'entreletras:/Entreletras/:v5'],
      delete: async key => removed.push(key)
    },
    fetch: async () => { networkCalls++; throw new Error('Offline'); }
  };
  vm.runInNewContext(source, context);
  return { handlers, removed, requests, networkCalls: () => networkCalls };
}
test('Offline installation includes the complete application beneath its GitHub Pages path', async () => {
  const w = worker(); let pending;
  w.handlers.install({ waitUntil: p => pending = p }); await pending;
  const html = fs.readFileSync(require.resolve('../index.html'), 'utf8');
  const urls = new Set(w.requests.map(r => r.url));
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (!match[1].startsWith('#')) assert(urls.has(new URL(match[1], 'https://example.test/Entreletras/').href), `Missing offline asset: ${match[1]}`);
  }
  assert(w.requests.every(r => r.url.startsWith('https://example.test/Entreletras/') && r.cache === 'reload'));
  assert(w.requests.some(r => r.url.endsWith('/core.js')));
});
test('Activation only removes older caches for this application path', async () => {
  const w = worker(); let pending;
  w.handlers.activate({ waitUntil: p => pending = p }); await pending;
  assert.deepEqual(w.removed, ['entreletras:/Entreletras/:v1']);
});
test('Cached files load offline without attempting the network; unrelated URLs are left alone', async () => {
  const w = worker(); let response;
  w.handlers.fetch({ request: new Request('https://example.test/Entreletras/app.js'), respondWith: p => response = p });
  assert.equal((await response).cached, true); assert.equal(w.networkCalls(), 0);
  for (const url of ['https://elsewhere.test/Entreletras/app.js', 'https://example.test/another/app.js', 'https://example.test/Entreletras/missing.js']) {
    let handled = false;
    w.handlers.fetch({ request: new Request(url), respondWith: () => handled = true }); assert.equal(handled, false);
  }
});

/**
 * Guards the one place security headers must be written twice: netlify.toml
 * (static files, functions) must hold exactly the list in
 * config/security-headers.json (used by next.config.ts for rendered pages).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const list = JSON.parse(readFileSync(new URL('../../config/security-headers.json', import.meta.url), 'utf8')).headers;
const toml = readFileSync(new URL('../../netlify.toml', import.meta.url), 'utf8');

/** Key = "value" lines inside the [[headers]] for = "/*" block. */
function netlifyHeaderValues() {
  // Only a real table header at the start of a line — comments may mention it.
  const block = toml.split(/^\[\[headers\]\]\s*$/m)[1];
  assert.ok(block, 'netlify.toml has a [[headers]] block');
  assert.match(block, /for = "\/\*"/, 'the block applies to every path');
  const values = block.split('[headers.values]')[1] ?? '';
  return Object.fromEntries([...values.matchAll(/^\s*([A-Za-z-]+)\s*=\s*"([^"]*)"\s*$/gm)].map(m => [m[1], m[2]]));
}

test('netlify.toml security headers are identical to config/security-headers.json', () => {
  const expected = Object.fromEntries(list.map(h => [h.key, h.value]));
  assert.deepEqual(netlifyHeaderValues(), expected);
});

test('the list holds the four M0 baseline headers', () => {
  assert.deepEqual(list.map(h => h.key).sort(), ['Permissions-Policy', 'Referrer-Policy', 'X-Content-Type-Options', 'X-Frame-Options']);
});

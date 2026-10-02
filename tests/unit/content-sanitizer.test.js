/**
 * Tests for the article HTML cleaner (src/utils/contentSanitizer.ts), run
 * against a jsdom window. Article HTML is rendered as-is on article pages, so
 * these are the site's XSS and "pasted content" guarantees.
 * Node runs the TypeScript module directly (type stripping).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createArticleCleaner } from '../../src/utils/contentSanitizer.ts';

const clean = createArticleCleaner(new JSDOM('').window);

test('scripts, event handlers and javascript: URLs are removed', () => {
  const out = clean('<p onclick="steal()">Hi<script>alert(1)</script></p><a href="javascript:alert(1)">x</a><img src="x" onerror="alert(1)">');
  assert.doesNotMatch(out, /script|onclick|onerror|javascript:/i);
  assert.ok(out.includes('<p>Hi</p>'));
});

test('style blocks, forms and form controls are removed (page restyling, phishing)', () => {
  const out = clean('<style>body{display:none}</style><form action="https://evil.example"><input name="pw"><button formaction="https://evil.example">Go</button></form><textarea>t</textarea><select><option>o</option></select><p>ok</p>');
  assert.doesNotMatch(out, /<style|<form|<input|<button|formaction|<textarea|<select|<option/i);
  assert.ok(out.includes('<p>ok</p>'));
});

test('iframes are removed', () => {
  assert.doesNotMatch(clean('<iframe src="https://evil.example"></iframe><p>ok</p>'), /iframe/i);
});

test('design-breaking inline styles are stripped, others kept', () => {
  assert.equal(clean('<p style="color: red; background-color: white; font-size: 30px; text-align: center">t</p>'), '<p style="text-align: center;">t</p>');
  assert.equal(clean('<span style="color: #000">t</span>'), '<span>t</span>');
});

test('non-breaking spaces become normal spaces; empty headings are removed', () => {
  assert.equal(clean('<p>Un signal</p>'), '<p>Un signal</p>');
  assert.equal(clean('<h2>  </h2><h2>Titre</h2>'), '<h2>Titre</h2>');
});

test('normal article content survives unchanged, and cleaning is idempotent', () => {
  const html = '<h2>Titre</h2><p>Texte <strong>fort</strong> et <em>souligné</em> <a href="https://afrinia.org/fr/blog">lien</a>.</p><ul><li>un</li></ul><img src="https://x/y.png" alt="a">';
  assert.equal(clean(html), html);
  assert.equal(clean(clean(html)), clean(html));
});

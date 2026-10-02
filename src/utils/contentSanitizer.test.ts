/**
 * Article HTML cleaner tests — run against jsdom, i.e. exactly the server
 * path (src/server/content/cleanHtml.ts); the browser runs the same function
 * with its own window. Article HTML is rendered as raw HTML, so these are the
 * site's XSS guarantees.
 */
import { describe, expect, test } from 'vitest';
import { cleanArticleHtmlOnServer as clean } from '@/server/content/cleanHtml';

describe('security (XSS)', () => {
  test('scripts, event handlers and javascript: URLs are removed', () => {
    const out = clean('<p onclick="steal()">Hi<script>alert(1)</script></p><a href="javascript:alert(1)">x</a><img src="x" onerror="alert(1)">');
    expect(out).not.toMatch(/script|onclick|onerror|javascript:/i);
    expect(out).toContain('<p>Hi</p>');
  });

  test('iframes, forms, form controls and style blocks are removed', () => {
    const out = clean('<iframe src="https://evil.example"></iframe><form action="/x"><input></form><style>body{display:none}</style><p>ok</p>');
    expect(out).not.toMatch(/iframe|<form|<style/i);
    expect(out).toContain('<p>ok</p>');
    expect(clean('<button formaction="https://evil.example">x</button><textarea>t</textarea><select><option>o</option></select>')).not.toMatch(/button|formaction|textarea|select|option/i);
  });
});

describe('design normalisation (pasted content)', () => {
  test('colour, background and font styles are stripped; other styles kept', () => {
    const out = clean('<p style="color: red; background-color: white; font-size: 30px; text-align: center">t</p>');
    expect(out).toBe('<p style="text-align: center;">t</p>');
  });

  test('an emptied style attribute is dropped entirely', () => {
    expect(clean('<span style="color: #000">t</span>')).toBe('<span>t</span>');
  });

  test('non-breaking spaces between words become normal spaces', () => {
    expect(clean('<p>Un signal stratégique</p>')).toBe('<p>Un signal stratégique</p>');
  });

  test('empty headings are removed; headings with an image are kept', () => {
    expect(clean('<h2>  </h2><h2>Title</h2>')).toBe('<h2>Title</h2>');
    expect(clean('<h3><img src="https://x/y.png"></h3>')).toContain('<img');
  });
});

describe('safe content survives unchanged', () => {
  test('links, lists, emphasis and images are kept', () => {
    const html = '<h2>Titre</h2><p>Texte <strong>fort</strong> et <em>souligné</em> <a href="https://afrinia.org/fr/blog">lien</a>.</p><ul><li>un</li></ul><img src="https://x/y.png" alt="a">';
    expect(clean(html)).toBe(html);
  });

  test('cleaning is idempotent', () => {
    const once = clean('<p style="color:red">A B</p><h2></h2>');
    expect(clean(once)).toBe(once);
  });

  test('empty input is returned as is', () => {
    expect(clean('')).toBe('');
  });
});

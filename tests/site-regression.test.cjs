'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('document has essential semantic landmarks and responsive viewport', () => {
  assert.match(html, /<html\s+lang="en"/i);
  assert.match(html, /<meta\s+name="viewport"\s+content="width=device-width,initial-scale=1"/i);
  assert.match(html, /<main\s+id="main"/i);
  assert.match(html, /<nav\s+id="site-nav"\s+aria-label="Main navigation"/i);
  assert.match(html, /href="#main"[^>]*>Skip to content<\/a>/i);
  assert.equal((html.match(/<h1\b/gi) || []).length, 1);
});
test('internal navigation targets exist and IDs are unique', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'Duplicate IDs disrupt fragment navigation and labels');
  const known = new Set(ids);
  for (const [, target] of html.matchAll(/\bhref="#([^"]+)"/g)) {
    assert.ok(known.has(target), 'Broken internal navigation target: #' + target);
  }
});
test('Maya image has useful alternative text and reserved dimensions', () => {
  const image = html.match(/<img\b[^>]*src="maya-kindra\.webp"[^>]*>/i);
  assert.ok(image, 'Maya portrait must be present');
  assert.match(image[0], /\balt="[^"]{20,}"/i);
  assert.match(image[0], /\bwidth="\d+"/i);
  assert.match(image[0], /\bheight="\d+"/i);
  assert.ok(fs.existsSync(path.join(__dirname, '..', 'maya-kindra.webp')));
});
test('mobile menu communicates expanded state and Escape behavior', () => {
  assert.match(html, /<button\s+class="menu-toggle"[^>]*aria-controls="site-nav"[^>]*aria-expanded="false"/i);
  assert.match(html, /toggle\.setAttribute\('aria-expanded',String\(open\)\)/);
  assert.match(html, /e\.key==='Escape'/);
  assert.match(html, /toggle\.focus\(\)/);
});
test('pricing and Maya status do not imply a live service', () => {
  assert.match(html, /proposed USD subscription model/i);
  assert.match(html, /interactive AI companionship is in development/i);
  assert.match(html, /subscriptions, payments and interactive AI companionship are not available yet/i);
});
test('motion reduction is available for sensitive visitors', () => {
  assert.match(html, /@media\s*\(prefers-reduced-motion:\s*reduce\)/i);
});

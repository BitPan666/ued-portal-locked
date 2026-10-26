import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const css = existsSync(join(root, 'styles.css')) ? readFileSync(join(root, 'styles.css'), 'utf8') : '';
const require = createRequire(import.meta.url);

const count = (pattern) => [...html.matchAll(pattern)].length;

test('keeps the five continuous resource sections', () => {
  for (const id of ['platforms', 'skills', 'tools', 'assets', 'guides']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
});

test('keeps the complete resource inventory', () => {
  assert.equal(count(/<(?:a|button)[^>]+class="[^"]*platform-card\b/g), 7);
  assert.equal(count(/<article[^>]+class="[^"]*skill-card\b/g), 6);
  assert.equal(count(/<article[^>]+class="[^"]*tool-card\b/g), 4);
  assert.equal(count(/<article[^>]+class="[^"]*team-asset\b/g), 4);
  assert.equal(count(/<(?:a|button)[^>]+class="[^"]*guide-card\b/g), 6);
});

test('preserves representative configured resource links', () => {
  const requiredUrls = [
    'https://www.figma.com/files/team/1398222232321482158/folder/603595330',
    'https://lanhuapp.com/dashboard/',
    'https://doc.360teams.com/sheets/rp3OV8PVEEHj8xAm/fcUlJ',
    'https://www.figma.com/design/vf2R7UnumMalicVorK7BrY/',
    'https://www.figma.com/design/rJCVHAEMLxR7I8GNu2qo7Y/'
  ];

  for (const url of requiredUrls) assert.ok(html.includes(url), `missing ${url}`);
});

test('extracts the visual assets required by the redesign', () => {
  const expected = [
    'platform-figma.svg',
    'platform-lanhu.svg',
    'platform-ui-review.png',
    'skill-surreal-brand.jpg',
    'skill-tech-kv.jpg',
    'skill-seasonal-poster.jpg',
    'skill-benefit-combo.jpg',
    'skill-qfn-list-page.jpg',
    'skill-figma-drawer.jpg',
    'tool-delete-slices.png',
    'tool-sketch-font.png',
    'tool-font-repair.png'
  ];

  for (const file of expected) {
    assert.ok(existsSync(join(root, 'assets', file)), `missing assets/${file}`);
  }
});

test('uses semantic landmarks and anchor-only section navigation', () => {
  assert.match(html, /<header[^>]+class="[^"]*site-header/);
  assert.match(html, /<nav[^>]+class="[^"]*anchor-nav/);
  assert.match(html, /<main[^>]+id="main-content"/);
  for (const id of ['platforms', 'skills', 'tools', 'assets', 'guides']) {
    assert.match(html, new RegExp(`href="#${id}"`));
  }
});

test('marks searchable records and unavailable entries explicitly', () => {
  assert.equal(count(/class="[^"]*resource-item\b/g), 27);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /class="[^"]*search-empty/);
});

test('loads standalone style and behavior files', () => {
  assert.match(html, /<link[^>]+href="styles\.css"/);
  assert.match(html, /<script[^>]+src="app\.js"[^>]*defer/);
  assert.ok(existsSync(join(root, 'styles.css')));
  assert.ok(existsSync(join(root, 'app.js')));
});

test('search helpers normalize and match Chinese and Latin metadata', () => {
  const { normalizeSearch, matchesSearchRecord, isSafeExternalUrl } = require(join(root, 'app.js'));
  assert.equal(normalizeSearch('  QFN  LIST  '), 'qfn list');
  assert.equal(matchesSearchRecord('设计 Skill Qfn-list-page @潘越', 'QFN'), true);
  assert.equal(matchesSearchRecord('设计 Skill Qfn-list-page @潘越', '潘越'), true);
  assert.equal(matchesSearchRecord('设计 Skill Qfn-list-page @潘越', '蓝湖'), false);
  assert.equal(isSafeExternalUrl('https://www.figma.com/design/example'), true);
  assert.equal(isSafeExternalUrl('javascript:alert(1)'), false);
});

test('defines the restrained Linear-inspired color system', () => {
  assert.match(css, /--bg:\s*#08090d/i);
  assert.match(css, /--surface:\s*#0d0f15/i);
  assert.match(css, /--accent:\s*#6e72ff/i);
  assert.match(css, /--line:\s*rgba\(255,\s*255,\s*255,\s*\.0[6-9]\)/i);
});

test('uses thin lines, sticky anchors, and an explicit focus state', () => {
  assert.match(css, /border:\s*1px solid var\(--line\)/i);
  assert.match(css, /\.anchor-wrap\s*\{[^}]*position:\s*sticky/is);
  assert.match(css, /:focus-visible\s*\{/i);
});

test('includes desktop-to-mobile breakpoints and reduced motion', () => {
  assert.match(css, /@media\s*\(max-width:\s*900px\)/i);
  assert.match(css, /@media\s*\(max-width:\s*640px\)/i);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/i);
});

test('includes fine-grid and scroll-progress treatments', () => {
  assert.match(css, /linear-gradient\([^;]+1px/is);
  assert.match(css, /--scroll-progress/i);
});


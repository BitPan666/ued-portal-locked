import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

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


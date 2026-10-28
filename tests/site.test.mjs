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

test('shows the five business lines with three current projects each', () => {
  assert.match(html, /id="projects"/);
  assert.equal(count(/<article class="project-group">/g), 5);
  assert.equal(count(/class="project-item resource-item"/g), 15);
  for (const label of ['借条', '奇富生活', '创新中收', '中后台', '品牌＋运营＋企业']) {
    assert.ok(html.includes(label), `missing project category: ${label}`);
  }
});

test('renders project groups as owner-led cards without sequence numbers', () => {
  const projectSection = html.match(/<section class="project-showcase[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.ok(projectSection);
  assert.doesNotMatch(projectSection, /<ol>|<li>|<header><span>0[1-5]<\/span>/);
  assert.equal((projectSection.match(/class="project-list"/g) ?? []).length, 5);
  assert.equal((projectSection.match(/class="project-meta"/g) ?? []).length, 15);
  for (const label of ['交互', 'UI', '设计', '视觉']) assert.ok(projectSection.includes(`<dt>${label}</dt>`));
  assert.equal((projectSection.match(/<h4><a /g) ?? []).length, 15);
  assert.match(projectSection, /assets\/platform-figma\.svg/);
  assert.match(projectSection, /assets\/platform-lanhu\.svg/);
  assert.doesNotMatch(projectSection, /3 个重点项目/);
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
    'tool-font-repair.png',
    'qfin-logo-white.png',
    'qfin-logo-black.png',
    'qfin-logo-green.png'
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

test('keeps the anchor bar and section headings visually concise', () => {
  assert.doesNotMatch(html, /class="anchor-caption"/);
  assert.doesNotMatch(html, />资源目录</);
  assert.equal(count(/class="section-index"/g), 0);
  assert.equal(count(/<div class="section-heading"><div><h2/g), 4);
  assert.match(html, /class="platform-band shell resource-section"/);
  for (const label of ['DAILY ENTRY POINTS', 'DESIGN CAPABILITY', 'EFFICIENCY TOOLKIT', 'TEAM-OWNED SYSTEM', 'TEAM KNOWLEDGE']) {
    assert.ok(!html.includes(label), `unexpected fragmented heading label: ${label}`);
  }
});

test('uses an Ant Design-inspired brand hero followed by three updates', () => {
  assert.match(html, /<h1[^>]+id="hero-title"><img[^>]+qfin-logo-white\.png[^>]+alt="QFIN"><span>Design<\/span><\/h1>/);
  assert.match(html, /让好的设计，持续发生/);
  assert.equal(count(/class="announcement-card(?: featured)?"/g), 3);
  assert.match(html, /设计资产管理规范 2\.0/);
  assert.match(html, /品牌科技主视觉/);
  assert.match(html, /Qfn-list-page/);
  assert.match(html, /data-focus-search/);
  assert.doesNotMatch(html, /class="hero-banner"/);
  assert.match(css, /\.hero-intro h1 img\s*\{[^}]*height:\s*\.84em/is);
});

test('marks searchable records and unavailable entries explicitly', () => {
  assert.equal(count(/class="[^"]*resource-item\b/g), 42);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /class="[^"]*search-empty/);
});

test('loads standalone style and behavior files', () => {
  assert.match(html, /<link[^>]+href="styles\.css"/);
  assert.match(html, /<link[^>]+rel="icon"[^>]+href="data:image\/svg\+xml,/);
  assert.match(html, /<script[^>]+src="app\.js"[^>]*defer/);
  assert.ok(existsSync(join(root, 'styles.css')));
  assert.ok(existsSync(join(root, 'app.js')));
});

test('search helpers normalize and match Chinese and Latin metadata', () => {
  const { normalizeSearch, matchesSearchRecord, isSafeExternalUrl, shouldRecenterSearch } = require(join(root, 'app.js'));
  assert.equal(normalizeSearch('  QFN  LIST  '), 'qfn list');
  assert.equal(matchesSearchRecord('设计 Skill Qfn-list-page @潘越', 'QFN'), true);
  assert.equal(matchesSearchRecord('设计 Skill Qfn-list-page @潘越', '潘越'), true);
  assert.equal(matchesSearchRecord('设计 Skill Qfn-list-page @潘越', '蓝湖'), false);
  assert.equal(isSafeExternalUrl('https://www.figma.com/design/example'), true);
  assert.equal(isSafeExternalUrl('javascript:alert(1)'), false);
  assert.equal(shouldRecenterSearch('', 'qfn'), true);
  assert.equal(shouldRecenterSearch('q', 'qfn'), false);
  assert.equal(shouldRecenterSearch('qfn', ''), false);
});

test('defines the restrained Linear-inspired color system', () => {
  assert.match(css, /--bg:\s*#08090d/i);
  assert.match(css, /--surface:\s*#0c0e13/i);
  assert.match(css, /--accent:\s*#00c873/i);
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
  assert.match(css, /@media\s*\(max-width:\s*640px\)[\s\S]*?\.hero-intro\s+h1\s*\{[^}]*font-size:\s*clamp\(44px,\s*12vw,\s*64px\)/i);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/i);
});

test('includes fine-grid and scroll-progress treatments', () => {
  assert.match(css, /linear-gradient\([^;]+1px/is);
  assert.match(css, /--scroll-progress/i);
});

test('uses a numbered positioning rail and editorial resource grids', () => {
  assert.match(css, /\.anchor-nav\s*\{[^}]*counter-reset:\s*resource-nav/is);
  assert.match(css, /\.anchor-nav\s+a::before\s*\{[^}]*counter-increment:\s*resource-nav/is);
  assert.match(css, /\.platform-grid\s*\{[^}]*display:\s*flex/is);
  assert.match(css, /\.skills-grid\s*\{[^}]*grid-template-columns:\s*repeat\(12,/is);
  assert.match(css, /\.assets-grid\s*\{[^}]*grid-template-columns:\s*repeat\(6,/is);
  assert.match(css, /\.team-asset:first-child\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/is);
});

test('places the project matrix between updates and the compact platform strip', () => {
  assert.match(html, /class="announcement-grid"[\s\S]*?id="projects"[\s\S]*?class="platform-band shell resource-section"/);
  assert.equal(count(/class="platform-card resource-item"/g), 7);
  assert.equal(count(/class="platform-symbol(?:\s|\")/g), 7);
  assert.equal(count(/class="platform-symbol platform-symbol-brand"/g), 2);
  assert.match(css, /\.platform-symbol svg\s*\{[^}]*stroke-linecap:\s*round/is);
  assert.match(css, /\.platform-band\.resource-section\s*\{[^}]*display:\s*flex[^}]*border-bottom:\s*0/is);
  assert.match(css, /\.platform-card::after\s*\{[^}]*height:\s*18px/is);
  assert.match(css, /\.project-showcase\.resource-section\s*\{[^}]*padding:\s*54px 0 8px/is);
  assert.match(css, /\.platform-band\.resource-section\s*\{[^}]*margin-bottom:\s*28px/is);
  assert.doesNotMatch(html.match(/<section class="platform-band[\s\S]*?<\/section>/)?.[0] ?? '', /<i>›<\/i>/);
  assert.match(css, /\.announcement-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,/is);
});

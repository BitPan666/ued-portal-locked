import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const css = existsSync(join(root, 'styles.css')) ? readFileSync(join(root, 'styles.css'), 'utf8') : '';
const require = createRequire(import.meta.url);

const count = (pattern) => [...html.matchAll(pattern)].length;

test('keeps resource sections and legacy asset and tool anchors', () => {
  for (const id of ['platforms', 'skills', 'resources', 'tools', 'assets', 'guides']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
});

test('preserves five business lines while hiding the project module', () => {
  assert.match(html, /id="projects"[^>]*hidden inert/);
  assert.equal(count(/<article class="project-group">/g), 5);
  assert.equal(count(/class="project-item resource-item"/g), 15);
  for (const label of ['借条', '奇富生活', '创新中收', '中后台', '品牌＋运营＋企业']) {
    assert.ok(html.includes(label), `missing project category: ${label}`);
  }
});

test('routes each business-line arrow and its projects to the matching worksheet', () => {
  const expectedSheets = [
    ['借条', 'MODOC'],
    ['奇富生活', 'EJZoz'],
    ['创新中收', 'Z1g1n'],
    ['中后台', 'AMQAF'],
    ['品牌＋运营＋企业', 'ceWGh']
  ];
  const section = html.match(/<section class="project-showcase[\s\S]*?<\/section>/)[0];
  const groups = section.split('<article class="project-group">').slice(1);
  assert.equal(groups.length, expectedSheets.length);
  for (const [index, [name, sheetId]] of expectedSheets.entries()) {
    const group = groups[index];
    assert.ok(group.includes(`<h3>${name}`));
    const headerLink = group.match(/<a class="project-group-link"[^>]*>/)[0];
    const links = [headerLink, ...group.matchAll(/<h4>(<a [^>]*>)/g)].map((link) => typeof link === 'string' ? link : link[1]);
    assert.equal(links.length, 4, `${name} should have one worksheet shortcut and three project links`);
    for (const link of links) {
      const url = new URL(link.match(/href="([^"]+)"/)[1]);
      assert.equal(url.origin, 'https://doc.360teams.com');
      assert.equal(url.pathname, `/sheets/vVAXVn7VxBtllrqm/${sheetId}`, `${name} must open its own worksheet`);
      assert.match(link, /target="_blank"/);
      assert.match(link, /rel="noopener noreferrer"/);
    }
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
    'skill-c-half-sheet.png',
    'skill-c-half-sheet-form.png',
    'skill-c-half-sheet-result.png',
    'skill-qfin-list-page.png',
    'skill-figma-drawer.png',
    'tool-delete-slices.png',
    'tool-sketch-font.png',
    'tool-font-repair.png',
    'qfin-logo-white.png',
    'qfin-logo-black.png',
    'qfin-logo-green.png',
    'qfin-mark-green.svg',
    'qfin-ip-characters.png',
    'qfin-favicon.svg',
    'asset-library.svg',
    'asset-ui-system.svg'
  ];

  for (const file of expected) {
    assert.ok(existsSync(join(root, 'assets', file)), `missing assets/${file}`);
  }
});

test('keeps semantic landmarks without the page positioning bar', () => {
  assert.match(html, /<header[^>]+class="[^"]*site-header/);
  assert.match(html, /<main[^>]+id="main-content"/);
  assert.doesNotMatch(html, /class="anchor-(?:nav|wrap)/);
});

test('keeps section headings visually concise', () => {
  assert.doesNotMatch(html, /class="anchor-caption"/);
  assert.doesNotMatch(html, />资源目录</);
  assert.equal(count(/class="section-index"/g), 0);
  assert.equal(count(/<div class="section-heading"><div><h2/g), 3);
  assert.match(html, /class="platform-band shell resource-section"/);
  for (const label of ['DAILY ENTRY POINTS', 'DESIGN CAPABILITY', 'EFFICIENCY TOOLKIT', 'TEAM-OWNED SYSTEM', 'TEAM KNOWLEDGE']) {
    assert.ok(!html.includes(label), `unexpected fragmented heading label: ${label}`);
  }
});

test('connects the three hero recommendations to existing resources', () => {
  assert.match(html, /<h1[^>]+id="hero-title"><img[^>]+qfin-logo-white\.png[^>]+alt="QFIN"><span>Design<\/span><\/h1>/);
  assert.match(html, /让好的设计，持续发生/);
  assert.equal(count(/class="announcement-card(?: featured)?"/g), 3);
  const catalog = html.slice(html.indexOf('id="projects"'));
  for (const [, href, card] of html.matchAll(/<a class="announcement-card(?: featured)?" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const title = card.match(/<h2>([^<]+)<\/h2>/)[1];
    assert.ok(catalog.includes(`>${title}<`), `recommendation must name an existing resource: ${title}`);
    if (href.startsWith('#')) {
      assert.ok(catalog.includes(`id="${href.slice(1)}"`), `missing recommendation destination: ${href}`);
    } else {
      assert.ok(existsSync(join(root, href)), `missing recommendation page: ${href}`);
    }
  }
  assert.doesNotMatch(html, /class="hero-banner"/);
});

test('marks searchable records and unavailable entries explicitly', () => {
  assert.equal(count(/class="[^"]*resource-item\b/g), 42);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /class="[^"]*search-empty/);
});

test('loads existing style and behavior files with current content versions to avoid stale assets', () => {
  assert.match(html, /<link[^>]+href="styles\.css(?:\?[^\"]+)?"/);
  assert.match(html, /<link[^>]+rel="icon"[^>]+href="assets\/qfin-favicon\.svg"/);
  assert.match(html, /<script[^>]+src="app\.js(?:\?[^\"]+)?"[^>]*defer/);
  for (const page of ['index.html', 'skills/qfin-list-page.html']) {
    const source = readFileSync(join(root, page), 'utf8');
    const dependencies = [...source.matchAll(/(?:href|src)="([^"?#]+\.(?:css|js))(?:\?([^"#]*))?"/g)];
    assert.ok(dependencies.length > 0, `${page} must load its styles and scripts`);
    for (const [, path, query = ''] of dependencies) {
      const assetPath = join(root, dirname(page), path);
      assert.ok(existsSync(assetPath), `missing dependency: ${path}`);
      const contentVersion = createHash('sha256').update(readFileSync(assetPath)).digest('hex').slice(0, 12);
      assert.equal(new URLSearchParams(query).get('v'), contentVersion, `${page}: refresh the version of ${path} after editing it`);
    }
  }
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

test('searches all Skill categories and other resource types together', () => {
  const { matchesSearchRecord } = require(join(root, 'app.js'));
  const records = [
    { name: '品牌科技主视觉', search: '设计 Skill 视觉设计 品牌科技主视觉 段滢婕', category: 'visual' },
    { name: 'Qfn-list-page', search: '设计 Skill UI设计 Qfn-list-page 潘越', category: 'ui' },
    { name: 'Qifu Font Repair', search: '工具插件 Qifu Font Repair 师静雅' }
  ];
  const visible = (query) => records.filter((item) => matchesSearchRecord(item.search, query)).map((item) => item.name);
  assert.deepEqual(visible(''), records.map((item) => item.name));
  assert.deepEqual(visible('设计 Skill'), ['品牌科技主视觉', 'Qfn-list-page']);
  assert.deepEqual(visible('  QFN  '), ['Qfn-list-page']);
  assert.deepEqual(visible('师静雅'), ['Qifu Font Repair']);
  assert.deepEqual(visible('没有匹配的资源'), []);
});

test('defines the restrained Linear-inspired color system', () => {
  assert.match(css, /--bg:\s*#0b0e13/i);
  assert.match(css, /--surface:\s*#0c0e13/i);
  assert.match(css, /--accent:\s*#00c873/i);
  assert.match(css, /--line:\s*rgba\(255,\s*255,\s*255,\s*\.0[6-9]\)/i);
});

test('uses thin lines and an explicit focus state', () => {
  assert.match(css, /border:\s*1px solid var\(--line\)/i);
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

test('uses responsive resource grids', () => {
  assert.match(css, /\.platform-grid\s*\{[^}]*display:\s*grid/is);
  assert.match(css, /\.skills-grid\s*\{[^}]*grid-template-columns:\s*repeat\(12,/is);
  assert.match(css, /\.resource-panels\s*\{[^}]*grid-template-columns:\s*repeat\(2,/is);
});

test('promotes seven platform cards immediately after the hero', () => {
  assert.match(html, /class="announcement-grid"[\s\S]*?id="platforms"[\s\S]*?id="projects"[^>]*hidden inert/);
  assert.equal(count(/class="platform-card resource-item"/g), 7);
  assert.equal(count(/class="platform-symbol platform-symbol-brand"/g), 2);
  assert.match(css, /\.platform-card small\s*\{[^}]*color:/is);
  assert.doesNotMatch(css, /\.platform-card small\s*\{[^}]*display:\s*none/is);
});

test('connects the compact Skill catalog to a deployable detail page and preserves examples', () => {
  assert.match(html, /class="skill-detail-link" href="skills\/qfin-list-page\.html"/);
  const skillSection = html.match(/<section[^>]+id="skills"[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(skillSection, /class="skill-visual"/);
  assert.equal((skillSection.match(/class="skill-thumbnail"/g) ?? []).length, 6);
  for (const card of skillSection.matchAll(/<article\b[\s\S]*?<\/article>/g)) {
    const sources = [...card[0].matchAll(/data-preview-src="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(sources.length, 2);
    assert.equal(sources[0], sources[1], 'thumbnail and text action should open the same example');
    assert.ok(existsSync(join(root, sources[0])), `missing Skill example: ${sources[0]}`);
    assert.ok(card[0].includes(`src="${sources[0]}" alt="`));
  }
  const detail = readFileSync(join(root, 'skills/qfin-list-page.html'), 'utf8');
  assert.match(detail, /href="\.\.\/index\.html#skills"/);
  for (const match of detail.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) {
    const target = match[1].split(/[?#]/)[0];
    if (/^[a-z]+:/i.test(target)) continue;
    assert.ok(existsSync(join(root, 'skills', target)), `missing detail-page dependency: ${target}`);
  }
});

test('publishes sourced QFIN platform versions and complete two-step installation instructions', () => {
  const detail = readFileSync(join(root, 'skills/qfin-list-page.html'), 'utf8');
  for (const skill of ['qifu-yushu-list-page', 'qifu-jinyumeng-list-page', 'qifu-dianxiao-list-page']) assert.ok(detail.includes(skill));
  assert.match(detail, /codex plugin marketplace add https:\/\/github\.com\/BitPan666\/qfin-list-page\.git --ref main\ncodex plugin add qfin-list-page@qfin-list-page/);
  for (const id of ['overview', 'usage', 'files', 'versions', 'install-prompt', 'install-cli']) {
    assert.match(detail, new RegExp(`aria-controls="panel-${id}"`));
    assert.match(detail, new RegExp(`id="panel-${id}" aria-labelledby="tab-${id}"`));
  }
  for (const match of detail.matchAll(/data-copy-target="([^"]+)"/g)) assert.ok(detail.includes(`id="${match[1]}"`));
  assert.match(detail, /href="https:\/\/github\.com\/BitPan666\/qfin-list-page\/blob\/main\/versions\.json"/);
});

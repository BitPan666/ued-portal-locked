import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'index.html'), 'utf8');
const outputDir = join(root, 'assets');

const manifest = new Map([
  ['Figma', 'platform-figma.svg'],
  ['蓝湖', 'platform-lanhu.svg'],
  ['UI验收平台', 'platform-ui-review.png'],
  ['超现实品牌场景 配图', 'skill-surreal-brand.jpg'],
  ['品牌科技主视觉 配图', 'skill-tech-kv.jpg'],
  ['奇富科技节日节气海报 配图', 'skill-seasonal-poster.jpg'],
  ['首页多福利组合 Skill 配图', 'skill-benefit-combo.jpg'],
  ['Qfn-list-page 配图', 'skill-qfn-list-page.jpg'],
  ['Qfn-figma-drawer-builder Skill 配图', 'skill-figma-drawer.jpg'],
  ['Delete Slices', 'tool-delete-slices.png'],
  ['Sketch 字体替换', 'tool-sketch-font.png'],
  ['Qifu Font Repair', 'tool-font-repair.png']
]);

const extracted = new Set();
const imagePattern = /<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"[^>]*alt="([^"]*)"[^>]*>/g;

mkdirSync(outputDir, { recursive: true });

for (const match of source.matchAll(imagePattern)) {
  const [, , payload, alt] = match;
  const filename = manifest.get(alt);
  if (!filename || extracted.has(filename)) continue;
  writeFileSync(join(outputDir, filename), Buffer.from(payload, 'base64'));
  extracted.add(filename);
}

const missing = [...manifest.values()].filter((name) => !extracted.has(name));
if (missing.length) {
  throw new Error(`Unable to extract: ${missing.join(', ')}`);
}

console.log(`Extracted ${extracted.size} assets to ${outputDir}`);

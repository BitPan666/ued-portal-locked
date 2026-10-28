import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CATEGORY_IDS = new Map([
  ['借条', 'borrow'],
  ['奇富生活（会员）', 'member'],
  ['创新中收（智信）', 'innovation'],
  ['中后台', 'backend'],
  ['品牌+运营+企业', 'brand'],
  ['品牌 + 运营 + 企业', 'brand']
]);

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith('--')) continue;
    args[argv[index].slice(2)] = argv[index + 1];
    index += 1;
  }
  return args;
}

function currentMonthInShanghai(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit'
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year').value;
  const month = parts.find((part) => part.type === 'month').value;
  return `${year}-${month}`;
}

function normalizeLink(value) {
  return typeof value === 'string' && /^https?:\/\//.test(value) ? value : '';
}

function normalizeRow(row) {
  return {
    name: String(row.name ?? row.title ?? '').trim(),
    status: String(row.status ?? '').trim(),
    updatedAt: String(row.updatedAt ?? row.date ?? '').trim(),
    links: {
      confluence: normalizeLink(row.confluence ?? row.links?.confluence),
      figma: normalizeLink(row.figma ?? row.links?.figma),
      lanhu: normalizeLink(row.lanhu ?? row.links?.lanhu)
    }
  };
}

export function normalizePayload(payload, month) {
  const sheets = Array.isArray(payload.sheets)
    ? payload.sheets
    : Array.isArray(payload.categories)
      ? payload.categories.map((category) => ({ name: category.name, rows: category.projects }))
      : [];

  const categories = sheets
    .map((sheet) => {
      const name = String(sheet.name ?? '').trim();
      const projects = (Array.isArray(sheet.rows) ? sheet.rows : [])
        .map(normalizeRow)
        .filter((project) => project.name)
        .filter((project) => !project.updatedAt || project.updatedAt.startsWith(month))
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

      return {
        id: CATEGORY_IDS.get(name) ?? `category-${name}`,
        name,
        projects
      };
    })
    .filter((category) => category.name && category.projects.length > 0);

  return {
    schemaVersion: 1,
    month,
    lastSyncedAt: new Date().toISOString(),
    categories
  };
}

async function loadSource({ input, sourceUrl, accessToken }) {
  if (input) {
    return JSON.parse(await readFile(resolve(input), 'utf8'));
  }

  if (!sourceUrl) {
    throw new Error('缺少数据源：请提供 --input 或 SYNC_SOURCE_URL');
  }

  const response = await fetch(sourceUrl, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
  });

  if (!response.ok) {
    throw new Error(`同步接口请求失败：HTTP ${response.status}`);
  }

  return response.json();
}

async function writeAtomically(outputPath, data) {
  const absolutePath = resolve(outputPath);
  const temporaryPath = `${absolutePath}.tmp`;
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, absolutePath);
}

export async function runSync(options = {}) {
  const month = options.month || currentMonthInShanghai();
  const payload = await loadSource(options);
  const normalized = normalizePayload(payload, month);

  if (normalized.categories.length === 0) {
    throw new Error(`没有找到 ${month} 的可展示项目，旧数据将保持不变`);
  }

  await writeAtomically(options.output || 'data/projects.json', normalized);
  return normalized;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  runSync({
    input: args.input,
    output: args.output,
    month: args.month || process.env.SYNC_MONTH,
    sourceUrl: process.env.SYNC_SOURCE_URL,
    accessToken: process.env.SYNC_ACCESS_TOKEN
  })
    .then((result) => {
      const projectCount = result.categories.reduce((sum, category) => sum + category.projects.length, 0);
      console.log(`已同步 ${result.categories.length} 个分类、${projectCount} 个项目（${result.month}）`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}

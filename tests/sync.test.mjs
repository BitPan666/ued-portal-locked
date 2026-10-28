import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { normalizePayload, runSync } from '../sync/sync-projects.mjs';

test('normalizes the five-category source contract and filters by month', () => {
  const result = normalizePayload({
    sheets: [{
      name: '借条',
      rows: [
        { name: '10 月项目', updatedAt: '2026-10-20', figma: 'https://figma.com/file' },
        { name: '9 月项目', updatedAt: '2026-09-20' }
      ]
    }]
  }, '2026-10');

  assert.equal(result.categories[0].id, 'borrow');
  assert.equal(result.categories[0].projects.length, 1);
  assert.equal(result.categories[0].projects[0].links.figma, 'https://figma.com/file');
});

test('keeps the previous cache untouched when the source has no matching projects', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'qfin-project-sync-'));
  const output = join(directory, 'projects.json');
  const previousCache = '{"month":"2026-09","categories":[{"name":"旧数据"}]}\n';

  try {
    await writeFile(output, previousCache, 'utf8');
    await assert.rejects(
      runSync({
        input: 'sync/examples/source.example.json',
        output,
        month: '2030-01'
      }),
      /没有找到/
    );
    assert.equal(await readFile(output, 'utf8'), previousCache);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('writes a stable website-facing JSON file', async () => {
  const output = '/tmp/qfin-project-sync-output.json';
  const result = await runSync({
    input: 'sync/examples/source.example.json',
    output,
    month: '2026-10'
  });
  const written = JSON.parse(await readFile(output, 'utf8'));

  assert.equal(written.schemaVersion, 1);
  assert.equal(written.month, '2026-10');
  assert.equal(written.categories.length, 2);
  assert.equal(written.categories[0].projects[0].name, result.categories[0].projects[0].name);
});

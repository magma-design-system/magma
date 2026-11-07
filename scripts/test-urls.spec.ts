import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  areaOf,
  meaningful,
  render,
  rowsOf,
  storybookPort,
  studioPort,
  type Servers,
  type StoryEntry,
} from './test-urls.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const entry = (
  id: string,
  type: StoryEntry['type'],
  importPath: string,
  name = 'Default',
): StoryEntry => ({
  id,
  title: 'UI / Tags / Chip',
  name,
  importPath,
  type,
});

const servers = (index: StoryEntry[] | null): Servers => ({
  storybook: 'http://localhost:6008',
  studio: 'http://localhost:5177',
  previews: 'http://localhost:5180',
  index,
});

describe('the ports, read from where they are decided', () => {
  it('reads the port of the start script of Storybook, and of the studio, in the real files', () => {
    assert.equal(
      storybookPort(readFileSync(path.join(ROOT, 'projects/stencil/package.json'), 'utf8')),
      6006,
    );
    assert.equal(
      studioPort(readFileSync(path.join(ROOT, 'projects/studio/vite.config.ts'), 'utf8')),
      5177,
    );
  });
  it('answers null when the source names no port', () => {
    assert.equal(storybookPort('{"scripts":{"start":"storybook dev"}}'), null);
    assert.equal(studioPort('export default {}'), null);
  });
});

describe('areaOf', () => {
  it('sorts each changed file into the place it shows', () => {
    assert.deepEqual(areaOf('projects/stencil/src/components/mds-chip/mds-chip.tsx'), {
      kind: 'component',
      name: 'mds-chip',
    });
    assert.deepEqual(areaOf('projects/stencil/src/storybook/box-shadows.stories.tsx'), {
      kind: 'stories',
      file: 'src/storybook/box-shadows.stories.tsx',
    });
    assert.deepEqual(areaOf('projects/studio/src/routes.ts'), { kind: 'studio' });
    assert.deepEqual(areaOf('projects/design-tokens/config/x.json'), { kind: 'tokens' });
    assert.deepEqual(areaOf('projects/styles/src/a.css'), { kind: 'styles' });
    assert.deepEqual(areaOf('docs/agents/patterns/previews/actions/banner.html'), {
      kind: 'preview',
      folder: 'actions',
      name: 'banner',
    });
    assert.deepEqual(areaOf('scripts/epic.ts'), { kind: 'other' });
  });
});

describe('rowsOf', () => {
  const index = [
    entry('ui-chip--default', 'story', './src/components/mds-chip/test/mds-chip.stories.tsx'),
    entry('ui-chip--docs', 'docs', './src/components/mds-chip/test/mds-chip.stories.tsx', 'Docs'),
    entry(
      'ui-chips--docs',
      'docs',
      './src/components/mds-chips/test/mds-chips.stories.tsx',
      'Docs',
    ),
    entry(
      'common-tests--box-shadows',
      'story',
      './src/storybook/box-shadows.stories.tsx',
      'Box Shadows',
    ),
  ];
  const subjects = (files: string[]) => files.map((file) => `change of ${file}`);

  it('links a component to its docs page first, then its stories, from the index and never from its name', () => {
    const [row] = rowsOf(
      ['projects/stencil/src/components/mds-chip/mds-chip.css'],
      subjects,
      servers(index),
    );
    assert.equal(row.title, 'mds-chip');
    assert.deepEqual(
      row.links.map((link) => link.url),
      [
        'http://localhost:6008/?path=/docs/ui-chip--docs',
        'http://localhost:6008/?path=/story/ui-chip--default',
      ],
    );
  });

  it('links a stories file outside the components by its import path', () => {
    const [row] = rowsOf(
      ['projects/stencil/src/storybook/box-shadows.stories.tsx'],
      subjects,
      servers(index),
    );
    assert.deepEqual(row.links, [
      { label: 'Box Shadows', url: 'http://localhost:6008/?path=/story/common-tests--box-shadows' },
    ]);
  });

  it('says so when Storybook does not answer, or shows no story of the change', () => {
    assert.match(
      rowsOf(['projects/stencil/src/components/mds-chip/a.tsx'], subjects, servers(null))[0].note ??
        '',
      /Storybook does not answer at http:\/\/localhost:6008/,
    );
    assert.equal(
      rowsOf(['projects/stencil/src/components/mds-new/a.tsx'], subjects, servers(index))[0].note,
      'no story in Storybook shows it',
    );
  });

  it('gives the studio its pages, the tokens the Colors pages, a preview its stage', () => {
    const rows = rowsOf(
      [
        'projects/studio/src/app.tsx',
        'projects/design-tokens/a.json',
        'docs/agents/patterns/previews/actions/banner.html',
      ],
      subjects,
      servers(index),
    );
    assert.deepEqual(
      rows.map((row) => row.title),
      ['studio', 'design tokens', 'preview actions/banner'],
    );
    assert.ok(rows[0].links.some((link) => link.url === 'http://localhost:5177/#/theme'));
    assert.ok(
      rows[1].links.every((link) => link.url.startsWith('http://localhost:5177/#/colors/')),
    );
    assert.deepEqual(rows[2].links, [
      { label: 'actions/banner', url: 'http://localhost:5180/view/previews/actions/banner' },
    ]);
  });

  it('keeps every other file in one row, so no change goes unseen, and orders the rows', () => {
    const rows = rowsOf(
      ['scripts/a.ts', 'README.md', 'projects/stencil/src/components/mds-chip/a.tsx'],
      subjects,
      servers(index),
    );
    assert.deepEqual(
      rows.map((row) => row.title),
      ['mds-chip', 'no page in the browser'],
    );
    assert.equal(rows[1].note, '2 files: tests, docs, tooling or CI');
  });
});

describe('meaningful', () => {
  it('drops the release commits and the repeats', () => {
    assert.deepEqual(
      meaningful(['fix(a): b', 'chore(release): magma@2.12.0 [skip ci]', 'fix(a): b', '']),
      ['fix(a): b'],
    );
  });
});

describe('render', () => {
  it('writes one row per area, caps the links and keeps the cells in their columns', () => {
    const text = render(
      [
        {
          title: 'a | b',
          changes: ['one'],
          files: [],
          links: Array.from({ length: 8 }, (_, i) => ({ label: `L${i}`, url: `http://x/${i}` })),
        },
      ],
      '## What to test',
      6,
    );
    assert.match(text, /^\| Title \| What changed \| URL \|$/m);
    assert.match(
      text,
      /^\| a \\\| b \| one \| \[L0\]\(http:\/\/x\/0\)<br>.*\[L5\]\(http:\/\/x\/5\)<br>\+2 more \|$/m,
    );
  });
});

import { renderMarkdown } from './markdown.js';
import { type Report } from './types.js';

const report: Report = {
  fromVersion: '1.12.0',
  toVersion: '2.0.0',
  dryRun: true,
  notes: ['import semantic.css'],
  summary: {
    filesScanned: 2,
    filesChanged: 1,
    changes: 1,
    warnings: 0,
    flags: 1,
    dynamic: 2,
    errors: 0,
  },
  files: [
    {
      file: '/repo/src/a.tsx',
      surface: 'react',
      changed: true,
      findings: [
        {
          kind: 'dynamic',
          surface: 'react',
          file: '/repo/src/a.tsx',
          line: 3,
          message: 'seed',
          token: 'bg-tone-neutral-seed',
          reason: 'seed as a background',
          alternatives: [
            { value: 'bg-surface-overlay', light: 0, dark: 40.9 },
            { value: 'bg-surface-raised', light: 2.1, dark: 30.9 },
          ],
        },
        {
          kind: 'flag',
          surface: 'react',
          file: '/repo/src/a.tsx',
          line: 4,
          message: 'suggested',
          token: 'bg-tone-neutral-09',
          reason: 'suggested (exact)',
          alternatives: [{ value: 'bg-wash-base', light: 0, dark: 0 }],
        },
        {
          kind: 'change',
          surface: 'react',
          file: '/repo/src/a.tsx',
          line: 5,
          message: 'rename utility class',
          before: 'rounded-md',
          after: 'rounded-2xs',
        },
      ],
    },
    {
      file: '/repo/src/(pages)/b.tsx',
      surface: 'react',
      changed: false,
      findings: [
        {
          kind: 'dynamic',
          surface: 'react',
          file: '/repo/src/(pages)/b.tsx',
          line: 9,
          message: 'seed',
          token: 'bg-tone-neutral-seed',
          reason: 'seed as a background',
          alternatives: [{ value: 'bg-surface-overlay', light: 0, dark: 40.9 }],
        },
      ],
    },
  ],
};

describe('renderMarkdown', () => {
  const md = renderMarkdown(report, { baseDir: '/repo', cwd: '/repo' });

  it('groups a token needing a decision across files, with how to decide and its alternatives', () => {
    expect(md).toContain(
      '| [1](#decision-1) | `bg-tone-neutral-seed` | seed as a background | 2 |',
    );
    expect(md).toContain('### `bg-tone-neutral-seed`: seed as a background (2)');
    expect(md).toContain('**How to decide:** Pick by what the element is');
    expect(md).toContain('| `bg-surface-raised` | 2.1 | 30.9 |');
    // one checkbox per place, linked to the line; parentheses escaped in the target
    expect(md).toContain('- [ ] [`a.tsx:3`](src/a.tsx#L3)');
    expect(md).toContain('- [ ] [`(pages)/b.tsx:9`](src/%28pages%29/b.tsx#L9)');
  });

  it('lists suggestions apart, with what they become', () => {
    expect(md).toContain('| `bg-tone-neutral-09` | `bg-wash-base` | exact | 1 |');
    expect(md).not.toContain('### `bg-tone-neutral-09`');
  });

  it('writes a checklist per file and folds the automatic changes', () => {
    expect(md).toContain('- [ ] L3 `bg-tone-neutral-seed`, [seed as a background](#decision-1)');
    expect(md).toContain(
      '- [ ] L4 `bg-tone-neutral-09` -> `bg-wash-base` (suggested (exact), see Suggestions)',
    );
    expect(md).toContain('<details><summary>Would be applied automatically (1)</summary>');
    expect(md).toContain('- L5 `rounded-md` -> `rounded-2xs`: rename utility class');
  });

  it('repeats the run notes', () => {
    expect(md).toContain('> **Note:** import semantic.css');
  });
});

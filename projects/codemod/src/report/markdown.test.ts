import { renderMarkdown } from './markdown.js';
import { type Report } from './types.js';

/** The path of a file row and the target of its Open file link. */
const row = (path: string, href: string): RegExp =>
  new RegExp(
    `<span style="display: inline-flex[^"]*"><code style="[^"]*text-overflow: ellipsis[^"]*">` +
      `${path.replace(/[.()[\]]/g, '\\$&')}</code><a href="${href.replace(/[.()]/g, '\\$&')}" ` +
      'style="flex: none">Open file</a></span>',
  );

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
    // each figure marked: identical (<= 0.5), acceptable (<= 2) or far
    expect(md).toContain(
      '| `bg-surface-overlay` | \u2705 0.0 | \u26d4\ufe0f 40.9 | lifted above the page: modal, dropdown, popover, tooltip, chip, banner |',
    );
    expect(md).toContain(
      '| `bg-surface-raised` | \u26d4\ufe0f 2.1 | \u26d4\ufe0f 30.9 | raised: cards, panels, sticky headers |',
    );
    expect(md).toContain(
      '\u2705 identical (up to 0.5), \u26a0\ufe0f acceptable (up to 2), \u26d4\ufe0f far.',
    );
    // one checkbox per file: its path, a link that opens it, then its lines;
    // parentheses escaped in the target
    expect(md).toMatch(
      new RegExp(`- \\[ \\] ${row('./a.tsx', 'src/a.tsx').source}\\\\\\n  Occurrences \\[L3\\]`),
    );
    expect(md).toMatch(row('./(pages)/b.tsx', 'src/%28pages%29/b.tsx'));
    expect(md).toContain('Occurrences [L3](src/a.tsx#L3)');
    expect(md).toContain('Occurrences [L9](src/%28pages%29/b.tsx#L9)');
  });

  it('lists suggestions apart, with what they become', () => {
    expect(md).toContain('| `bg-tone-neutral-09` | `bg-wash-base` | exact | 1 |');
    expect(md).not.toContain('### `bg-tone-neutral-09`');
  });

  it('writes a checklist per file and folds the automatic changes', () => {
    expect(md).toMatch(new RegExp(`### ${row('./a.tsx', 'src/a.tsx').source}`));
    expect(md).toContain(
      '- [ ] [L3](src/a.tsx#L3) `bg-tone-neutral-seed`, [seed as a background](#decision-1)',
    );
    expect(md).toContain(
      '- [ ] [L4](src/a.tsx#L4) `bg-tone-neutral-09` -> `bg-wash-base` (suggested (exact), see Suggestions)',
    );
    expect(md).toContain('<details><summary>Would be applied automatically (1)</summary>');
    expect(md).toContain(
      '- [L5](src/a.tsx#L5) `rounded-md` -> `rounded-2xs`: rename utility class',
    );
  });

  it('lists the occurrences of a token in one file once, in line order', () => {
    const twice: Report = {
      ...report,
      files: [
        {
          ...report.files[1]!,
          findings: [12, 4, 12].map((line) => ({ ...report.files[1]!.findings[0]!, line })),
        },
      ],
    };
    const out = renderMarkdown(twice, { baseDir: '/repo', cwd: '/repo' });
    expect(out).toContain(
      'Occurrences [L4](src/%28pages%29/b.tsx#L4) [L12](src/%28pages%29/b.tsx#L12)\n',
    );
    expect(
      out.match(new RegExp(`- \\[ \\] ${row('./b.tsx', 'src/%28pages%29/b.tsx').source}`, 'g')),
    ).toHaveLength(1);
  });

  it('escapes HTML in the path of a file row', () => {
    const odd: Report = {
      ...report,
      files: [{ ...report.files[1]!, file: '/repo/src/<x>&y.tsx' }],
    };
    expect(renderMarkdown(odd, { baseDir: '/repo', cwd: '/repo' })).toContain(
      '">./&lt;x&gt;&amp;y.tsx</code>',
    );
  });

  it('marks the dE figures against the given thresholds', () => {
    const out = renderMarkdown(report, {
      baseDir: '/repo',
      cwd: '/repo',
      thresholds: { exact: 1, near: 3 },
    });
    expect(out).toContain('| `bg-surface-raised` | \u26a0\ufe0f 2.1 | \u26d4\ufe0f 30.9 |');
  });

  it('batches the places of a decision under what the markup points at', () => {
    const [a, b] = report.files;
    const hinted: Report = {
      ...report,
      files: [
        {
          ...a!,
          findings: a!.findings.map((f) =>
            f.reason === 'seed as a background'
              ? {
                  ...f,
                  context: 'on `<div>` inside `<MdsModal>`',
                  hint: {
                    value: 'bg-surface-overlay',
                    why: 'inside `<MdsModal>`',
                    light: 0,
                    dark: 40.9,
                  },
                }
              : f,
          ),
        },
        b!,
      ],
    };
    const out = renderMarkdown(hinted, { baseDir: '/repo', cwd: '/repo' });
    const likely = out.indexOf(
      '**Likely `bg-surface-overlay`** \u2705 0.0 (1): inside `<MdsModal>`',
    );
    const none = out.indexOf('**No hint** (1)');
    expect(likely).toBeGreaterThan(-1);
    expect(none).toBeGreaterThan(likely);
    expect(
      out.indexOf(
        'Occurrences [L3](src/a.tsx#L3) on `<div>` inside `<MdsModal>` it could be a `bg-surface-overlay` \u2705 0.0',
      ),
    ).toBeGreaterThan(likely);
    expect(out.indexOf('Occurrences [L9](src/%28pages%29/b.tsx#L9)')).toBeGreaterThan(none);
    expect(out).toContain(
      '[seed as a background](#decision-1): `bg-surface-overlay` / `bg-surface-raised` - on `<div>` inside `<MdsModal>` it could be a `bg-surface-overlay` \u2705 0.0',
    );
  });

  it('prints the context of every occurrence, one per line when there are several', () => {
    const [a] = report.files;
    const seed = a!.findings[0]!;
    const placed: Report = {
      ...report,
      files: [
        {
          ...a!,
          findings: [
            { ...seed, context: 'on `<div>` inside `<MdsModal>`' },
            { ...seed, line: 7, context: 'on `<Section>`' },
          ],
        },
      ],
    };
    const out = renderMarkdown(placed, { baseDir: '/repo', cwd: '/repo' });
    expect(out).toContain(
      '  Occurrences\\\n  [L3](src/a.tsx#L3) on `<div>` inside `<MdsModal>`\\\n  [L7](src/a.tsx#L7) on `<Section>`\n',
    );
    expect(out).toContain(
      '- [ ] [L7](src/a.tsx#L7) `bg-tone-neutral-seed`, [seed as a background](#decision-1)',
    );
    expect(out).toContain(' - on `<Section>`');

    const single = renderMarkdown(
      { ...placed, files: [{ ...a!, findings: [{ ...seed, context: 'on `<body>`' }] }] },
      { baseDir: '/repo', cwd: '/repo' },
    );
    expect(single).toContain('  Occurrences [L3](src/a.tsx#L3) on `<body>`\n');
  });

  it('keeps a plain checklist when no place has a hint', () => {
    expect(md).not.toContain('**Likely');
    expect(md).not.toContain('**No hint**');
  });

  it('repeats the run notes', () => {
    expect(md).toContain('> **Note:** import semantic.css');
  });
});

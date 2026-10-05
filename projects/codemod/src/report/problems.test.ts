import { renderProblems } from './problems.js';
import { type Report } from './types.js';

const report: Report = {
  fromVersion: '1.12.0',
  toVersion: '2.0.0',
  dryRun: true,
  summary: {
    filesScanned: 1,
    filesChanged: 1,
    changes: 1,
    warnings: 0,
    flags: 1,
    dynamic: 1,
    errors: 0,
  },
  files: [
    {
      file: '/repo/src/(pages)/a.tsx',
      surface: 'react',
      changed: true,
      findings: [
        {
          kind: 'dynamic',
          surface: 'react',
          file: '/repo/src/(pages)/a.tsx',
          line: 3,
          column: 21,
          message: 'seed',
          token: 'bg-tone-neutral-seed',
          reason: 'seed as a background',
          alternatives: [
            { value: 'bg-surface-overlay', light: 0, dark: 40.9 },
            { value: 'bg-surface-raised', light: 2.1, dark: 30.9 },
          ],
          context: 'on `<div>` inside `<MdsModal>`',
          hint: { value: 'bg-surface-overlay', why: 'inside `<MdsModal>`', light: 0, dark: 40.9 },
        },
        {
          kind: 'flag',
          surface: 'react',
          file: '/repo/src/(pages)/a.tsx',
          line: 4,
          message: 'needs a look,\n  over two lines',
        },
        {
          kind: 'change',
          surface: 'react',
          file: '/repo/src/(pages)/a.tsx',
          line: 5,
          message: 'rename utility class',
        },
      ],
    },
  ],
};

/** The pattern of the VS Code problem matcher documented in problems.ts and the README. */
const MATCHER = /^(.+?):(\d+):(\d+): (error|warning|info): (.*)$/;

describe('renderProblems', () => {
  const lines = renderProblems(report, {
    cwd: '/repo',
    errors: [{ file: '/repo/src/b.html', message: 'Unexpected token' }],
  }).split('\n');

  it('writes one location line per place left to decide, relative to the workspace', () => {
    expect(lines).toEqual([
      'src/(pages)/a.tsx:3:21: warning: `bg-tone-neutral-seed`, seed as a background: `bg-surface-overlay` / `bg-surface-raised`; on `<div>` inside `<MdsModal>` it could be a `bg-surface-overlay` (dE 0.0)',
      'src/(pages)/a.tsx:4:1: info: needs a look, over two lines',
      'src/b.html:1:1: error: Unexpected token',
    ]);
  });

  it('matches the documented problem matcher on every line', () => {
    for (const line of lines) expect(line).toMatch(MATCHER);
    expect(MATCHER.exec(lines[0]!)?.slice(1, 5)).toEqual([
      'src/(pages)/a.tsx',
      '3',
      '21',
      'warning',
    ]);
  });
});

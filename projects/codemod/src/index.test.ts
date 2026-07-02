import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectFiles, routeFile, runMigration } from './index.js';

describe('routeFile', () => {
  it('routes by extension in auto mode', () => {
    expect(routeFile('a.css', 'auto')?.surface).toBe('css');
    expect(routeFile('a.scss', 'auto')?.surface).toBe('css');
    expect(routeFile('a.tsx', 'auto')?.surface).toBe('react');
    expect(routeFile('a.ts', 'auto')?.surface).toBe('angular'); // inline templates
    expect(routeFile('a.html', 'auto')?.surface).toBe('html');
    expect(routeFile('a.md', 'auto')).toBeNull();
  });

  it('forces the surface when a framework is given', () => {
    expect(routeFile('a.html', 'angular')?.surface).toBe('angular');
    expect(routeFile('a.ts', 'angular')?.surface).toBe('angular');
    expect(routeFile('a.html', 'html')?.surface).toBe('html');
  });
});

describe('runMigration (dry-run over a temp tree)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'magma-codemods-'));

  beforeAll(() => {
    mkdirSync(join(dir, 'node_modules', 'pkg'), { recursive: true });
    writeFileSync(join(dir, 'page.html'), '<mds-button tone="ghost">Save</mds-button>');
    writeFileSync(join(dir, 'theme.css'), '.a { --mds-button-border-color: #fff; }');
    writeFileSync(join(dir, 'node_modules', 'pkg', 'skip.html'), '<mds-button>nope</mds-button>');
  });

  it('scans relevant files, ignores node_modules, and does not write in dry-run', async () => {
    const { report } = await runMigration({ paths: [dir], framework: 'auto' });
    expect(report.dryRun).toBe(true);
    expect(report.summary.filesChanged).toBe(2); // page.html + theme.css
    // node_modules content is ignored
    expect(report.files.every((f) => !f.file.includes('node_modules'))).toBe(true);
    // dry-run leaves files on disk untouched
    expect(readFileSync(join(dir, 'page.html'), 'utf8')).toBe(
      '<mds-button tone="ghost">Save</mds-button>',
    );
  });

  it('writes a JSON report when requested', async () => {
    const reportPath = join(dir, 'report.json');
    await runMigration({ paths: [dir], framework: 'auto', reportPath });
    const json = JSON.parse(readFileSync(reportPath, 'utf8'));
    expect(json.summary.filesChanged).toBeGreaterThanOrEqual(2);
  });

  it('applies changes with write: true', async () => {
    const wdir = mkdtempSync(join(tmpdir(), 'magma-codemods-w-'));
    writeFileSync(join(wdir, 'page.html'), '<mds-button>Save</mds-button>');
    await runMigration({ paths: [wdir], framework: 'auto', write: true, force: true });
    expect(readFileSync(join(wdir, 'page.html'), 'utf8')).toBe(
      '<mds-button label="Save"></mds-button>',
    );
  });

  it('collectFiles expands directories and honours ignore', async () => {
    const files = await collectFiles([dir], dir, []);
    expect(files.some((f) => f.endsWith('page.html'))).toBe(true);
    expect(files.some((f) => f.includes('node_modules'))).toBe(false);
  });
});

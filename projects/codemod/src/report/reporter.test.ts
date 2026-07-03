import { Reporter, exitCode } from './reporter.js';
import { type Finding } from './types.js';

const finding = (kind: Finding['kind']): Finding => ({
  kind,
  surface: 'html',
  file: 'a.html',
  message: 'm',
});

describe('Reporter.build', () => {
  it('counts findings by kind and tracks changed files', () => {
    const reporter = new Reporter({ fromVersion: '1', toVersion: '2', dryRun: true });
    reporter.addFile({
      file: 'a.html',
      surface: 'html',
      changed: true,
      findings: [
        finding('change'),
        finding('change'),
        finding('warn'),
        finding('flag'),
        finding('dynamic'),
      ],
    });
    reporter.addFile({ file: 'b.html', surface: 'html', changed: false, findings: [] });

    const report = reporter.build();
    expect(report.summary).toMatchObject({
      filesScanned: 2,
      filesChanged: 1,
      changes: 2,
      warnings: 1,
      flags: 1,
      dynamic: 1,
      errors: 0,
    });
    expect(exitCode(report)).toBe(0);
  });

  it('reports parse errors and returns exit code 2', () => {
    const reporter = new Reporter({ fromVersion: '1', toVersion: '2', dryRun: true });
    reporter.addError({ file: 'bad.html', surface: 'html', message: 'boom' });
    const report = reporter.build();
    expect(report.summary.errors).toBe(1);
    expect(report.summary.filesScanned).toBe(1);
    expect(exitCode(report)).toBe(2);
  });
});

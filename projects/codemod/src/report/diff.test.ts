import { unifiedDiff } from './diff.js';

describe('unifiedDiff', () => {
  it('returns empty string for identical content', () => {
    expect(unifiedDiff('f', 'a\nb\n', 'a\nb\n')).toBe('');
  });

  it('emits a hunk with context, file headers and -/+ lines', () => {
    const diff = unifiedDiff('foo.html', 'a\nb\nc', 'a\nB\nc');
    expect(diff).toContain('--- a/foo.html');
    expect(diff).toContain('+++ b/foo.html');
    expect(diff).toMatch(/@@ -\d+,\d+ \+\d+,\d+ @@/);
    expect(diff).toContain('-b');
    expect(diff).toContain('+B');
    expect(diff).toContain(' a');
    expect(diff).toContain(' c');
  });

  it('handles pure additions and deletions', () => {
    expect(unifiedDiff('f', 'a\nc', 'a\nb\nc')).toContain('+b');
    expect(unifiedDiff('f', 'a\nb\nc', 'a\nc')).toContain('-b');
  });
});

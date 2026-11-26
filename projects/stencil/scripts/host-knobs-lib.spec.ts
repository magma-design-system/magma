import { describe, expect, it } from 'vitest';
import { componentOfSheet, countBySheet, lowerPending } from './host-knobs-lib';

describe('host-knobs-lib', () => {
  it('counts the reports of each sheet', () => {
    const problems = [
      { line: 1, sheet: 'mds-a/mds-a.css', text: 'x' },
      { line: 2, sheet: 'mds-a/mds-a.css', text: 'y' },
      { line: 3, sheet: 'mds-a/css/mds-a-size.css', text: 'z' },
    ];

    expect(countBySheet(problems)).toEqual({ 'mds-a/css/mds-a-size.css': 1, 'mds-a/mds-a.css': 2 });
  });

  it('lowers the baseline, never raises it, never adds a sheet and drops the sheets at 0', () => {
    const pending = { 'mds-b/mds-b.css': 3, 'mds-a/mds-a.css': 5, 'mds-c/mds-c.css': 2 };
    const counts = { 'mds-a/mds-a.css': 7, 'mds-b/mds-b.css': 1, 'mds-d/mds-d.css': 4 };

    expect(lowerPending(pending, counts)).toEqual({ 'mds-a/mds-a.css': 5, 'mds-b/mds-b.css': 1 });
    expect(Object.keys(lowerPending(pending, counts))).toEqual([
      'mds-a/mds-a.css',
      'mds-b/mds-b.css',
    ]);
  });

  it('names the component of a sheet', () => {
    expect(componentOfSheet('mds-a-item/css/mds-a-item-size.css')).toBe('mds-a-item');
  });
});

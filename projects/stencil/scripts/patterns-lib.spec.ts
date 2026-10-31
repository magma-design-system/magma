import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { formatErrors, listPatterns, parsePatternFile } from '../../lint/src/core/patterns';
import {
  FOUNDATION_TEMPLATE,
  TEMPLATE,
  fromTemplate,
  readPatterns,
  renderList,
  titleOf,
} from './patterns-lib';

describe('the template of a new pattern', () => {
  const text = fromTemplate(readFileSync(TEMPLATE, 'utf8'), {
    id: 'bulk-actions',
    title: titleOf('bulk-actions'),
    group: 'data',
    need: 'The person acts on several items of a list at once.',
    date: '2026-10-28',
  });

  it('fills every placeholder', () => {
    expect(titleOf('bulk-actions')).toBe('Bulk actions');
    expect(text).not.toMatch(/\{\{/);
    expect(text).toContain(
      '| 2026-10-28 | Draft | The person acts on several items of a list at once. |',
    );
  });

  it('is a draft the check reads, and says what is still missing', () => {
    const file = parsePatternFile(text, 'bulk-actions.md');
    expect(file.data).toMatchObject({ id: 'bulk-actions', status: 'draft', group: 'data' });
    // only the answers are missing, never a field the template got wrong
    expect(formatErrors(file)).toEqual([
      'principle is required, as text',
      'variables is required: what decides the case',
    ]);
  });
});

describe('the template of a new domain of Foundation', () => {
  const text = fromTemplate(readFileSync(FOUNDATION_TEMPLATE, 'utf8'), {
    id: 'motion',
    title: titleOf('motion'),
    group: '',
    need: 'Move what changes, so the person follows it.',
    date: '2026-10-31',
  });

  it('is a draft with no group, and the check says only what is still missing', () => {
    expect(text).not.toMatch(/\{\{/);
    const file = parsePatternFile(text, 'motion.md');
    expect(file.data).toMatchObject({ id: 'motion', kind: 'foundation', status: 'draft' });
    expect(file.data).not.toHaveProperty('group');
    expect(formatErrors(file)).toEqual([
      'principle is required, as text',
      'variables is required: what decides the case',
    ]);
  });
});

describe('renderList', () => {
  const entries = listPatterns(readPatterns().map((one) => one.data));

  it('lists the domains of Foundation first, then the patterns by group, with their status', () => {
    const text = renderList(entries);
    expect(text).toMatch(/^Foundation\n {2}rhythm +decided +Rhythm\n/);
    expect(text.indexOf('Foundation\n')).toBeLessThan(text.indexOf('Data\n'));
    expect(text).toMatch(
      /Messages and states\n(.*\n)* {2}message-placement +decided +Where a message goes\n/,
    );
    expect(text).toMatch(/\d+ pattern\(s\) and \d+ domain\(s\) of Foundation, \d+ decided\.\n$/);
  });

  it('filters by kind, group, status and validation', () => {
    expect(renderList(entries, { kind: 'foundation' })).toMatch(/^Foundation\n/);
    expect(renderList(entries, { kind: 'pattern' })).not.toContain('rhythm');
    expect(renderList(entries, { status: 'decided' })).not.toContain('candidate');
    expect(renderList(entries, { group: 'input' })).toMatch(/^Input\n/);
    expect(renderList(entries, { group: 'ai' })).toBe('No pattern matches.\n');
    expect(renderList(entries, { notValidated: true })).toContain('message-placement');
  });
});

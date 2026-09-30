import { isISO8601Date, sanitizeISO8601Date } from '@common/date';

describe('isISO8601Date', () => {
  it('accepts ISO 8601 dates with optional components', () => {
    expect(isISO8601Date('2026')).toBe(true);
    expect(isISO8601Date('2026-06')).toBe(true);
    expect(isISO8601Date('2026-06-08')).toBe(true);
    expect(isISO8601Date('2026-06-08T10:30')).toBe(true);
    expect(isISO8601Date('2026-06-08T10:30:00.000Z')).toBe(true);
    expect(isISO8601Date('2026-06-08T10:30:00+02:00')).toBe(true);
  });

  it('rejects other formats', () => {
    expect(isISO8601Date('08/06/2026')).toBe(false);
    expect(isISO8601Date('Mon, 08 Jun 2026 10:30:00 GMT')).toBe(false);
    expect(isISO8601Date('invalid-date')).toBe(false);
    expect(isISO8601Date('')).toBe(false);
  });
});

describe('sanitizeISO8601Date', () => {
  it('returns an ISO 8601 date as it is', () => {
    expect(sanitizeISO8601Date('2026-06-08')).toBe('2026-06-08');
    expect(sanitizeISO8601Date('2026-06-08T10:30:00.000Z')).toBe('2026-06-08T10:30:00.000Z');
  });

  it('converts a parsable date in another format to ISO 8601', () => {
    expect(sanitizeISO8601Date('Mon, 08 Jun 2026 10:30:00 GMT')).toBe('2026-06-08T10:30:00.000Z');
  });

  it('returns null when the string is not a date', () => {
    expect(sanitizeISO8601Date('invalid-date')).toBeNull();
    expect(sanitizeISO8601Date('')).toBeNull();
  });
});

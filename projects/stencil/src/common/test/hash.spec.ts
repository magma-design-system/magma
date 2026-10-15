import { fnv1a } from '@common/hash';

describe('fnv1a', () => {
  it('matches the 32-bit FNV-1a reference vectors', () => {
    expect(fnv1a('')).toBe('811c9dc5');
    expect(fnv1a('a')).toBe('e40c292c');
    expect(fnv1a('foobar')).toBe('bf9cf968');
  });

  it('is stable for the same text and differs between texts', () => {
    expect(fnv1a('report.pdf')).toBe('9ba50147');
    expect(fnv1a('report.pdf')).toMatch(/^[0-9a-f]{8}$/);
    expect(fnv1a('report.PDF')).not.toBe(fnv1a('report.pdf'));
    expect(fnv1a('relazione-città.pdf')).not.toBe(fnv1a('relazione-citta.pdf'));
  });
});

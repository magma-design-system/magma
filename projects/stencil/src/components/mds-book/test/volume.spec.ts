import { boardVolume, isPageCount, pageCount } from '../meta/volume';
import { bookWidth } from '../meta/format';

describe('pageCount', () => {
  it('draws the pages it is given, whole', () => {
    expect(pageCount(1000)).toBe(1000);
    expect(pageCount(299.6)).toBe(300);
  });

  it('keeps a value within a sheet and a brick', () => {
    expect(pageCount(1)).toBe(4);
    expect(pageCount(100000)).toBe(3000);
  });

  it('draws 300 pages without a value, or with one that is not a number of pages', () => {
    for (const pages of [undefined, null, 0, -12, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(pageCount(pages)).toBe(300);
    }
  });
});

describe('isPageCount', () => {
  it('accepts a positive number, or no value', () => {
    for (const pages of [undefined, null, 1, 300, 1000]) expect(isPageCount(pages)).toBe(true);
  });

  it('rejects anything else', () => {
    for (const pages of [0, -12, Number.NaN]) expect(isPageCount(pages)).toBe(false);
  });
});

describe('boardVolume', () => {
  it('gives only a hardcover boards, 2.5 mm thick and 3 mm over the pages', () => {
    expect(boardVolume(17, false)).toEqual({ board: 0, square: 0 });
    expect(boardVolume(17, true).board * 17).toBeCloseTo(0.25, 6);
    expect(boardVolume(17, true).square * 17).toBeCloseTo(0.3, 6);
  });

  it('measures them against the width of the format', () => {
    expect(boardVolume(21, true).board).toBeLessThan(boardVolume(17, true).board);
  });
});

describe('bookWidth', () => {
  it('measures the book on the width of its format, or on 17 cm for auto', () => {
    expect(bookWidth('a4')).toBe(21);
    expect(bookWidth('24x17')).toBe(24);
    expect(bookWidth('auto')).toBe(17);
    expect(bookWidth('pocket')).toBe(17);
  });
});

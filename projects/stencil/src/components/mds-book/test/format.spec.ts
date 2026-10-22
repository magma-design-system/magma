import { bookFormatRatio, cssUrl, isBookFormat } from '../meta/format';

describe('bookFormatRatio', () => {
  it('leaves auto, and no value, to the image', () => {
    expect(bookFormatRatio('auto')).toBeUndefined();
    expect(bookFormatRatio('')).toBeUndefined();
    expect(bookFormatRatio(undefined)).toBeUndefined();
    expect(bookFormatRatio(null)).toBeUndefined();
  });

  it('gives the named formats their ISO proportions, portrait', () => {
    expect(bookFormatRatio('a4')).toBeCloseTo(21 / 29.7, 6);
    expect(bookFormatRatio('a5')).toBeCloseTo(14.8 / 21, 6);
    expect(bookFormatRatio('b5')).toBeCloseTo(17.6 / 25, 6);
  });

  it('reads WxH in centimetres, with decimals, in both orientations', () => {
    expect(bookFormatRatio('17x24')).toBeCloseTo(17 / 24, 6);
    expect(bookFormatRatio('24x17')).toBeCloseTo(24 / 17, 6);
    expect(bookFormatRatio('29.7x21')).toBeCloseTo(29.7 / 21, 6);
    expect(bookFormatRatio('21x21')).toBe(1);
  });

  it('forgives the case and the spaces around the value', () => {
    expect(bookFormatRatio(' A4 ')).toBeCloseTo(21 / 29.7, 6);
    expect(bookFormatRatio('17X24')).toBeCloseTo(17 / 24, 6);
  });

  it('is no format for anything else', () => {
    for (const value of [
      'pocket',
      '17 x 24',
      '17x',
      'x24',
      '0x24',
      '17x0',
      '-17x24',
      '17x24x3',
      'constructor',
      '__proto__',
    ]) {
      expect(bookFormatRatio(value)).toBeUndefined();
    }
  });
});

describe('isBookFormat', () => {
  it('accepts auto, no value, the named formats and WxH', () => {
    for (const value of ['auto', '', undefined, 'a4', 'b5', '17x24', '29.7x21']) {
      expect(isBookFormat(value)).toBe(true);
    }
  });

  it('rejects anything else', () => {
    for (const value of ['pocket', 'a3', '17 x 24', '0x0']) {
      expect(isBookFormat(value)).toBe(false);
    }
  });
});

describe('cssUrl', () => {
  it('quotes the path, so spaces and parentheses stay inside it', () => {
    expect(cssUrl('/covers/agenda (2027).webp')).toBe('url("/covers/agenda (2027).webp")');
  });

  it('escapes the quotes and the backslashes that would end it', () => {
    expect(cssUrl('/covers/"x"\\y.webp')).toBe('url("/covers/\\"x\\"\\\\y.webp")');
  });

  it('drops the line breaks a quoted url cannot hold', () => {
    expect(cssUrl('/covers/a\nb.webp')).toBe('url("/covers/ab.webp")');
  });
});

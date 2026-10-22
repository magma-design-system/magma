/**
 * Width and height in centimetres of the named formats, always portrait: a landscape one is
 * written as `WxH` with the width first (`29.7x21`)
 */
const namedFormats: Record<string, readonly [number, number]> = {
  a4: [21, 29.7],
  a5: [14.8, 21],
  b5: [17.6, 25],
};

/**
 * 17x24, the most common format of Maggioli Editore: the shape of the book before its image
 * loads, and without one
 */
const defaultBookRatio = 17 / 24;

const sizePattern = /^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)$/;

const normalize = (format?: string | null): string => (format ?? '').trim().toLowerCase();

/**
 * The width and height of a format, in centimetres. `undefined` for `auto`, which takes the
 * proportions of the image, and for a value that is not a format, which falls back on `auto`
 */
const bookFormatSize = (format?: string | null): readonly [number, number] | undefined => {
  const value = normalize(format);
  if (Object.prototype.hasOwnProperty.call(namedFormats, value)) return namedFormats[value];
  const match = sizePattern.exec(value);
  if (match === null) return undefined;
  const width = Number(match[1]);
  const height = Number(match[2]);
  return width > 0 && height > 0 ? [width, height] : undefined;
};

/**
 * The proportions (width / height) of a format. `undefined` for `auto`, which takes the
 * proportions of the image, and for a value that is not a format, which falls back on `auto`
 */
const bookFormatRatio = (format?: string | null): number | undefined => {
  const size = bookFormatSize(format);
  return size === undefined ? undefined : size[0] / size[1];
};

/**
 * The width of the book, in centimetres, what its depth is measured against: the width of its
 * format, or 17 cm, the width of the most common format, for `auto`
 */
const bookWidth = (format?: string | null): number => bookFormatSize(format)?.[0] ?? 17;

/**
 * Whether the value is one `format` accepts: `auto` (or no value), a named format or `WxH`
 */
const isBookFormat = (format?: string | null): boolean => {
  const value = normalize(format);
  return value === '' || value === 'auto' || bookFormatRatio(value) !== undefined;
};

/**
 * The image as a CSS `url()`, quoted, so a path with spaces, parentheses or quotes stays one
 * value in the custom property it is written into
 */
const cssUrl = (url: string): string =>
  `url("${url.replace(/[\\"]/g, '\\$&').replace(/[\n\r\f]/g, '')}")`;

export { bookFormatRatio, bookFormatSize, bookWidth, cssUrl, defaultBookRatio, isBookFormat };

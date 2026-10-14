/*
  Value shapes of the Design Tokens Community Group format, version 2025.10
  (https://www.designtokens.org/TR/2025.10/format/), and the conversions from the CSS
  values Magma publishes. Pure: no file access, so the tests can check each one.
*/

export interface DtcgColor {
  colorSpace: 'srgb';
  components: [number, number, number];
  alpha?: number;
  hex: string;
}

export interface DtcgDimension {
  value: number;
  /** DTCG 2025.10 allows only these two units. */
  unit: 'px' | 'rem';
}

export interface DtcgDuration {
  value: number;
  unit: 'ms' | 's';
}

export interface DtcgShadowLayer {
  color: DtcgColor;
  offsetX: DtcgDimension;
  offsetY: DtcgDimension;
  blur: DtcgDimension;
  spread: DtcgDimension;
  inset?: boolean;
}

/**
 * Four decimals: enough for every value Magma publishes, and stable in diffs. A value
 * the export derives (a product, a ratio) takes six, so it stays exact at the pixel.
 */
export const round = (value: number, digits = 4): number => Number(value.toFixed(digits));

/** `#rrggbb` (any case) as a DTCG sRGB color. */
export const hexColor = (hex: string, alpha?: number): DtcgColor => {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) throw new Error(`Not a 6-digit hex color: ${hex}`);
  const channels = match.slice(1).map((pair) => parseInt(pair, 16));
  return rgbColor(channels as [number, number, number], alpha);
};

/** 0-255 channels as a DTCG sRGB color, with the hex fallback the format allows. */
export const rgbColor = (channels: [number, number, number], alpha?: number): DtcgColor => {
  const hex = `#${channels.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
  const color: DtcgColor = {
    colorSpace: 'srgb',
    components: channels.map((c) => round(c / 255)) as [number, number, number],
    hex,
  };
  if (alpha !== undefined && alpha !== 1) color.alpha = alpha;
  return color;
};

/** The 0-255 channels of a DTCG sRGB color: what `--x: r g b` holds in the CSS. */
export const colorChannels = (color: DtcgColor): [number, number, number] =>
  color.components.map((c) => Math.round(c * 255)) as [number, number, number];

/** A CSS length in px or rem (`0` alone counts as px). Throws on any other unit. */
export const dimension = (css: string): DtcgDimension => {
  const value = css.trim();
  if (value === '0') return { value: 0, unit: 'px' };
  const match = /^(-?\d*\.?\d+)(px|rem)$/.exec(value);
  if (!match) throw new Error(`Not a px or rem length: ${css}`);
  return { value: Number(match[1]), unit: match[2] as 'px' | 'rem' };
};

/** `75ms` or `0.2s`. */
export const duration = (css: string): DtcgDuration => {
  const match = /^(\d*\.?\d+)(ms|s)$/.exec(css.trim());
  if (!match) throw new Error(`Not a duration: ${css}`);
  return { value: Number(match[1]), unit: match[2] as 'ms' | 's' };
};

/** `cubic-bezier(a, b, c, d)` as the four control-point numbers. */
export const cubicBezier = (css: string): [number, number, number, number] => {
  const match = /^cubic-bezier\(([^)]+)\)$/.exec(css.trim());
  const points = match?.[1].split(',').map((n) => Number(n.trim()));
  if (!points || points.length !== 4 || points.some(Number.isNaN))
    throw new Error(`Not a cubic-bezier(): ${css}`);
  return points as [number, number, number, number];
};

/** A CSS aspect ratio `w/h` as the number it stands for. */
export const ratio = (css: string): number => {
  const [width, height] = css.split('/').map(Number);
  if (!width || !height) throw new Error(`Not a w/h ratio: ${css}`);
  return width / height;
};

/** Split on the commas that are not inside parentheses. */
const splitTopLevel = (value: string): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of value) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else current += char;
  }
  parts.push(current.trim());
  return parts;
};

/**
 * A CSS `box-shadow` as DTCG shadow layers. Accepts the forms Magma writes: the color
 * first or last, `inset`, two to four lengths, and colors as `rgb(r g b / a)`.
 * `channels` resolves a color written as `rgb(var(--name) / a)`: it receives the
 * custom property name and returns its `r g b` channels in the mode being built.
 */
export const shadow = (
  css: string,
  channels: (name: string) => [number, number, number],
): DtcgShadowLayer[] =>
  splitTopLevel(css).map((layer) => {
    const color = /rgba?\(([^()]*(?:\([^()]*\))?[^()]*)\)/.exec(layer);
    if (!color) throw new Error(`Shadow layer without an rgb() color: ${layer}`);
    const words = layer.replace(color[0], ' ').trim().split(/\s+/);
    const inset = words[0] === 'inset' || words[words.length - 1] === 'inset';
    const lengths = words.filter((word) => word !== 'inset').map(dimension);
    if (lengths.length < 2 || lengths.length > 4)
      throw new Error(`Shadow layer needs 2 to 4 lengths: ${layer}`);
    const zero: DtcgDimension = { value: 0, unit: 'px' };
    const out: DtcgShadowLayer = {
      color: shadowColor(color[1], channels),
      offsetX: lengths[0],
      offsetY: lengths[1],
      blur: lengths[2] ?? zero,
      spread: lengths[3] ?? zero,
    };
    if (inset) out.inset = true;
    return out;
  });

/** The inside of `rgb(...)`: `r g b / a`, `r, g, b`, or `var(--name) / a`. */
const shadowColor = (
  inside: string,
  channels: (name: string) => [number, number, number],
): DtcgColor => {
  const [rgb, alpha] = inside.split('/').map((part) => part.trim());
  const variable = /^var\((--[a-z0-9-]+)\)$/.exec(rgb);
  const values = variable
    ? channels(variable[1])
    : (rgb.split(/[\s,]+/).map(Number) as [number, number, number]);
  return rgbColor(values, alpha === undefined ? undefined : Number(alpha));
};

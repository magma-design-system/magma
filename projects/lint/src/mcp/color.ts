/*
  The colour arithmetic of suggest_role: parsing a CSS colour to sRGB, and the distance of two
  colours in OKLab, the space where equal distances look equally different
  (https://bottosson.github.io/posts/oklab/).
*/

/** sRGB channels, 0..1. */
export type Rgb = [number, number, number];

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const channel = (token: string, scale = 255): number =>
  token.endsWith('%') ? Number.parseFloat(token) / 100 : Number.parseFloat(token) / scale;

/** `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`: the alpha is dropped. */
const fromHex = (hex: string): Rgb | undefined => {
  let digits = hex.slice(1);
  if (digits.length === 3 || digits.length === 4)
    digits = [...digits.slice(0, 3)].map((digit) => digit + digit).join('');
  if (digits.length !== 6 && digits.length !== 8) return undefined;
  const value = (index: number) => Number.parseInt(digits.slice(index, index + 2), 16) / 255;
  return [value(0), value(2), value(4)];
};

const fromHsl = (h: number, s: number, l: number): Rgb => {
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
};

const linear = (value: number) =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
const gamma = (value: number) =>
  value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;

/** OKLab of an sRGB colour. */
export const toOklab = ([r, g, b]: Rgb): Rgb => {
  const [lr, lg, lb] = [linear(r), linear(g), linear(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

const fromOklab = ([L, a, b]: Rgb): Rgb => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    clamp(gamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)),
    clamp(gamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)),
    clamp(gamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)),
  ];
};

/**
 * A CSS colour written as a literal: hex, `rgb()`, `hsl()`, `oklch()`; the channel triplet
 * Magma publishes (`5 5 5`) too. Undefined for anything else.
 */
export const parseColor = (input: string): Rgb | undefined => {
  const text = input.trim().toLowerCase();
  if (/^#[0-9a-f]+$/.test(text)) return fromHex(text);
  const call = /^([a-z]+)\(([^)]*)\)$/.exec(text);
  const args = (call ? (call[2] ?? '') : text).split(/[\s,/]+/).filter(Boolean);
  if (!call && args.length === 3 && args.every((arg) => /^\d+(\.\d+)?$/.test(arg)))
    return [channel(args[0]!), channel(args[1]!), channel(args[2]!)];
  if (!call) return undefined;
  const name = call[1]!;
  if ((name === 'rgb' || name === 'rgba') && args.length >= 3)
    return [channel(args[0]!), channel(args[1]!), channel(args[2]!)].map(clamp) as Rgb;
  if ((name === 'hsl' || name === 'hsla') && args.length >= 3)
    return fromHsl(
      Number.parseFloat(args[0]!),
      channel(args[1]!.endsWith('%') ? args[1]! : `${args[1]}%`),
      channel(args[2]!.endsWith('%') ? args[2]! : `${args[2]}%`),
    );
  if (name === 'oklch' && args.length >= 3) {
    const L = args[0]!.endsWith('%')
      ? Number.parseFloat(args[0]!) / 100
      : Number.parseFloat(args[0]!);
    const C = Number.parseFloat(args[1]!);
    const H = (Number.parseFloat(args[2]!) * Math.PI) / 180;
    return fromOklab([L, C * Math.cos(H), C * Math.sin(H)]);
  }
  return undefined;
};

/** How different two colours look: the Euclidean distance in OKLab (0 is the same colour). */
export const distance = (one: Rgb, two: Rgb): number => {
  const [a, b] = [toOklab(one), toOklab(two)];
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
};

export const toHex = ([r, g, b]: Rgb): string =>
  `#${[r, g, b]
    .map((value) =>
      Math.round(clamp(value) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;

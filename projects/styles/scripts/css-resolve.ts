import { readFile } from 'fs/promises';
import postcss, { Declaration, Rule } from 'postcss';

/*
  Resolve token references down to literals, at build time. Shared by properties.ts (the
  `initial-value` of the @property registrations) and semantic.ts (the fallback of the
  Tailwind bridge): both need the value a token has on a light page with no preference set.
*/

const MAX_DEPTH = 12;

export type Tokens = Record<string, string>;

/**
 * A selector belongs to the DEFAULT (light) theme when it is not gated on a
 * preference: once every `:not(...)` guard is stripped, at least one comma part is
 * left with no class, attribute or id, i.e. it applies to a bare `:root`. Flipping
 * tokens are declared for light in `:root` and again for dark under
 * `.pref-theme-scheme-dark`; a blind last-wins pass would inline the DARK value as
 * the static initial-value, so a registration would carry a dark default onto a
 * light page.
 */
const selectorIsUnconditional = (selector: string): boolean =>
  selector.split(',').some((part) => {
    const bare = part.replace(/:not\([^)]*\)/g, '').trim();
    return bare.length > 0 && !bare.includes('.') && !bare.includes('[') && !bare.includes('#');
  });

const isDefaultTheme = (decl: Declaration): boolean => {
  let node = decl.parent;
  while (node) {
    if (node.type === 'atrule') {
      return false;
    }
    if (node.type === 'rule' && !selectorIsUnconditional((node as Rule).selector)) {
      return false;
    }
    node = node.parent;
  }
  return true;
};

/**
 * Build a `name -> value` map from the given stylesheets, preferring the value
 * declared for the default theme over any theme or preference variant.
 */
export const lookupFromCss = (sheets: { css: string; from: string }[]): Tokens => {
  const preferred: Tokens = {};
  const anyValue: Tokens = {};
  for (const { css, from } of sheets) {
    const root = postcss.parse(css, { from });
    root.walkDecls((decl) => {
      if (!decl.prop.startsWith('--')) {
        return;
      }
      const value = decl.value.trim();
      if (value.length === 0) {
        return;
      }
      const name = decl.prop.slice(2);
      anyValue[name] = value;
      if (isDefaultTheme(decl)) {
        preferred[name] = value;
      }
    });
  }
  return { ...anyValue, ...preferred };
};

/** {@link lookupFromCss} over stylesheets on disk. */
export const buildLookup = async (files: string[]): Promise<Tokens> =>
  lookupFromCss(
    await Promise.all(
      files.map(async (file) => ({ css: await readFile(file, 'utf8'), from: file })),
    ),
  );

/**
 * Tailwind's `--spacing(n)` helper is not available here (this sheet never goes
 * through Tailwind), so fold it into a literal using the `--spacing` token, the
 * same way Tailwind would: `calc(var(--spacing) * n)`.
 */
export const foldSpacing = (value: string, unit: string): string =>
  value.replace(/--spacing\((\d+(?:\.\d+)?)\)/g, (whole, count: string) => {
    const match = unit.match(/^([\d.]+)(.*)$/);
    if (!match) {
      return whole;
    }
    const folded = parseFloat(match[1]) * parseFloat(count);
    return `${parseFloat(folded.toFixed(6))}${match[2]}`;
  });

/**
 * The `var(...)` starting at `start`, split into its name and its fallback text.
 * Hand-rolled instead of a regex because the chains nest arbitrarily deep
 * (`var(--a, rgb(var(--b)))`) and a regex that balances only one level of parens
 * silently leaves the outer `var()` in place, which then fails resolution.
 */
const readVar = (
  value: string,
  start: number,
): { name: string; fallback: string | null; end: number } | null => {
  if (!/^var\(/i.test(value.slice(start, start + 4))) {
    return null;
  }
  let depth = 0;
  let close = -1;
  for (let i = start + 3; i < value.length; i++) {
    if (value[i] === '(') {
      depth++;
    } else if (value[i] === ')' && --depth === 0) {
      close = i;
      break;
    }
  }
  if (close === -1) {
    return null;
  }
  const inner = value.slice(start + 4, close);
  let depthInner = 0;
  let comma = -1;
  for (let i = 0; i < inner.length; i++) {
    if (inner[i] === '(') {
      depthInner++;
    } else if (inner[i] === ')') {
      depthInner--;
    } else if (inner[i] === ',' && depthInner === 0) {
      comma = i;
      break;
    }
  }
  return {
    name: (comma === -1 ? inner : inner.slice(0, comma)).trim(),
    fallback: comma === -1 ? null : inner.slice(comma + 1).trim(),
    end: close,
  };
};

export const resolve = (value: string, lookup: Tokens, spacingUnit: string, depth = 0): string => {
  if (depth >= MAX_DEPTH) {
    return value;
  }
  const folded = foldSpacing(value, spacingUnit);
  let out = '';
  let i = 0;
  while (i < folded.length) {
    const ref = readVar(folded, i);
    if (ref === null) {
      out += folded[i];
      i += 1;
      continue;
    }
    const token = lookup[ref.name.slice(2)];
    if (token !== undefined) {
      out += resolve(token, lookup, spacingUnit, depth + 1);
    } else if (ref.fallback !== null) {
      out += resolve(ref.fallback, lookup, spacingUnit, depth + 1);
    } else {
      out += folded.slice(i, ref.end + 1);
    }
    i = ref.end + 1;
  }
  return out;
};

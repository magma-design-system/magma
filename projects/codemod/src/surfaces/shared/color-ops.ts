/**
 * Category N (Magma 2 -> 3, #918): a colour custom property holds a full
 * colour, no longer its three channels. Ported from the rewrite that migrated
 * Magma's own sources in #918 (2751 rewrites, no difference in the rendered
 * colours) and scoped to the names Magma publishes as colours
 * (`ColorTokenRule.names`), so a product's own triplet variable stays:
 *
 *   rgb(var(--x))               -> var(--x)
 *   rgb(var(--x) / 1), / 100%   -> var(--x)          (an opaque alpha says nothing once it is a colour)
 *   rgb(var(--x, 1 2 3))        -> var(--x, rgb(1 2 3))           (along the var() fallback chain too)
 *   rgb(var(--x) / 0.15)        -> color-mix(in srgb, var(--x) 15%, transparent)
 *   rgb(var(--x) / var(--a))    -> color-mix(in srgb, var(--x) calc(var(--a) * 100%), transparent)
 *   rgb(var(--x) / calc(E))     -> color-mix(in srgb, var(--x) calc(E * 100%), transparent)
 *   --x: 1 2 3                  -> --x: rgb(1 2 3)
 *
 * Mixing with transparent in srgb scales only the alpha, so each rewrite paints
 * what the triplet painted. Reported, never rewritten: `rgba(var(--x), a)`
 * (the comma syntax around channels, already invalid in Magma 2), an alpha the
 * rewrite cannot read (a Sass variable), a fallback or a definition that may
 * hold channels of the product's own, and a product variable whose fallback
 * is a Magma colour.
 */
import { type ColorTokenRule, type Manifest } from '../../manifest/schema.js';
import { ruleId } from '../../manifest/registry.js';
import { type ClassFinding } from './semantic-ops.js';

export interface ColorRules {
  rule: ColorTokenRule;
  /** `global/colorToken`, for `--only` / `--skip` and the report. */
  id: string;
  names: ReadonlySet<string>;
  /** Cheap probe: does a chunk of source read a colour of the list through `rgb()`? */
  probe: RegExp;
}

/** Tag used for the manifest-global rules, which no component owns. */
const GLOBAL_TAG = 'global';

/**
 * `rgb(` starts a function only when no name character precedes it: not
 * `myrgb(`, not `--x-rgb(`. `_` does not count: a Tailwind arbitrary value
 * writes its spaces as `_` (`shadow-[0_0_0_1px_rgb(...)]`).
 */
const NOT_IN_NAME = '(?<![A-Za-z0-9-])';

const cache = new WeakMap<Manifest, ColorRules | null>();

export const colorRulesOf = (manifest: Manifest): ColorRules | null => {
  if (cache.has(manifest)) return cache.get(manifest)!;
  const rule = manifest.global.colorTokens;
  const rules: ColorRules | null =
    rule && rule.names.length > 0
      ? {
          rule,
          id: ruleId(GLOBAL_TAG, rule),
          names: new Set(rule.names),
          probe: new RegExp(`${NOT_IN_NAME}rgba?\\([\\s_]*var\\([\\s_]*--`, 'i'),
        }
      : null;
  cache.set(manifest, rules);
  return rules;
};

/** Whether `text` reads one of the listed colours through `rgb()` / `rgba()`. */
export const readsColorToken = (rules: ColorRules, text: string): boolean => {
  if (!rules.probe.test(text)) return false;
  for (const m of text.matchAll(
    new RegExp(`${NOT_IN_NAME}rgba?\\([\\s_]*var\\([\\s_]*--([\\w-]+)`, 'gi'),
  ))
    if (rules.names.has(m[1]!)) return true;
  return false;
};

/** Index of the parenthesis closing the one at `open`, or -1. */
const closing = (s: string, open: number): number => {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')' && --depth === 0) return i;
  }
  return -1;
};

/** Split at the first top-level comma. */
const splitComma = (s: string): [string, string | null] => {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')') depth--;
    else if (s[i] === ',' && depth === 0) return [s.slice(0, i), s.slice(i + 1)];
  }
  return [s, null];
};

/** Three channels as a value, space or comma separated: `255 0 0`, `255, 0, 0`, `100% 0% 0%`. */
const CHANNELS = /^-?\d*\.?\d+%?(?:\s*,\s*|\s+)-?\d*\.?\d+%?(?:\s*,\s*|\s+)-?\d*\.?\d+%?$/;

/** A whole `var(...)`: the text starts with `var(` and its parenthesis closes at the end. */
const isWholeVar = (s: string): boolean => /^var\(/i.test(s) && closing(s, 3) === s.length - 1;

/** The custom property a whole `var(...)` reads, without `--`, or null. */
const varName = (varText: string): string | null => {
  const [name] = splitComma(varText.slice(4, -1));
  const trimmed = name.trim();
  return trimmed.startsWith('--') ? trimmed.slice(2) : null;
};

/** A value Sass resolves at compile time: it may hold channels the codemod cannot see. */
const isSassValue = (s: string): boolean => /^(\$|#\{)/.test(s);

/**
 * How generated text is spelled: `css` with the usual spaces, `class` for a
 * Tailwind arbitrary value, whose spaces the caller turns into `_` (so the
 * separators are written without the space after the comma).
 */
export type ColorStyle = 'css' | 'class';

interface Problem {
  kind: 'flag' | 'dynamic';
  message: string;
}

interface Pass {
  rules: ColorRules;
  style: ColorStyle;
  changes: Array<{ before: string; after: string }>;
  problems: Problem[];
}

const comma = (pass: Pass): string => (pass.style === 'class' ? ',' : ', ');

/** An alpha as the percentage `color-mix()` takes, or null when it cannot be read. */
const percentage = (alpha: string): string | null => {
  const a = alpha.trim();
  if (/^-?\d*\.?\d+$/.test(a)) return `${parseFloat((Number(a) * 100).toFixed(4))}%`;
  if (/^\d*\.?\d+%$/.test(a)) return a;
  if (isWholeVar(a)) return `calc(${a} * 100%)`;
  // the placeholder of a Tailwind 3 colour (a JS config), a number at build time:
  // the form the Magma 3 preset writes (design-tokens, js-tailwind-colors)
  if (a === '<alpha-value>') return `calc(${a} * 100%)`;
  const calc = /^calc\((.*)\)$/is.exec(a);
  if (calc && closing(a, 4) === a.length - 1) {
    const inner = calc[1]!.trim();
    // a top-level sum binds looser than the product: keep it grouped
    return /\s[+-]\s/.test(inner) ? `calc((${inner}) * 100%)` : `calc(${inner} * 100%)`;
  }
  return null;
};

/** A `var()` of a listed colour: its fallback chain gets the same treatment. */
const convertVar = (varText: string, pass: Pass): string => {
  const [name, fallback] = splitComma(varText.slice(4, -1));
  if (fallback === null) return `var(${name.trim()})`;
  return `var(${name.trim()}${comma(pass)}${convertFallback(fallback.trim(), pass)})`;
};

const convertFallback = (fallback: string, pass: Pass): string => {
  if (CHANNELS.test(fallback)) return `rgb(${fallback})`;
  if (isWholeVar(fallback)) {
    const name = varName(fallback);
    if (name !== null && pass.rules.names.has(name)) return convertVar(fallback, pass);
    pass.problems.push({
      kind: 'flag',
      message: `the fallback \`${fallback}\` is not a Magma colour: Magma 3 reads it as a colour, so if it holds channels write \`rgb(${fallback})\``,
    });
    return rewriteReads(fallback, pass);
  }
  if (isSassValue(fallback)) {
    pass.problems.push({
      kind: 'flag',
      message: `the fallback \`${fallback}\` is a Sass value: Magma 3 reads it as a colour, so if it holds channels write \`rgb(${fallback})\``,
    });
    return fallback;
  }
  // a colour already (`#fff`, `rgb(1 2 3)`, `transparent`): only its own reads
  return rewriteReads(fallback, pass);
};

const rewriteReads = (src: string, pass: Pass): string => {
  let out = '';
  let i = 0;
  const re = new RegExp(`${NOT_IN_NAME}rgba?\\(`, 'gi');
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const open = m.index + m[0].length - 1;
    const close = closing(src, open);
    if (close === -1) break;
    const whole = src.slice(m.index, close + 1);
    const inner = src.slice(open + 1, close).trim();
    if (!/^var\(/i.test(inner)) continue; // a literal colour
    const varEnd = closing(inner, 3);
    if (varEnd === -1) continue;
    const varText = inner.slice(0, varEnd + 1);
    const rest = inner.slice(varEnd + 1).trim();
    const name = varName(varText);
    if (name === null || !pass.rules.names.has(name)) {
      // a variable of the product: it stays, unless its fallback is a Magma colour
      if (name !== null && readsListed(varText.slice(4), pass.rules))
        pass.problems.push({
          kind: 'dynamic',
          message: `\`${whole}\`: \`--${name}\` is not a Magma colour, but its fallback is one, and Magma 3 makes it a colour: \`rgb()\` around it paints nothing when \`--${name}\` is unset; make \`--${name}\` a colour and read \`${convertVarLoosely(varText, pass)}\``,
        });
      continue;
    }
    let replacement: string | null = null;
    if (rest === '' || /^\/\s*(1(\.0+)?|100%)$/.test(rest)) replacement = convertVar(varText, pass);
    else if (rest.startsWith('/')) {
      const alpha = percentage(rest.slice(1));
      if (alpha === null)
        pass.problems.push({
          kind: 'dynamic',
          message: `\`${whole}\`: the alpha \`${rest.slice(1).trim()}\` cannot be read; write \`color-mix(in srgb, ${convertVar(varText, pass)} <alpha as a percentage>, transparent)\``,
        });
      else
        replacement = `color-mix(in srgb${comma(pass)}${convertVar(varText, pass)} ${alpha}${comma(pass)}transparent)`;
    } else if (rest.startsWith(',')) {
      const alpha = percentage(rest.slice(1));
      pass.problems.push({
        kind: 'dynamic',
        message: `\`${whole}\` mixes the comma syntax with channels and painted nothing in Magma 2 already; in Magma 3 write ${alpha === null ? `\`color-mix(in srgb, var(--${name}) <alpha as a percentage>, transparent)\`` : `\`color-mix(in srgb, var(--${name}) ${alpha}, transparent)\``}`,
      });
    } else
      pass.problems.push({
        kind: 'dynamic',
        message: `\`${whole}\`: not a channel read the codemod knows; Magma 3 reads \`--${name}\` as a colour`,
      });
    if (replacement === null) continue;
    out += src.slice(i, m.index) + replacement;
    i = close + 1;
    re.lastIndex = close + 1;
    pass.changes.push({ before: whole, after: replacement });
  }
  return out + src.slice(i);
};

/** Whether a chunk reads a listed colour with `var()`, anywhere. */
const readsListed = (text: string, rules: ColorRules): boolean => {
  for (const m of text.matchAll(/var\(\s*--([\w-]+)/g)) if (rules.names.has(m[1]!)) return true;
  return false;
};

/** The suggestion for a product variable with a Magma fallback: the same `var()`, fallbacks as colours. */
const convertVarLoosely = (varText: string, pass: Pass): string => {
  const quiet: Pass = { ...pass, changes: [], problems: [] };
  return convertVar(varText, quiet);
};

export interface ColorResult {
  value: string;
  changed: boolean;
}

/** Where a colour finding goes: the surface adds its own surface, file and line. */
export type ColorEmit = (finding: ClassFinding) => void;

const flush = (pass: Pass, emit: ColorEmit, what: string): void => {
  for (const change of pass.changes)
    emit({ kind: 'change', ruleId: pass.rules.id, message: what, ...change });
  for (const problem of pass.problems)
    emit({ kind: problem.kind, ruleId: pass.rules.id, message: problem.message });
};

/** Rewrite every read of a listed colour in a CSS value (or any text that holds one). */
export const rewriteColorReads = (
  value: string,
  rules: ColorRules,
  emit: ColorEmit,
  style: ColorStyle = 'css',
): ColorResult => {
  if (!rules.probe.test(value)) return { value, changed: false };
  const pass: Pass = { rules, style, changes: [], problems: [] };
  const out = rewriteReads(value, pass);
  flush(pass, emit, 'read the colour token as a colour');
  return { value: out, changed: out !== value };
};

/**
 * The value of a definition of a listed colour, `--x: <value>`: channels
 * become `rgb()`, a listed colour's `var()` stays (its fallbacks converted), a
 * colour or a keyword stays; a value that may hold channels of the product's
 * own (another variable, a Sass value) is reported.
 */
export const convertColorDefinition = (
  name: string,
  value: string,
  rules: ColorRules,
  emit: ColorEmit,
  style: ColorStyle = 'css',
): ColorResult => {
  const important = /\s*!important\s*$/i.exec(value);
  const core = important ? value.slice(0, important.index) : value;
  const tail = important ? important[0] : '';
  const trimmed = core.trim();
  const lead = core.slice(0, core.indexOf(trimmed));
  const trail = core.slice(core.indexOf(trimmed) + trimmed.length);
  const wrap = (text: string): ColorResult => {
    const out = `${lead}${text}${trail}${tail}`;
    return { value: out, changed: out !== value };
  };
  if (trimmed === '') return { value, changed: false };
  if (CHANNELS.test(trimmed)) {
    const after = `rgb(${trimmed})`;
    emit({
      kind: 'change',
      ruleId: rules.id,
      message: `write the channels of \`--${name}\` as a colour`,
      before: trimmed,
      after,
    });
    return wrap(after);
  }
  const pass: Pass = { rules, style, changes: [], problems: [] };
  if (isWholeVar(trimmed)) {
    const ref = varName(trimmed);
    if (ref !== null && rules.names.has(ref)) {
      const after = convertVar(trimmed, pass);
      if (after !== trimmed) pass.changes.push({ before: trimmed, after });
      flush(pass, emit, `write the fallback of \`--${name}\` as a colour`);
      return wrap(after);
    }
  }
  if (isWholeVar(trimmed) || isSassValue(trimmed)) {
    emit({
      kind: 'dynamic',
      ruleId: rules.id,
      message: `\`--${name}\` takes a colour in Magma 3, not channels: if \`${trimmed}\` holds channels, write \`rgb(${trimmed})\``,
    });
    return { value, changed: false };
  }
  // a colour (`#fff`, `rgb(...)`, `color-mix(...)`, `transparent`) or a keyword (`inherit`)
  if (/^(#|[a-z-]+\(|[a-z-]+$)/i.test(trimmed)) return { value, changed: false };
  emit({
    kind: 'dynamic',
    ruleId: rules.id,
    message: `\`--${name}\` takes a colour in Magma 3, not channels: check \`${trimmed}\``,
  });
  return { value, changed: false };
};

/** The utilities whose bare `var()` Tailwind 4 reads as the whole shadow, not its colour. */
const SHADOW_UTILITIES = new Set(['shadow', 'inset-shadow', 'drop-shadow', 'text-shadow']);

/**
 * A Tailwind arbitrary value that reads a listed colour (`bg-[rgb(var(--x))]`,
 * `[color:rgb(var(--x)/0.5)]`), rewritten in place. `token` is the class token
 * without its variants and important markers: the utility and its modifier. The value is
 * read with its `_` as spaces and written back the same way, so
 * `bg-[rgb(var(--x)_/_0.5)]` becomes
 * `bg-[color-mix(in_srgb,var(--x)_50%,transparent)]`.
 *
 * The type of the result, checked on the compiler of each Tailwind (4.3.4 and
 * 3.4.17, 2026-11-06): `color-mix()` is a colour on every colour utility of both;
 * a bare `var()` is a colour on all of them except, in Tailwind 4, `shadow`,
 * `inset-shadow`, `drop-shadow` and `text-shadow`, which read it as the whole
 * shadow. There the result gets the type hint `color:`, which both versions
 * read as a colour; a value that already carries a hint keeps it.
 *
 * An opacity modifier after the value (`bg-[rgb(var(--x))]/50`, which the
 * class splitter leaves on the base) is kept: Tailwind applies it to the colour
 * either way.
 *
 * Returns the new base, or null when nothing changed; the caller reports the
 * change on the whole class token, `emit` only receives what is left to do.
 */
export const rewriteArbitraryColor = (
  token: string,
  rules: ColorRules,
  emit: ColorEmit,
): string | null => {
  const modifier = /\](\/(?:\d+|\[[^\]]*\]|\([^)]*\)))$/.exec(token);
  const base = modifier ? token.slice(0, modifier.index + 1) : token;
  const tail = modifier ? modifier[1]! : '';
  if (!base.endsWith(']') || !rules.probe.test(base)) return null;
  const rewrite = (value: string): string => {
    const result = rewriteColorReads(
      value.replace(/_/g, ' '),
      rules,
      (f) => {
        if (f.kind !== 'change') emit(f);
      },
      'class',
    );
    return result.changed ? result.value.replace(/ /g, '_') : value;
  };
  let after: string | null = null;
  const property = /^\[([a-z-]+):(.+)\]$/is.exec(base);
  const utility = /^(-?[a-z][\w-]*?)-\[(.+)\]$/is.exec(base);
  if (property) {
    after = `[${property[1]}:${rewrite(property[2]!)}]`;
  } else if (utility) {
    const [, name, raw] = utility;
    const hinted = /^([a-z-]+):(.+)$/is.exec(raw!);
    const value = hinted ? hinted[2]! : raw!;
    let next = rewrite(value);
    if (
      !hinted &&
      next !== value &&
      SHADOW_UTILITIES.has(name!) &&
      isWholeVar(next.replace(/_/g, ' ').trim())
    )
      next = `color:${next}`;
    after = `${name}-[${hinted ? `${hinted[1]}:` : ''}${next}]`;
  }
  return after !== null && after !== base ? `${after}${tail}` : null;
};

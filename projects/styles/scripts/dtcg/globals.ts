/*
  The global tokens styles publishes on top of design-tokens, as DTCG 2025.10 sets in
  the shape of design-tokens' dist/dtcg (#874): the `--magma-*` globals of
  css/globals.css, the depth axis of css/theme.css and the corner axis of
  build/css/corner.css.

  The sets mirror the CSS blocks:
  - globals: the initial value of every registration, overridden by the `:root` blocks;
  - <modifier>-<context>: what an attribute block (`[data-corner-shape='round']`,
    `:root[data-theme-depth='flat']`) changes. A token the CSS computes from a changed
    one (an elevation from `--depth`) is restated with its new value.

  A value that names one token (`var(--radius-squircle-md)`, `rgb(var(--label-sky-09))`)
  is an alias, of a design-tokens token or of another global; the rest is resolved to a
  DTCG value, and `cssValue` keeps the CSS where it was computed. A value DTCG has no
  type for (a keyword, an enumeration) is listed in the `cssOnly` extension of its group,
  as design-tokens does.

  Pure: the caller reads the stylesheets and design-tokens' base set (../dtcg.ts).
*/
import postcss from 'postcss';
import {
  NAMESPACE,
  alias,
  describeGroups,
  isToken,
  put,
  staleDescriptions,
  token,
  type DtcgGroup,
} from '../../../design-tokens/scripts/dtcg/sets';
import {
  dimension,
  duration,
  rgbColor,
  round,
  shadow,
  type DtcgColor,
} from '../../../design-tokens/scripts/dtcg/values';
import {
  cssOnlyDescription,
  cssOnlyDescriptions,
  globalDescription,
  globalDescriptions,
} from './descriptions';

/** A global DTCG has no type for, as its group lists it. */
interface CssOnlyEntry {
  css: string;
  value: string;
  description?: string;
}

interface Registration {
  syntax: string;
  initialValue: string;
}

interface Block {
  selector: string;
  decls: Array<[string, string]>;
}

export interface Stylesheet {
  registrations: Array<[string, Registration]>;
  blocks: Block[];
}

/** A design-tokens token, by the custom property it is published as. */
export interface PublishedToken {
  path: string[];
  $type: string;
  $value: unknown;
  /** What the token is for, when its source says it (#876). */
  $description?: string;
}

export interface GlobalsInputs {
  /** The stylesheets, in the order a page loads them. */
  sheets: Stylesheet[];
  /** design-tokens' base set: what the globals alias. */
  base: DtcgGroup;
}

export interface Modifier {
  description: string;
  contexts: Record<string, Array<{ $ref: string }>>;
  default: string;
}

export interface GlobalsOutput {
  /** File name (without `.tokens.json`) -> token tree. */
  sets: Record<string, DtcgGroup>;
  /** One resolver modifier per attribute the blocks are scoped by. */
  modifiers: Record<string, Modifier>;
}

const oneLine = (value: string): string => value.replace(/\s+/g, ' ').trim();

/**
 * The registrations and the top-level rules of a stylesheet. A custom property declared
 * anywhere else (inside `@media`, say) is a block this module does not model, so it
 * throws instead of leaving the token out. The one exception is `@supports`: there the
 * corner axis puts back, for a browser without `corner-shape`, values its blocks already
 * declare (corner.ts). That is a fallback of the browser, not a context of the resolver,
 * so it is skipped, and it still throws if it declares a token no top-level rule does.
 */
export const parseStylesheet = (css: string, from: string): Stylesheet => {
  const registrations: Stylesheet['registrations'] = [];
  const blocks: Block[] = [];
  const parsed = postcss.parse(css, { from });
  const declared = new Set<string>();
  for (const node of parsed.nodes) {
    if (node.type === 'rule') {
      node.each((child) => {
        if (child.type === 'decl') declared.add(child.prop);
      });
    }
  }
  for (const node of parsed.nodes) {
    if (node.type === 'atrule' && node.name === 'property') {
      const descriptor = (name: string) => {
        let value = '';
        node.walkDecls(name, (decl) => {
          value = decl.value;
        });
        return value.replace(/^['"]|['"]$/g, '');
      };
      registrations.push([
        node.params.trim(),
        { syntax: descriptor('syntax'), initialValue: oneLine(descriptor('initial-value')) },
      ]);
    } else if (node.type === 'rule') {
      const decls: Block['decls'] = [];
      node.each((child) => {
        if (child.type === 'decl' && child.prop.startsWith('--'))
          decls.push([child.prop, oneLine(child.value)]);
      });
      blocks.push({ selector: oneLine(node.selector), decls });
    } else if (node.type === 'atrule') {
      node.walkDecls(/^--/, (decl) => {
        if (node.name === 'supports' && declared.has(decl.prop)) return;
        throw new Error(`${from}: ${decl.prop} is declared inside @${node.name}, not modelled`);
      });
    }
  }
  return { registrations, blocks };
};

const BASE_SELECTOR = ':root';
/** `[data-corner-shape='round']`, `:root[data-theme-depth='flat']`. */
const ATTRIBUTE_BLOCK = /^(:root)?\[data-([a-z-]+)='([a-z0-9-]+)'\]$/;

/**
 * The DTCG path of a global, one group per CSS prefix as design-tokens does:
 * `--magma-radius-md` is `magma.radius.md`, the bare `--magma-backdrop` is the `$root`
 * of its group, and a name with no prefix of its own (`--depth`) is a top-level token.
 */
export const cssPath = (name: string): string[] => {
  const [prefix, group, ...rest] = name.replace(/^--/, '').split('-');
  if (group === undefined) return [prefix];
  return [prefix, group, rest.length ? rest.join('-') : '$root'];
};

/** Every token of a tree by its custom property, `cssOnly` entries included. */
export const publishedTokens = (tree: DtcgGroup): Map<string, PublishedToken | null> => {
  const found = new Map<string, PublishedToken | null>();
  const walk = (node: DtcgGroup, path: string[]) => {
    const extension = (node.$extensions as Record<string, { cssOnly?: Array<{ css: string }> }>)?.[
      NAMESPACE
    ];
    for (const { css } of extension?.cssOnly ?? []) found.set(css, null);
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$') && key !== '$root') continue;
      if (isToken(child)) {
        const css = child.$extensions[NAMESPACE].css;
        if (css)
          found.set(css, {
            path: [...path, key],
            $type: child.$type,
            $value: child.$value,
            ...(typeof child.$description === 'string' ? { $description: child.$description } : {}),
          });
      } else if (typeof child === 'object' && child !== null)
        walk(child as DtcgGroup, [...path, key]);
    }
  };
  walk(tree, []);
  return found;
};

/** The index of the parenthesis that closes the one at `open`. */
const closing = (value: string, open: number): number => {
  let depth = 0;
  for (let index = open; index < value.length; index++) {
    if (value[index] === '(') depth++;
    if (value[index] === ')' && --depth === 0) return index;
  }
  throw new Error(`Unbalanced parentheses in ${value}`);
};

/** Replace every `name(...)` call, outermost first, with what `replace` returns for its inside. */
const replaceCalls = (value: string, name: string, replace: (inside: string) => string): string => {
  let out = value;
  for (let at = out.indexOf(`${name}(`); at !== -1; at = out.indexOf(`${name}(`)) {
    const open = at + name.length;
    const end = closing(out, open);
    out = `${out.slice(0, at)}${replace(out.slice(open + 1, end))}${out.slice(end + 1)}`;
  }
  return out;
};

/** `--name, fallback` -> its two halves (the fallback may hold commas of its own). */
const varParts = (inside: string): [string, string | undefined] => {
  const comma = inside.indexOf(',');
  return comma === -1
    ? [inside.trim(), undefined]
    : [inside.slice(0, comma).trim(), inside.slice(comma + 1).trim()];
};

/** The token a value names on its own: `var(--x)`, or `rgb(var(--x))` for a color. */
const aliasTarget = (css: string): { name: string; color: boolean } | undefined => {
  const match = /^(rgb\()?var\((--[a-z0-9-]+)\s*(?:,[^()]*(?:\([^()]*\))?[^()]*)?\)(\))?$/.exec(
    css,
  );
  if (!match || Boolean(match[1]) !== Boolean(match[3])) return undefined;
  return { name: match[2], color: Boolean(match[1]) };
};

/** `calc()` of a product, the only form the globals use: `calc(2px * 1)`, `calc(0.06 * 0)`. */
const calc = (inside: string): string => {
  if (/[+/]|\s-\s/.test(inside)) throw new Error(`Only products are modelled in calc(${inside})`);
  let product = 1;
  let unit = '';
  for (const operand of inside.split('*').map((part) => part.trim())) {
    const match = /^(-?\d*\.?\d+)([a-z%]*)$/.exec(operand);
    if (!match) throw new Error(`Not a number or length in calc(): ${operand}`);
    if (match[2] && unit) throw new Error(`Two lengths multiplied in calc(${inside})`);
    product *= Number(match[1]);
    unit ||= match[2];
  }
  return `${round(product, 6)}${unit}`;
};

const NUMBER = /^-?\d*\.?\d+$/;
const CHANNELS = /^(\d{1,3}) (\d{1,3}) (\d{1,3})$/;
const STROKE_STYLE = 'solid|dashed|dotted|double|groove|ridge|outset|inset';

const channelColor = (css: string): DtcgColor => {
  const match = CHANNELS.exec(css);
  if (!match) throw new Error(`Not r g b channels: ${css}`);
  return rgbColor(match.slice(1).map(Number) as [number, number, number]);
};

/** `transparent`, `rgb(r g b)` or `rgb(r g b / a)`. */
const cssColor = (css: string): DtcgColor => {
  if (css === 'transparent') return rgbColor([0, 0, 0], 0);
  const match = /^rgb\((\d{1,3} \d{1,3} \d{1,3})(?: \/ (\d*\.?\d+))?\)$/.exec(css);
  if (!match) throw new Error(`Not an rgb() color: ${css}`);
  const color = channelColor(match[1]);
  return match[2] === undefined ? color : rgbColor(channelsOf(color), Number(match[2]));
};

const channelsOf = (color: DtcgColor): [number, number, number] =>
  color.components.map((c) => Math.round(c * 255)) as [number, number, number];

const noVariables = (name: string): never => {
  throw new Error(`Unresolved ${name} in a shadow`);
};

/**
 * The DTCG type and value of a resolved CSS value. The registration's syntax decides
 * when there is one; `<integer>+` is the channel triplet a color is published as. A
 * value with no syntax is read by its shape. `undefined`: DTCG has no type for it.
 */
const typed = (
  syntax: string | undefined,
  css: string,
): { $type: string; $value: unknown } | undefined => {
  switch (syntax) {
    case '<time>':
      return { $type: 'duration', $value: duration(css) };
    case '<number>':
    case '<integer>':
      return { $type: 'number', $value: Number(css) };
    case '<length>':
      return { $type: 'dimension', $value: dimension(css) };
    case '<color>':
      return { $type: 'color', $value: cssColor(css) };
    case '<integer>+':
      return { $type: 'color', $value: channelColor(css) };
    case undefined:
      break;
    default:
      return undefined;
  }
  if (NUMBER.test(css)) return { $type: 'number', $value: Number(css) };
  if (/^-?\d*\.?\d+(px|rem)$/.test(css)) return { $type: 'dimension', $value: dimension(css) };
  if (/^(transparent|rgb\([^()]*\))$/.test(css)) return { $type: 'color', $value: cssColor(css) };
  if (/rgb\(/.test(css) && /\d(px|rem)/.test(css)) {
    const layers = shadow(css, noVariables);
    return { $type: 'shadow', $value: layers.length === 1 ? layers[0] : layers };
  }
  return undefined;
};

type Converted =
  | { kind: 'token'; $type: string; $value: unknown; cssValue?: string }
  | { kind: 'cssOnly'; value: string };

export function buildGlobals({ sheets, base }: GlobalsInputs): GlobalsOutput {
  const published = publishedTokens(base);
  const registrations = new Map(sheets.flatMap((sheet) => sheet.registrations));

  // the base scenario: each initial value, then the `:root` blocks in load order
  const baseValues = new Map<string, string>();
  for (const [name, { initialValue }] of registrations)
    if (initialValue) baseValues.set(name, initialValue);
  /** modifier -> context -> the declarations of its block. */
  const deviations = new Map<string, Map<string, Array<[string, string]>>>();
  const scopes = new Map<string, string>();
  for (const { selector, decls } of sheets.flatMap((sheet) => sheet.blocks)) {
    if (selector === BASE_SELECTOR) {
      for (const [name, value] of decls) baseValues.set(name, value);
      continue;
    }
    const match = ATTRIBUTE_BLOCK.exec(selector);
    if (!match) throw new Error(`Unexpected block ${selector}: neither :root nor [data-*='...']`);
    const [, root, attribute, context] = match;
    const contexts = deviations.get(attribute) ?? new Map<string, Array<[string, string]>>();
    contexts.set(context, [...(contexts.get(context) ?? []), ...decls]);
    deviations.set(attribute, contexts);
    scopes.set(attribute, `${root ?? ''}[data-${attribute}='<context>']`);
  }

  for (const name of baseValues.keys())
    if (published.has(name))
      throw new Error(`${name} is published by design-tokens and declared again by styles`);

  /** Convert every global in one scenario (the base values with a block applied). */
  const scenario = (values: Map<string, string>): Map<string, Converted> => {
    const converted = new Map<string, Converted>();

    /** A CSS value with its var() and calc() worked out, for the shapes that need it. */
    const resolve = (css: string, seen: string[]): string =>
      oneLine(
        replaceCalls(
          replaceCalls(css, 'var', (inside) => {
            const [name, fallback] = varParts(inside);
            if (seen.includes(name))
              throw new Error(`Reference loop: ${[...seen, name].join(' -> ')}`);
            const own = values.get(name);
            if (own !== undefined) return resolve(own, [...seen, name]);
            const dt = published.get(name);
            if (dt && dt.$type === 'color' && typeof dt.$value === 'object')
              return channelsOf(dt.$value as DtcgColor).join(' ');
            if (fallback !== undefined) return resolve(fallback, seen);
            throw new Error(`var(${name}) resolves to nothing`);
          }),
          'calc',
          calc,
        ),
      );

    /** The alias of the token `name`, with the type it carries. */
    const aliasOf = (name: string): { $type: string; $value: string } | undefined => {
      if (values.has(name)) {
        const target = convert(name);
        return target.kind === 'token'
          ? { $type: target.$type, $value: alias(cssPath(name)) }
          : undefined;
      }
      const dt = published.get(name);
      return dt ? { $type: dt.$type, $value: alias(dt.path) } : undefined;
    };

    const convert = (name: string): Converted => {
      const done = converted.get(name);
      if (done) return done;
      const css = values.get(name) as string;
      const syntax = registrations.get(name)?.syntax;
      let out: Converted | undefined;

      const target = aliasTarget(css);
      const link = target && aliasOf(target.name);
      if (link && (!target.color || link.$type === 'color')) out = { kind: 'token', ...link };

      // `<width> <style> <color>`: a border, whose color stays an alias when it is one
      const border = new RegExp(`^(\\S+) (${STROKE_STYLE}) (.+)$`).exec(css);
      if (!out && border && syntax === undefined) {
        const colorLink = aliasTarget(border[3]);
        const color = colorLink && aliasOf(colorLink.name);
        const resolvedColor =
          color?.$type === 'color' ? color.$value : cssColor(resolve(border[3], [name]));
        out = {
          kind: 'token',
          $type: 'border',
          $value: {
            color: resolvedColor,
            width: dimension(resolve(border[1], [name])),
            style: border[2],
          },
        };
        if (typeof resolvedColor !== 'string' && /var\(|calc\(/.test(css)) out.cssValue = css;
      }

      if (!out) {
        const literal = resolve(css, [name]);
        const value = typed(syntax, literal);
        const computed = literal !== css && /var\(|calc\(/.test(css);
        out = value
          ? { kind: 'token', ...value, ...(computed ? { cssValue: css } : {}) }
          : { kind: 'cssOnly', value: css };
      }
      converted.set(name, out);
      return out;
    };

    for (const name of values.keys()) convert(name);
    return converted;
  };

  /** A set holding the given converted globals, `cssOnly` ones on their group. */
  const setOf = (entries: Array<[string, Converted]>): DtcgGroup => {
    const set: DtcgGroup = {};
    for (const [name, converted] of entries) {
      const path = cssPath(name);
      if (converted.kind === 'token') {
        const { $type, $value, cssValue } = converted;
        put(
          set,
          path,
          token($type, $value, { css: name, tier: 'semantic', ...(cssValue ? { cssValue } : {}) }),
        );
        continue;
      }
      let group = set;
      for (const key of path.slice(0, -1)) group = (group[key] ??= {}) as DtcgGroup;
      const extensions = ((group.$extensions as Record<string, { cssOnly: unknown[] }>) ??= {
        [NAMESPACE]: { cssOnly: [] },
      });
      extensions[NAMESPACE].cssOnly.push({ css: name, value: converted.value });
    }
    return set;
  };

  const baseConverted = scenario(baseValues);
  const sets: Record<string, DtcgGroup> = { globals: setOf([...baseConverted]) };

  // a global may not land where design-tokens already has a token, or the merge would
  // silently replace one with the other
  for (const [name] of baseConverted) {
    const path = cssPath(name);
    let node: unknown = base;
    for (const [index, key] of path.entries()) {
      node = (node as DtcgGroup)?.[key];
      if (node === undefined) break;
      if (isToken(node) || index === path.length - 1)
        throw new Error(
          `${name} (${path.join('.')}) collides with design-tokens' ${path.slice(0, index + 1).join('.')}`,
        );
    }
  }

  const modifiers: Record<string, Modifier> = {};
  for (const [attribute, contexts] of deviations) {
    const files: Modifier['contexts'] = {};
    let defaultContext: string | undefined;
    for (const [context, decls] of contexts) {
      const values = new Map(baseValues);
      for (const [name, value] of decls) {
        if (!values.has(name))
          throw new Error(`${name} is set by a [data-${attribute}] block only`);
        values.set(name, value);
      }
      const changed = [...scenario(values)].filter(
        ([name, converted]) =>
          JSON.stringify(converted) !== JSON.stringify(baseConverted.get(name)),
      );
      files[context] = [];
      if (!changed.length) {
        defaultContext ??= context;
        continue;
      }
      const set = `${attribute}-${context}`;
      sets[set] = setOf(changed);
      files[context].push({ $ref: `${set}.tokens.json` });
    }
    // the `:root` values are no context of the attribute: they are the one with no block
    if (!defaultContext) {
      defaultContext = 'default';
      files[defaultContext] = [];
    }
    modifiers[attribute] = {
      description: `The data-${attribute} attribute: ${scopes.get(attribute)}. The default is the value of the :root block.`,
      contexts: Object.fromEntries(
        Object.entries(files).sort(
          ([a], [b]) => Number(b === defaultContext) - Number(a === defaultContext),
        ),
      ),
      default: defaultContext,
    };
  }

  // what every global and its group is for, on the globals set only: the other sets
  // restate values, as design-tokens' do
  describeGroups(sets.globals, {
    describe: globalDescription,
    source: 'scripts/dtcg/descriptions.ts',
    tokens: () => true,
  });
  const cssOnlyNames: string[] = [];
  const bareCssOnly: string[] = [];
  const describeCssOnly = (node: DtcgGroup) => {
    const list = (node.$extensions as Record<string, { cssOnly?: CssOnlyEntry[] }>)?.[NAMESPACE]
      ?.cssOnly;
    for (const entry of list ?? []) {
      cssOnlyNames.push(entry.css);
      const description = cssOnlyDescription(entry.css);
      if (description) entry.description = description;
      else bareCssOnly.push(entry.css);
    }
    for (const [key, child] of Object.entries(node))
      if (!key.startsWith('$') && !isToken(child)) describeCssOnly(child as DtcgGroup);
  };
  describeCssOnly(sets.globals);
  if (bareCssOnly.length)
    throw new Error(
      `${bareCssOnly.join(', ')} listed in cssOnly, with no description in scripts/dtcg/descriptions.ts`,
    );
  const stale = [
    ...staleDescriptions(sets.globals, globalDescriptions),
    ...Object.keys(cssOnlyDescriptions).filter((name) => !cssOnlyNames.includes(name)),
  ];
  if (stale.length)
    throw new Error(
      `scripts/dtcg/descriptions.ts describes what is not in the set: ${stale.join(', ')}`,
    );

  return { sets, modifiers };
}

/*
  The global tokens of Magma as DTCG 2025.10 sets, plus the resolver document that
  says which sets apply in which mode, theme and contrast preference.

  The sets mirror the CSS blocks one to one, so that merging them in the resolver's
  order gives the values the stylesheets give in the same conditions:
  - base: every primitive in light mode and the semantic layer of the base `:root`;
  - mode-dark: what the dark selectors of colors-rgb.css and semantic.css change;
  - contrast-more: the `pref-contrast-more` block of semantic.css;
  - theme-<name>, theme-<name>-contrast-more: the blocks of themes.css.

  Pure: the caller loads the inputs and writes the files (./write.ts).
*/
import { semantic } from '../../semantic.config';
import type { SemanticDecl } from '../../semantic.config';
import type { SemanticModel } from '../../semantic.model';
import {
  colorChannels,
  cubicBezier,
  dimension,
  duration,
  hexColor,
  ratio,
  round,
  shadow,
  type DtcgDimension,
} from './values';

/** The `$extensions` key of everything Magma adds to a token or group. */
export const NAMESPACE = 'it.maggioli.magma';

export type Tier = 'primitive' | 'semantic' | 'internal';

export interface MagmaExtension {
  /** The custom property the token is published as, when it is one. */
  css?: string;
  /**
   * `primitive`: a raw value or scale; `semantic`: a `--magma-*` role, the contract
   * UI code paints with; `internal`: a `--magma-tint-*` pointer, how themes and
   * contrast retarget the roles, not an API.
   */
  tier: Tier;
  /** The CSS value, when it is written differently from `$value` (a ratio, an em length). */
  cssValue?: string;
}

export interface DtcgToken {
  $type: string;
  $value: unknown;
  $description?: string;
  $deprecated?: string | boolean;
  $extensions: { [NAMESPACE]: MagmaExtension };
}

export interface DtcgGroup {
  [key: string]: DtcgGroup | DtcgToken | unknown;
}

/** One color family: mode -> step -> `{ value: '#rrggbb' }`, as the color engine emits it. */
type ColorFamily = Record<'light' | 'dark', Record<string, { value: string }>>;

export interface DtcgInputs {
  /** `createColorTokens(config).tokens`: color -> group -> family -> modes. */
  colors: { color: Record<string, Record<string, ColorFamily>> };
  /** Families declared as an alias of another in the color config: `variant.primary` -> `brand.maggioli`. */
  colorAliases: Record<string, string>;
  /** The JSON token sources under tokens/, deep-merged into one tree. */
  sources: Record<string, unknown>;
  semantic: SemanticModel;
}

export interface DtcgOutput {
  /** File name (without `.tokens.json`) -> token tree. */
  sets: Record<string, DtcgGroup>;
  resolver: Record<string, unknown>;
}

export const isToken = (node: unknown): node is DtcgToken =>
  typeof node === 'object' && node !== null && '$value' in node;

/** Put a token at `path`, refusing to overwrite a token or to nest one inside another. */
export const put = (tree: DtcgGroup, path: string[], token: DtcgToken): void => {
  let node = tree;
  path.slice(0, -1).forEach((key, index) => {
    if (isToken(node[key]))
      throw new Error(`${path.slice(0, index + 1).join('.')} is a token, not a group`);
    node[key] ??= {};
    node = node[key] as DtcgGroup;
  });
  const leaf = path[path.length - 1];
  if (node[leaf] !== undefined) throw new Error(`Two tokens at ${path.join('.')}`);
  node[leaf] = token;
};

export const token = (
  $type: string,
  $value: unknown,
  extension: MagmaExtension,
  extra: Partial<Pick<DtcgToken, '$description' | '$deprecated'>> = {},
): DtcgToken => ({ $type, $value, ...extra, $extensions: { [NAMESPACE]: extension } });

/** The ramp step as the CSS writes it: `1` -> `01`; `seed` and role names unchanged. */
const stepName = (step: string): string => (Number(step) < 10 ? `0${step}` : step);

/** A curly-brace DTCG alias. */
export const alias = (path: string[]): string => `{${path.join('.')}}`;

export function buildDtcg({
  colors,
  colorAliases,
  sources,
  semantic: model,
}: DtcgInputs): DtcgOutput {
  const base: DtcgGroup = {};
  const dark: DtcgGroup = {};
  /** custom property name (no `--`) -> DTCG path, to turn a `var()` into an alias. */
  const byCss = new Map<string, string[]>();

  // --- palette: every color primitive, as colors-rgb.css publishes it ------------
  // `--<group>-<family>-<step>`; the bare `--<group>-<family>` (the family's own
  // color, the `color` step) is the `$root` of the family group.
  const paletteRef = (group: string, family: string, step: string) => {
    const key = step === 'color' ? '$root' : stepName(step);
    const css = step === 'color' ? `${group}-${family}` : `${group}-${family}-${key}`;
    return { path: ['palette', group, family, key], css };
  };
  for (const [group, families] of Object.entries(colors.color))
    for (const [family, modes] of Object.entries(families)) {
      const target = colorAliases[`${group}.${family}`];
      for (const [step, { value }] of Object.entries(modes.light)) {
        const { path, css } = paletteRef(group, family, step);
        byCss.set(css, path);
        const extension: MagmaExtension = { css: `--${css}`, tier: 'primitive' };
        if (target) {
          // an aliased family (the variants) points at the family it names, step by
          // step, so the choice of color stays visible; both modes follow the target
          const [toGroup, toFamily] = target.split('.');
          put(
            base,
            path,
            token('color', alias(paletteRef(toGroup, toFamily, step).path), extension),
          );
          continue;
        }
        put(base, path, token('color', hexColor(value), extension));
        const darkValue = modes.dark?.[step]?.value;
        if (darkValue && darkValue.toLowerCase() !== value.toLowerCase())
          put(dark, path, token('color', hexColor(darkValue), extension));
      }
    }

  const channelsIn = (mode: 'light' | 'dark') => (name: string) => {
    const path = byCss.get(name.replace(/^--/, ''));
    if (!path) throw new Error(`No palette token for ${name}`);
    const [, group, family, key] = path;
    const step = key === '$root' ? 'color' : String(Number(key) || key);
    const value = colors.color[group][family][mode][step]?.value;
    if (!value) throw new Error(`No ${mode} value for ${name}`);
    return colorChannels(hexColor(value));
  };

  // --- magma: the semantic layer (semantic.model.ts) --------------------------------
  // `--magma-<group>-<rest>` becomes `magma.<group>.<rest>`. Two groups take two
  // segments: the `--magma-tint-*` pointers, and every accent with an infix
  // (`--magma-accent-ai-*`), so each accent is a group of its own.
  const infixedAccents = Object.keys(semantic.accents).filter((role) => role !== 'accent');
  const magmaPath = (name: string): string[] => {
    const rest = name.replace(/^magma-/, '');
    if (rest.startsWith('tint-')) return ['magma', 'tint', rest.slice('tint-'.length)];
    const accent = infixedAccents.find((role) => rest.startsWith(`accent-${role}-`));
    if (accent) return ['magma', `accent-${accent}`, rest.slice(`accent-${accent}-`.length)];
    const [group, ...key] = rest.split('-');
    return ['magma', group, key.join('-')];
  };
  const semanticToken = (decl: SemanticDecl): [string[], DtcgToken] => {
    const target = decl.ref.startsWith('magma-') ? magmaPath(decl.ref) : byCss.get(decl.ref);
    if (!target) throw new Error(`--${decl.name} points at --${decl.ref}, which is no token`);
    const tier: Tier = decl.name.startsWith('magma-tint-') ? 'internal' : 'semantic';
    const extra = decl.deprecated ? { $deprecated: decl.deprecated } : {};
    return [
      magmaPath(decl.name),
      token('color', alias(target), { css: `--${decl.name}`, tier }, extra),
    ];
  };
  const semanticSet = (decls: SemanticDecl[]): DtcgGroup => {
    const set: DtcgGroup = {};
    decls.map(semanticToken).forEach(([path, value]) => put(set, path, value));
    return set;
  };
  model.base
    .flatMap(({ decls }) => decls)
    .map(semanticToken)
    .forEach(([path, value]) => put(base, path, value));
  model.dark.map(semanticToken).forEach(([path, value]) => put(dark, path, value));

  // --- scale and motion: what typography.css and transitions.css publish -----------
  const source = (path: string): unknown =>
    path
      .split('.')
      .reduce<unknown>((node, key) => (node as Record<string, unknown>)?.[key], sources);
  /** A source value with its `{...}` references followed to the end. */
  const resolved = (value: unknown): unknown => {
    let current = value;
    for (let hops = 0; typeof current === 'string' && /^\{.+\}$/.test(current); hops++) {
      if (hops > 10) throw new Error(`Reference loop at ${String(value)}`);
      current = (source(current.slice(1, -1)) as { value?: unknown })?.value;
    }
    return current;
  };
  /** The DTCG alias of a source reference, for the source groups that are published too. */
  const SOURCE_GROUPS: Array<[string, string]> = [
    ['sizing.primitive.', 'size'],
    ['typography.leading.', 'leading'],
    ['sizing.aspectRatio.', 'aspect'],
    ['cosmetic.boxShadow.', 'shadow'],
  ];
  const sourceAlias = (value: unknown): string | undefined => {
    if (typeof value !== 'string' || !/^\{.+\}$/.test(value)) return undefined;
    const ref = value.slice(1, -1);
    const match = SOURCE_GROUPS.find(([prefix]) => ref.startsWith(prefix));
    return match ? alias([match[1], ref.slice(match[0].length)]) : undefined;
  };
  const entries = (path: string) =>
    Object.entries(
      (source(path) ?? {}) as Record<string, { value: unknown; description?: string }>,
    );
  /** The Tailwind 4 filter of the CSS build: a key whose name ends with `default` is not published. */
  const published = (key: string) => !key.toLowerCase().endsWith('default');
  /** The `ifTailwind4Border` rule: numeric keys of border and radius are not published. */
  const named = (key: string) => Number.isNaN(Number(key));
  const extra = (description?: string) => (description ? { $description: description } : {});
  /** A px value of the sources as the rem the CSS writes (`pixelToRem`, 16px base). */
  const rem = (px: unknown): DtcgDimension => ({
    value: round(dimension(String(px)).value / 16),
    unit: 'rem',
  });
  const cssOnly: Record<string, Array<{ css: string; value: string }>> = {};
  const keepCssOnly = (group: string, css: string, value: string) =>
    (cssOnly[group] ??= []).push({ css, value });

  // size: the primitive scale every spacing, container, border and radius names.
  // Not a custom property of its own: the CSS publishes the resolved values.
  for (const [key, { value }] of entries('sizing.primitive'))
    put(base, ['size', key], token('dimension', dimension(String(value)), { tier: 'primitive' }));

  // font families
  const typography = source('typography') as Record<string, Record<string, unknown>>;
  const families = Object.entries(typography).filter(
    ([, group]) => (group as { fontFamily?: unknown }).fontFamily,
  );
  for (const [family, group] of families) {
    const names = (group.fontFamily as { value: string[] }).value.map((name) =>
      name.replace(/^['"]|['"]$/g, ''),
    );
    put(
      base,
      ['font', family],
      token('fontFamily', names, { css: `--font-${family}`, tier: 'primitive' }),
    );
  }

  // text sizes: `--text-size-<family>-<style>` and its three companions, then the
  // style as one typography token. The CSS writes the letter spacing in em; DTCG
  // takes only px and rem, so the JSON states it in rem at the style's own size.
  for (const [family, group] of families)
    for (const [style, props] of Object.entries(
      (group.variants ?? {}) as Record<string, Record<string, { value: unknown }>>,
    )) {
      const at = ['text-size', family, style];
      const css = `--text-size-${family}-${style}`;
      const fontSize = rem(resolved(props.fontSize.value));
      put(base, [...at, '$root'], token('dimension', fontSize, { css, tier: 'primitive' }));
      put(
        base,
        [...at, 'font-weight'],
        token('fontWeight', Number(resolved(props.fontWeight.value)), {
          css: `${css}--font-weight`,
          tier: 'primitive',
        }),
      );
      let letterSpacing: DtcgDimension = { value: 0, unit: 'rem' };
      if (props.letterSpacing) {
        const em = round(dimension(String(resolved(props.letterSpacing.value))).value / 16);
        letterSpacing = { value: round(em * fontSize.value, 6), unit: 'rem' };
        put(
          base,
          [...at, 'letter-spacing'],
          token('dimension', letterSpacing, {
            css: `${css}--letter-spacing`,
            tier: 'primitive',
            cssValue: `${em}em`,
          }),
        );
      }
      const lineHeight = rem(resolved(props.lineHeight.value));
      put(
        base,
        [...at, 'line-height'],
        token('dimension', sourceAlias(props.lineHeight.value) ?? lineHeight, {
          css: `${css}--line-height`,
          tier: 'primitive',
        }),
      );
      put(
        base,
        ['typography', family, style],
        token(
          'typography',
          {
            fontFamily: alias(['font', family]),
            fontSize: alias([...at, '$root']),
            fontWeight: alias([...at, 'font-weight']),
            letterSpacing: props.letterSpacing ? alias([...at, 'letter-spacing']) : letterSpacing,
            // DTCG reads lineHeight as a multiplier of the font size
            lineHeight: round(lineHeight.value / fontSize.value, 6),
          },
          { tier: 'primitive' },
        ),
      );
    }

  for (const [key, { value }] of entries('typography.leading'))
    put(
      base,
      ['leading', key],
      token('dimension', rem(value), { css: `--leading-${key}`, tier: 'primitive' }),
    );

  // spacing: `--spacing` is the multiplier of the Tailwind numeric utilities
  const scale = (source('spacing-scale') as { value: string }).value;
  put(
    base,
    ['spacing', '$root'],
    token('dimension', dimension(scale), { css: '--spacing', tier: 'primitive' }),
  );
  for (const [key, { value }] of entries('spacing')) {
    const css = `--spacing-${key}`;
    const literal = String(resolved(value));
    if (/ch$/.test(literal)) {
      keepCssOnly('spacing', css, literal);
      continue;
    }
    put(
      base,
      ['spacing', key],
      token('dimension', sourceAlias(value) ?? dimension(literal), { css, tier: 'primitive' }),
    );
  }

  for (const [key, { value }] of entries('container'))
    put(
      base,
      ['container', key],
      token('dimension', sourceAlias(value) ?? dimension(String(resolved(value))), {
        css: `--container-${key}`,
        tier: 'primitive',
      }),
    );

  for (const [key, range] of Object.entries(
    source('screen') as Record<string, { min: { value: string } }>,
  ))
    put(
      base,
      ['breakpoint', key],
      token('dimension', dimension(range.min.value), {
        css: `--breakpoint-${key}`,
        tier: 'primitive',
      }),
    );

  for (const [key, { value }] of entries('sizing.aspectRatio')) {
    const css = String(resolved(value)).replace(':', '/');
    put(
      base,
      ['aspect', key],
      token('number', sourceAlias(value) ?? ratio(css), {
        css: `--aspect-${key}`,
        tier: 'primitive',
        cssValue: css,
      }),
    );
  }

  for (const [key, { value, description }] of entries('cosmetic.border'))
    if (published(key) && named(key))
      put(
        base,
        ['border', key],
        token(
          'dimension',
          sourceAlias(value) ?? dimension(String(resolved(value))),
          { css: `--border-${key}`, tier: 'primitive' },
          extra(description),
        ),
      );

  for (const [key, { value, description }] of entries('radius'))
    if (published(key) && named(key))
      put(
        base,
        ['radius', key],
        token(
          'dimension',
          sourceAlias(value) ?? dimension(String(resolved(value))),
          { css: `--radius-${key}`, tier: 'primitive' },
          extra(description),
        ),
      );

  // shadows: the ring family draws with a palette color, so it flips with the mode
  for (const [key, { value, description }] of entries('cosmetic.boxShadow')) {
    if (!published(key)) continue;
    const path = ['shadow', key];
    const css = `--shadow-${key}`;
    const link = sourceAlias(value);
    if (link) {
      put(base, path, token('shadow', link, { css, tier: 'primitive' }, extra(description)));
      continue;
    }
    const literal = String(value);
    const extension: MagmaExtension = { css, tier: 'primitive' };
    if (literal.includes('var(')) extension.cssValue = literal;
    const layers = (mode: 'light' | 'dark') => {
      const out = shadow(literal, channelsIn(mode));
      return out.length === 1 ? out[0] : out;
    };
    put(base, path, token('shadow', layers('light'), extension, extra(description)));
    if (literal.includes('var(')) put(dark, path, token('shadow', layers('dark'), extension));
  }

  for (const [key, { value }] of entries('css.duration'))
    put(
      base,
      ['duration', key],
      token('duration', duration(String(value)), { css: `--duration-${key}`, tier: 'primitive' }),
    );

  for (const [key, { value }] of entries('css.timingFunction'))
    put(
      base,
      ['ease', key],
      token('cubicBezier', cubicBezier(String(value)), { css: `--ease-${key}`, tier: 'primitive' }),
    );

  // transition-property lists have no DTCG type
  for (const [key, { value }] of entries('css.transitionProperty'))
    keepCssOnly('transition-property', `--transition-property-${key}`, String(value));

  // Custom properties DTCG has no type for (a `ch` measure, a list of property
  // names) stay on their group, so the JSON still lists every global token.
  for (const [group, list] of Object.entries(cssOnly)) {
    base[group] ??= {};
    (base[group] as DtcgGroup).$extensions = { [NAMESPACE]: { cssOnly: list } };
  }

  // --- the other sets ----------------------------------------------------------------
  const sets: Record<string, DtcgGroup> = { base, 'mode-dark': dark };
  sets['contrast-more'] = semanticSet(model.contrast);
  // One context per theme, and one per theme under pref-contrast-more, merged in the
  // cascade order of the stylesheets: the base contrast block (semantic.css), then
  // the theme block and the theme's own contrast block (themes.css, loaded after).
  const contrastFile = { $ref: 'contrast-more.tokens.json' };
  const themeContexts: Record<string, Array<{ $ref: string }>> = {};
  for (const theme of model.themes) {
    const name = `theme-${theme.name}`;
    const files: Array<{ $ref: string }> = [];
    if (theme.decls.length) {
      sets[name] = semanticSet(theme.decls);
      files.push({ $ref: `${name}.tokens.json` });
    }
    const contrastFiles = [contrastFile, ...files];
    if (theme.contrast.length) {
      sets[`${name}-contrast-more`] = semanticSet(theme.contrast);
      contrastFiles.push({ $ref: `${name}-contrast-more.tokens.json` });
    }
    themeContexts[theme.name] = files;
    themeContexts[`${theme.name}-contrast-more`] = contrastFiles;
  }
  // the base theme is the one that repoints nothing: the `:root` layer itself
  const baseTheme = model.themes.find((theme) => !theme.decls.length)?.name;
  if (!baseTheme) throw new Error('semantic.config: no theme is the base layer');

  const resolver = {
    $schema: 'https://www.designtokens.org/schemas/2025.10/resolver.json',
    version: '2025.10',
    name: 'Magma design tokens',
    description:
      'The global tokens of Magma. Merge the sets in resolutionOrder for one mode and one theme; the result matches the stylesheets of @maggioli-design-system/design-tokens and @maggioli-design-system/styles in the same conditions.',
    sets: {
      base: {
        description: 'Every primitive in light mode, and the semantic layer of the default theme.',
        sources: [{ $ref: 'base.tokens.json' }],
      },
    },
    modifiers: {
      mode: {
        description:
          'Color scheme: pref-mode-dark, or prefers-color-scheme: dark without a mds-pref controller.',
        contexts: { light: [], dark: [{ $ref: 'mode-dark.tokens.json' }] },
        default: 'light',
      },
      theme: {
        description:
          'Named theme (data-theme-name) and contrast preference (pref-contrast-more) together: under a theme the contrast promotions are restated in the theme family, so the two cannot be two modifiers.',
        contexts: themeContexts,
        default: baseTheme,
      },
    },
    resolutionOrder: [
      { $ref: '#/sets/base' },
      { $ref: '#/modifiers/mode' },
      { $ref: '#/modifiers/theme' },
    ],
  };

  return { sets, resolver };
}

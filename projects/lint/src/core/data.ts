/*
  The data the rules check against, read from the installed version of Magma, never from a
  list written by hand, so the rules follow the components and the tokens release by
  release:
  - the components, their props and the values each prop takes, and which of their CSS
    custom properties are public: the documentation.json of @maggioli-design-system/magma;
  - which colour classes are a raw palette step: the DTCG base set of
    @maggioli-design-system/design-tokens (which families are primitives) and the
    consumption map of @maggioli-design-system/styles (the Tailwind key of each token and
    the utilities that take a colour).
  The rules ship inside @maggioli-design-system/magma (dist/lint, built by the stencil
  build), so they read the documentation.json beside them and resolve design-tokens and
  styles, dependencies of magma, from where magma is installed: the data is always the one
  of the same release. A path in the settings replaces a lookup. Each file is read once per
  process.
*/
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Where the data is read from; each path replaces its lookup. */
export interface MagmaSettings {
  /** The directory the paths below are relative to, and the last place the packages are resolved from: the linted project by default. */
  root?: string;
  /** The documentation.json of @maggioli-design-system/magma. */
  documentation?: string;
  /** The dist/dtcg/base.tokens.json of @maggioli-design-system/design-tokens. */
  tokens?: string;
  /** The dist/tailwind/consumption.json of @maggioli-design-system/styles. */
  consumption?: string;
  /** The dist/dtcg/globals.tokens.json of @maggioli-design-system/styles. */
  globals?: string;
}

export interface PropInfo {
  name: string;
  /** The attribute it reflects, when it has one. */
  attr?: string;
  /** A boolean prop: on whenever its attribute is present. */
  boolean: boolean;
  /** Every value it takes, when the type is a closed union of literals; undefined when open. */
  values?: string[];
  /** What to use instead, when the prop is deprecated (its `@deprecated` text). */
  deprecation?: string;
}

export interface ComponentInfo {
  tag: string;
  /** Every prop, by its name and by its attribute. */
  props: Map<string, PropInfo>;
  /** The component renders a default slot. */
  defaultSlot: boolean;
}

export interface StyleInfo {
  name: string;
  /** The components that document it. */
  tags: string[];
  /** Public: promised to the products. Internal: it may change in any release. */
  visibility: 'public' | 'internal';
  /** A public one that takes a value of its own (an illustration colour), not a token or a role. */
  static: boolean;
}

export interface PaletteInfo {
  /** The Tailwind utilities that take a colour (`bg`, `text`, `border-t`...), longest first. */
  colorUtilities: string[];
  /** The Tailwind keys of the raw palette steps (`tone-neutral-03`, `surface-neutral-default`). */
  rawKeys: Set<string>;
}

const PACKAGE = {
  documentation: '@maggioli-design-system/magma/dist/documentation.json',
  tokens: '@maggioli-design-system/design-tokens/dist/dtcg/base.tokens.json',
  consumption: '@maggioli-design-system/styles/dist/tailwind/consumption.json',
  globals: '@maggioli-design-system/styles/dist/dtcg/globals.tokens.json',
};

const resolveFrom = (from: string, id: string): string | undefined => {
  try {
    return createRequire(from).resolve(id);
  } catch {
    return undefined;
  }
};

const HERE = fileURLToPath(import.meta.url);
/** Inside magma this module is dist/lint/core/data.js: the documentation.json of dist is two folders up. */
const BESIDE = path.resolve(path.dirname(HERE), '../../documentation.json');

/**
 * The file of `kind`: the path of the settings; else, for the documentation, the one beside
 * these rules in the magma package; else the package resolved from these rules (magma's
 * dependencies, when they ship inside it); else resolved from the root, the linted project.
 */
export const locate = (kind: keyof typeof PACKAGE, settings: MagmaSettings = {}): string => {
  const root = settings.root ?? process.cwd();
  const own = settings[kind];
  if (own) {
    const file = path.resolve(root, own);
    if (!existsSync(file))
      throw new Error(
        `The "${kind}" setting of the Magma lint names ${file}, which does not exist.`,
      );
    return file;
  }
  if (kind === 'documentation' && existsSync(BESIDE)) return BESIDE;
  const found =
    resolveFrom(HERE, PACKAGE[kind]) ?? resolveFrom(path.join(root, 'package.json'), PACKAGE[kind]);
  if (found) return found;
  throw new Error(
    `The Magma lint reads ${PACKAGE[kind]} from the installed packages and could not find it from ${root}: install @maggioli-design-system/magma, or set its path in the "${kind}" setting.`,
  );
};

/** Inside magma this module is dist/lint/core/data.js: the manifest of magma is three folders up. */
const OWN_MANIFEST = path.resolve(path.dirname(HERE), '../../../package.json');

/** The version of the magma these rules ship in; undefined in the sources of the repository. */
export const shippedVersion = (): string | undefined => {
  if (!existsSync(OWN_MANIFEST)) return undefined;
  const { name, version } = JSON.parse(readFileSync(OWN_MANIFEST, 'utf8')) as {
    name?: string;
    version?: string;
  };
  return name === '@maggioli-design-system/magma' ? version : undefined;
};

/**
 * A section of the lint guide at the release these rules ship in, its tag `magma@<version>`:
 * a project on an older version reads the rule it runs, not the one on main. Main only from
 * the sources, which belong to no release.
 */
export const lintGuideUrl = (anchor: string, version = shippedVersion()): string =>
  `https://github.com/magma-design-system/magma/blob/${version ? `magma@${version}` : 'main'}/docs/agents/lint.md#${anchor}`;

const cache = new Map<string, unknown>();
/** What `build` makes of a JSON file, once per `key` (the file, and what else it depends on). */
const readJson = <T>(file: string, build: (json: never) => T, key = file): T => {
  if (!cache.has(key)) cache.set(key, build(JSON.parse(readFileSync(file, 'utf8')) as never));
  return cache.get(key) as T;
};

/** A data file as it is, parsed once per process: for the tools that need more than the rules. */
export const readData = <T = unknown>(kind: keyof typeof PACKAGE, settings?: MagmaSettings): T =>
  readJson(locate(kind, settings), (json: T) => json, `raw:${locate(kind, settings)}`);

/** The root of the installed magma package: two folders above its dist/documentation.json. */
export const magmaRoot = (settings?: MagmaSettings): string =>
  path.dirname(path.dirname(locate('documentation', settings)));

interface DocsValue {
  value?: string;
  type: string;
}
interface DocsProp {
  name: string;
  attr?: string;
  values?: DocsValue[];
  deprecation?: string;
}
interface DocsStyle {
  name: string;
  visibility?: 'public' | 'internal';
  static?: boolean;
}
interface DocsComponent {
  tag: string;
  props: DocsProp[];
  slots: Array<{ name: string }>;
  styles?: DocsStyle[];
}

/** The types a union may hold next to its literals and still be closed. */
const EMPTY = new Set(['undefined', 'null']);

export const propInfo = ({ name, attr, values = [], deprecation }: DocsProp): PropInfo => {
  const literals = values.filter((value) => value.value !== undefined);
  const closed =
    literals.length > 0 &&
    values.every((value) => value.value !== undefined || EMPTY.has(value.type));
  return {
    name,
    ...(attr ? { attr } : {}),
    boolean: values.some((value) => value.type === 'boolean'),
    ...(closed ? { values: literals.map((value) => String(value.value)) } : {}),
    // the JSDoc wraps it over several lines
    ...(deprecation != null ? { deprecation: deprecation.replace(/\s+/g, ' ').trim() } : {}),
  };
};

/** The components of the installed version, by tag. */
export const loadComponents = (settings?: MagmaSettings): Map<string, ComponentInfo> =>
  readJson(locate('documentation', settings), (json: { components: DocsComponent[] }) => {
    const components = new Map<string, ComponentInfo>();
    for (const { tag, props, slots } of json.components) {
      const byKey = new Map<string, PropInfo>();
      for (const prop of props) {
        const info = propInfo(prop);
        byKey.set(info.name, info);
        if (info.attr) byKey.set(info.attr, info);
      }
      components.set(tag, {
        tag,
        props: byKey,
        defaultSlot: slots.some((slot) => slot.name === ''),
      });
    }
    return components;
  });

/**
 * The CSS custom properties the components document, by name. An entry without `visibility`
 * comes from a release before the contract (#1095), when every documented one was promised:
 * it reads as public. One documented by several components is public when any of them
 * promises it.
 */
export const loadStyles = (settings?: MagmaSettings): Map<string, StyleInfo> => {
  const file = locate('documentation', settings);
  return readJson(
    file,
    (json: { components: DocsComponent[] }) => {
      const styles = new Map<string, StyleInfo>();
      for (const { tag, styles: own = [] } of json.components)
        for (const style of own) {
          const isPublic = style.visibility !== 'internal';
          const known = styles.get(style.name);
          if (known) {
            known.tags.push(tag);
            if (isPublic) known.visibility = 'public';
            if (style.static) known.static = true;
          } else
            styles.set(style.name, {
              name: style.name,
              tags: [tag],
              visibility: isPublic ? 'public' : 'internal',
              static: style.static === true,
            });
        }
      return styles;
    },
    `styles:${file}`,
  );
};

type DtcgNode = { [key: string]: DtcgNode | unknown };

/** The palette families a colour encodes data with, legitimate in UI code (agents/color.md). */
const DATA_FAMILIES = new Set(['label', 'brand']);

/** The custom properties of the raw palette steps: every palette group but label and brand. */
const rawPaletteCss = (base: DtcgNode): Set<string> => {
  const found = new Set<string>();
  const walk = (node: DtcgNode) => {
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$') && key !== '$root') continue;
      if (!child || typeof child !== 'object') continue;
      const css = (child as { $extensions?: Record<string, { css?: string }> }).$extensions?.[
        'it.maggioli.magma'
      ]?.css;
      if ('$value' in child) {
        // the seed is the pure extreme of the mode, documented as a rare knockout
        if (css && !css.endsWith('-seed')) found.add(css);
      } else walk(child as DtcgNode);
    }
  };
  for (const [group, node] of Object.entries((base.palette ?? {}) as DtcgNode))
    if (!group.startsWith('$') && !DATA_FAMILIES.has(group)) walk(node as DtcgNode);
  return found;
};

/** The colour utilities and the raw palette keys of the installed version. */
export const loadPalette = (settings?: MagmaSettings): PaletteInfo => {
  const tokens = locate('tokens', settings);
  const consumption = locate('consumption', settings);
  const rawCss = readJson(tokens, rawPaletteCss);
  return readJson(
    consumption,
    (json: {
      tokens: Record<string, { namespace?: string; key?: string }>;
      namespaces: Record<string, { utilities?: string[] }>;
    }) => ({
      colorUtilities: [...(json.namespaces['--color']?.utilities ?? [])].sort(
        (a, b) => b.length - a.length,
      ),
      rawKeys: new Set(
        Object.entries(json.tokens)
          .filter(([css, token]) => token.namespace === '--color' && rawCss.has(css))
          .map(([, token]) => token.key as string),
      ),
    }),
    `${consumption}|${tokens}`,
  );
};

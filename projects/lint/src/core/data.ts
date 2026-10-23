/*
  The data the rules check against, read from the installed version of Magma, never from a
  list written by hand, so the rules follow the components and the tokens release by
  release:
  - the components, their props and the values each prop takes: the documentation.json of
    @maggioli-design-system/magma;
  - which colour classes are a raw palette step: the DTCG base set of
    @maggioli-design-system/design-tokens (which families are primitives) and the
    consumption map of @maggioli-design-system/styles (the Tailwind key of each token and
    the utilities that take a colour).
  Every file is resolved from the linted project, the way Node resolves an import, and can
  be pointed at in the settings instead. Each one is read once per process.
*/
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

/** Where the data is read from; each path replaces its lookup. */
export interface MagmaSettings {
  /** The directory the packages are resolved from: the linted project by default. */
  root?: string;
  /** The documentation.json of @maggioli-design-system/magma. */
  documentation?: string;
  /** The dist/dtcg/base.tokens.json of @maggioli-design-system/design-tokens. */
  tokens?: string;
  /** The dist/tailwind/consumption.json of @maggioli-design-system/styles. */
  consumption?: string;
}

export interface PropInfo {
  name: string;
  /** The attribute it reflects, when it has one. */
  attr?: string;
  /** A boolean prop: on whenever its attribute is present. */
  boolean: boolean;
  /** Every value it takes, when the type is a closed union of literals; undefined when open. */
  values?: string[];
}

export interface ComponentInfo {
  tag: string;
  /** Every prop, by its name and by its attribute. */
  props: Map<string, PropInfo>;
  /** The component renders a default slot. */
  defaultSlot: boolean;
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
};

const resolveFrom = (dir: string, id: string): string | undefined => {
  try {
    return createRequire(path.join(dir, 'package.json')).resolve(id);
  } catch {
    return undefined;
  }
};

/**
 * The file of `kind`: the path of the settings, else the package resolved from the root, else
 * from the directory of the installed magma (design-tokens and styles are its dependencies,
 * so a package manager may nest them there).
 */
export const locate = (kind: keyof typeof PACKAGE, settings: MagmaSettings = {}): string => {
  const root = settings.root ?? process.cwd();
  const own = settings[kind];
  if (own) return path.resolve(root, own);
  const found = resolveFrom(root, PACKAGE[kind]);
  if (found) return found;
  if (kind !== 'documentation') {
    const magma = resolveFrom(root, PACKAGE.documentation);
    const nested = magma && resolveFrom(path.dirname(path.dirname(magma)), PACKAGE[kind]);
    if (nested) return nested;
  }
  throw new Error(
    `@maggioli-design-system/lint reads ${PACKAGE[kind]} from the installed packages and could not find it from ${root}: install @maggioli-design-system/magma, or set its path in the "${kind}" setting.`,
  );
};

const cache = new Map<string, unknown>();
/** What `build` makes of a JSON file, once per `key` (the file, and what else it depends on). */
const readJson = <T>(file: string, build: (json: never) => T, key = file): T => {
  if (!cache.has(key)) cache.set(key, build(JSON.parse(readFileSync(file, 'utf8')) as never));
  return cache.get(key) as T;
};

interface DocsValue {
  value?: string;
  type: string;
}
interface DocsProp {
  name: string;
  attr?: string;
  values?: DocsValue[];
}
interface DocsComponent {
  tag: string;
  props: DocsProp[];
  slots: Array<{ name: string }>;
}

/** The types a union may hold next to its literals and still be closed. */
const EMPTY = new Set(['undefined', 'null']);

export const propInfo = ({ name, attr, values = [] }: DocsProp): PropInfo => {
  const literals = values.filter((value) => value.value !== undefined);
  const closed =
    literals.length > 0 &&
    values.every((value) => value.value !== undefined || EMPTY.has(value.type));
  return {
    name,
    ...(attr ? { attr } : {}),
    boolean: values.some((value) => value.type === 'boolean'),
    ...(closed ? { values: literals.map((value) => String(value.value)) } : {}),
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

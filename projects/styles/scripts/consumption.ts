import chalk from 'chalk';
import path from 'path';
import postcss from 'postcss';
import { createRequire } from 'module';
import { readFile, readdir, writeFile } from 'fs/promises';
import { __unstable__loadDesignSystem } from 'tailwindcss';
import { DIST_DIR, PROJECT_DIR } from './meta';
import { publishedTokens } from './dtcg/globals';
import type { DtcgGroup } from '../../design-tokens/scripts/dtcg/sets';

/*
  Generate dist/tailwind/consumption.json: how the global tokens are consumed through
  Tailwind 4. For every token (by the custom property design-tokens' and this
  package's dist/dtcg name it with), the `@theme` variable that publishes it, the
  namespace that turns it into utilities and variants, and where another variable
  wins over it; then the spacing multiplier and every `@utility` Magma defines.

  Tailwind itself is the source of the utility side. The script loads Tailwind's
  design system (the API its editor tooling uses) on the entry point the README
  documents, compiles every class and variant it can generate, and records which theme
  variables each one reads. No utility is listed by hand: a renamed token, a new
  `@utility` or another Tailwind release shows up as it is. The API is unstable by
  name, so a Tailwind upgrade that changes it fails here, and the test checks the
  facts the map exists to state.
*/

const require = createRequire(path.join(PROJECT_DIR, 'package.json'));

const TAILWIND_DIR = path.join(DIST_DIR, 'tailwind');
const OUT_FILE = path.join(TAILWIND_DIR, 'consumption.json');
const DTCG_FILES = [
  path.resolve(PROJECT_DIR, '../design-tokens/dist/dtcg/base.tokens.json'),
  path.join(DIST_DIR, 'dtcg', 'globals.tokens.json'),
];

/** The Tailwind entry point of the README: Tailwind's theme and utilities, then Magma's. */
const ENTRY = [
  "@import 'tailwindcss/theme.css' layer(theme);",
  "@import 'tailwindcss/utilities.css' layer(utilities);",
  "@import '@maggioli-design-system/styles/dist/tailwind/theme.css';",
  "@import '@maggioli-design-system/styles/dist/tailwind/typography.css';",
  "@import '@maggioli-design-system/styles/dist/tailwind/utilities.css';",
];
/** The sheet every Magma `@theme` variable is reachable from. */
const THEME_ENTRY = 'theme.css';

const TAILWIND_PACKAGE = path.dirname(require.resolve('tailwindcss/package.json'));
const TAILWIND_VERSION = (require('tailwindcss/package.json') as { version: string }).version;

const resolveId = (id: string, base: string): string =>
  id.startsWith('.') || path.isAbsolute(id)
    ? path.resolve(base, id)
    : require.resolve(id === 'tailwindcss' ? 'tailwindcss/index.css' : id, { paths: [base] });

const PACKAGE_NAME = (require(path.join(PROJECT_DIR, 'package.json')) as { name: string }).name;

const importedFile = (params: string): string | undefined => /^['"]([^'"]+)['"]/.exec(params)?.[1];

/** A stylesheet of this build, and the specifier a consumer imports it by. */
interface Sheet {
  file: string;
  specifier: string;
}

const sheetOf = (name: string): Sheet => ({
  file: path.join(TAILWIND_DIR, name),
  specifier: `${PACKAGE_NAME}/${path.relative(PROJECT_DIR, path.join(TAILWIND_DIR, name)).split(path.sep).join('/')}`,
});

/**
 * Every Magma stylesheet a sheet pulls in (`@import`, `@reference`), itself first, each
 * with the specifier it is imported by: the one written in the `@import`, or the
 * importer's own one for a relative path. Tailwind's own files are left out.
 */
const closure = async (sheet: Sheet, seen = new Set<string>()): Promise<Sheet[]> => {
  if (seen.has(sheet.file) || sheet.file.startsWith(TAILWIND_PACKAGE)) return [];
  seen.add(sheet.file);
  const sheets = [sheet];
  const nested: Sheet[] = [];
  postcss
    .parse(await readFile(sheet.file, 'utf8'), { from: sheet.file })
    .walkAtRules(/^(import|reference)$/, (rule) => {
      const id = importedFile(rule.params);
      if (!id) return;
      const relative = id.startsWith('.');
      nested.push({
        file: resolveId(id, path.dirname(sheet.file)),
        specifier: relative ? path.posix.join(path.posix.dirname(sheet.specifier), id) : id,
      });
    });
  for (const next of nested) sheets.push(...(await closure(next, seen)));
  return sheets;
};

interface ThemeVariable {
  name: string;
  value: string;
}

interface UtilitySource {
  name: string;
  sources: string[];
  apply: string[];
}

/** One theme variable read by a class or variant: its namespace and key when Tailwind looked it up by one. */
interface Hit {
  variable: string;
  namespace?: string;
  key?: string | null;
  /** The namespace and key come from the class name, not from a lookup. */
  inferred?: boolean;
}

/**
 * Load the design system with a spy on its theme: while `hits` is an array, every
 * theme variable a lookup returns is pushed to it. `transform` rewrites a Magma
 * stylesheet before Tailwind reads it.
 */
const loadDesignSystem = async (transform: (css: string) => string = (css) => css) => {
  const ds = await __unstable__loadDesignSystem(ENTRY.join('\n'), {
    base: PROJECT_DIR,
    async loadStylesheet(id: string, base: string) {
      const file = resolveId(id, base);
      const content = await readFile(file, 'utf8');
      return {
        path: file,
        base: path.dirname(file),
        content: file.startsWith(TAILWIND_PACKAGE) ? content : transform(content),
      };
    },
  });

  const spy: { hits: Hit[] | null; namespaces: Set<string> } = {
    hits: null,
    namespaces: new Set(),
  };
  const theme = ds.theme as unknown as Record<string, (...args: unknown[]) => unknown> & {
    values: Map<string, unknown>;
  };
  const lookup = (value: unknown, keys: unknown): Hit | undefined => {
    for (const namespace of keys as string[]) {
      spy.namespaces.add(namespace);
      const variable = value === null || value === undefined ? namespace : `${namespace}-${value}`;
      if (theme.values.has(variable))
        return { variable, namespace, key: (value as string | null | undefined) ?? null };
    }
    return undefined;
  };
  const wrap = (method: string, hit: (args: unknown[]) => Hit | undefined, always = false) => {
    const original = theme[method].bind(ds.theme);
    theme[method] = (...args: unknown[]) => {
      const result = original(...args);
      if (spy.hits && (always || (result !== null && result !== undefined))) {
        const found = hit(args);
        if (found) spy.hits.push(found);
      }
      return result;
    };
  };
  wrap('markUsedVariable', ([variable]) => ({ variable: variable as string }), true);
  wrap('get', ([keys]) => {
    const variable = (keys as string[]).find((key) => theme.values.has(key));
    return variable ? { variable } : undefined;
  });
  for (const method of ['resolve', 'resolveValue', 'resolveWith'])
    wrap(method, ([value, keys]) => lookup(value, keys));

  /** Compile one class (or `variant:flex`) and return the theme variables it read. */
  const read = (candidate: string): { css: string | null; hits: Hit[] } => {
    spy.hits = [];
    const [css] = ds.candidatesToCss([candidate]);
    const hits = spy.hits.filter(({ variable }) => !variable.startsWith('--tw-'));
    spy.hits = null;
    return { css, hits };
  };

  return { ds, read, namespaces: spy.namespaces, has: (name: string) => theme.values.has(name) };
};

const NUMERIC = /^\d+(\.\d+)?$/;
const LENGTH = /^(\s*)(--[a-z0-9-]+)(\s*:\s*)(-?\d*\.?\d+(?:px|rem))(\s*;)/gm;
/** A sub-property of a theme variable, Tailwind's `--<variable>--<property>`. */
const SUB_PROPERTY = /^(--.+?)--([a-z][a-z-]*)$/;

const byName = (a: string, b: string) => a.localeCompare(b);

const main = async (): Promise<void> => {
  // --- the tokens, by custom property ------------------------------------------------
  const tokenNames = new Set<string>();
  // what each token is for, when its source says it: the semantic roles all have one (#876)
  const descriptions = new Map<string, string>();
  for (const file of DTCG_FILES)
    for (const [name, published] of publishedTokens(
      JSON.parse(await readFile(file, 'utf8')) as DtcgGroup,
    )) {
      tokenNames.add(name);
      if (published?.$description) descriptions.set(name, published.$description);
    }

  // --- what Magma puts in the theme, and the @utility it defines ---------------------
  const themeVariables: ThemeVariable[] = [];
  for (const { file } of await closure(sheetOf(THEME_ENTRY)))
    postcss.parse(await readFile(file, 'utf8'), { from: file }).walkAtRules('theme', (rule) =>
      rule.walkDecls(/^--/, (decl) => {
        themeVariables.push({ name: decl.prop, value: decl.value.replace(/\s+/g, ' ').trim() });
      }),
    );
  const magma = new Map(themeVariables.map((variable) => [variable.name, variable]));

  const utilitySources = new Map<string, UtilitySource>();
  const scanned = new Set<string>();
  const sheets = (await readdir(TAILWIND_DIR)).filter((file) => file.endsWith('.css')).sort();
  for (const name of sheets)
    for (const { file, specifier } of await closure(sheetOf(name))) {
      if (scanned.has(file)) continue;
      scanned.add(file);
      postcss.parse(await readFile(file, 'utf8'), { from: file }).walkAtRules('utility', (rule) => {
        const name = rule.params.trim();
        if (name.endsWith('-*'))
          throw new Error(`${specifier}: functional @utility ${name} is not modelled`);
        const entry = utilitySources.get(name) ?? { name, sources: [], apply: [] };
        if (!entry.sources.includes(specifier)) entry.sources.push(specifier);
        rule.walkAtRules('apply', (apply) => {
          entry.apply.push(...apply.params.trim().split(/\s+/));
        });
        utilitySources.set(name, entry);
      });
    }

  /**
   * The theme variable another one republishes whole, under the namespace of other
   * utilities: `--max-width-2xl: var(--container-2xl)` makes `max-w-2xl` read the
   * container instead of the spacing step (#1057). It is an alias of that token.
   */
  const aliasOf = ({ name, value }: ThemeVariable): string | undefined => {
    const target = /^var\((--[a-z0-9-]+)\)$/.exec(value)?.[1];
    return target && target !== name && magma.has(target) ? target : undefined;
  };
  const aliases = new Map<string, string[]>();
  for (const variable of themeVariables) {
    const target = aliasOf(variable);
    if (target) aliases.set(target, [...(aliases.get(target) ?? []), variable.name]);
  }
  /** A theme variable that holds a CSS keyword, no token: `--max-width-none: none`. */
  const isKeyword = ({ name, value }: ThemeVariable): boolean =>
    !tokenNames.has(name) && /^[a-z]+(-[a-z]+)*$/.test(value);

  /** The token a theme variable publishes: itself, or the one its value wraps. */
  const tokenOf = ({ name, value }: ThemeVariable): string => {
    if (tokenNames.has(name)) return name;
    const wrapped = [...value.matchAll(/var\((--[a-z0-9-]+)/g)].map((match) => match[1]);
    const token = wrapped.find((candidate) => tokenNames.has(candidate));
    if (!token) throw new Error(`@theme ${name}: ${value} publishes no token of dist/dtcg`);
    return token;
  };

  // --- every class and variant Tailwind can generate, and what it reads ---------------
  const tailwind = await loadDesignSystem();
  const { ds, read } = tailwind;

  /**
   * What a class reads, with the namespace and key of each variable. Tailwind gives them
   * when it looks a variable up by namespace. A variable it reads whole (a shadow, which
   * it inlines) takes them from the class's named value, but only when the class parses
   * one way: `text-title-h1` is a Magma @utility and also the `text` root with
   * `title-h1`, and that second reading would invent a `--text-size` namespace.
   */
  const compiled = new Map<string, { css: string | null; hits: Hit[] }>();
  const compile = (candidate: string) => {
    let result = compiled.get(candidate);
    if (!result) {
      const { css, hits } = read(candidate);
      const parsed = ds.parseCandidate(candidate);
      const only =
        parsed.length === 1 && parsed[0].kind === 'functional' && parsed[0].value?.kind === 'named'
          ? parsed[0].value.value
          : undefined;
      result = {
        css,
        hits: hits.map((hit) =>
          hit.namespace || !only || !hit.variable.endsWith(`-${only}`)
            ? hit
            : {
                ...hit,
                namespace: hit.variable.slice(0, -(only.length + 1)),
                key: only,
                inferred: true,
              },
        ),
      };
      compiled.set(candidate, result);
    }
    return result;
  };

  /** namespace -> the utility roots / variant patterns that read a Magma variable of it. */
  const roots = new Map<string, Set<string>>();
  const patterns = new Map<string, Set<string>>();
  type Place = { namespace: string; key: string | null };
  /** Magma variable -> its namespace and key: as Tailwind looked it up, then as inferred. */
  const looked = new Map<string, Place>();
  const inferred = new Map<string, Place>();
  const add = (into: Map<string, Set<string>>, namespace: string, value: string) =>
    (into.get(namespace) ?? into.set(namespace, new Set()).get(namespace))!.add(value);
  const place = ({ variable, namespace, key, inferred: guess }: Hit) => {
    const into = guess ? inferred : looked;
    if (namespace && !into.has(variable)) into.set(variable, { namespace, key: key ?? null });
  };

  for (const [name] of ds.getClassList())
    for (const hit of compile(name).hits) {
      if (!hit.namespace || !magma.has(hit.variable)) continue;
      place(hit);
      if (hit.key && name.endsWith(`-${hit.key}`))
        add(roots, hit.namespace, name.slice(0, -(hit.key.length + 1)));
    }

  const statics: string[] = [];
  for (const { name, values, hasDash, isArbitrary } of ds.getVariants()) {
    if (isArbitrary && !values.length) continue;
    if (!values.length) {
      statics.push(name);
      continue;
    }
    const prefix = `${name}${hasDash ? '-' : ''}`;
    for (const value of values)
      for (const hit of compile(`${prefix}${value}:flex`).hits) {
        if (!hit.namespace || !magma.has(hit.variable) || hit.key !== value) continue;
        place(hit);
        add(patterns, hit.namespace, `${prefix}*`);
      }
  }

  // A static variant (a breakpoint: `tablet:`) holds the value inline, read when the
  // design system was built. To see which variable it comes from, build it again with
  // every Magma length replaced by a value no other variable has, and look for it.
  const sentinels = new Map<string, string>();
  const tainted = await loadDesignSystem((css) =>
    css.replace(
      LENGTH,
      (match, indent: string, name: string, colon: string, _value: string, end: string) => {
        if (!magma.has(name)) return match;
        const sentinel = `${70000 + sentinels.size}.77px`;
        sentinels.set(sentinel, name);
        return `${indent}${name}${colon}${sentinel}${end}`;
      },
    ),
  );
  const known = [...tailwind.namespaces].sort((a, b) => b.length - a.length);
  const namespaceByPrefix = (variable: string) =>
    known.find((namespace) => variable === namespace || variable.startsWith(`${namespace}-`));
  for (const name of statics) {
    const { css } = tainted.read(`${name}:flex`);
    const hits: Hit[] = [];
    for (const [sentinel, variable] of sentinels) {
      if (!css?.includes(sentinel)) continue;
      const namespace = namespaceByPrefix(variable);
      const key = namespace ? variable.slice(namespace.length + 1) : '';
      hits.push(namespace && key ? { variable, namespace, key } : { variable });
      if (!namespace || !key) continue;
      place({ variable, namespace, key });
      add(patterns, namespace, name === key ? '*' : name.replace(key, '*'));
    }
    compiled.set(`${name}:flex`, { css, hits });
  }

  // --- the tokens ----------------------------------------------------------------------
  interface TokenEntry {
    theme: string;
    description?: string;
    namespace: string | null;
    key?: string | null;
    property?: string;
    aliases?: string[];
    shadowed?: Record<string, string | null>;
  }
  interface KeywordEntry {
    value: string;
    namespace: string | null;
    key?: string | null;
  }
  const tokens: Record<string, TokenEntry> = {};
  const keywords: Record<string, KeywordEntry> = {};
  for (const variable of themeVariables) {
    if (aliasOf(variable)) continue;
    if (isKeyword(variable)) {
      const at = looked.get(variable.name);
      keywords[variable.name] = {
        value: variable.value,
        namespace: at?.namespace ?? null,
        ...(at ? { key: at.key } : {}),
      };
      continue;
    }
    const token = tokenOf(variable);
    if (tokens[token])
      throw new Error(`${token} is published as ${tokens[token].theme} and ${variable.name}`);
    const sub = SUB_PROPERTY.exec(variable.name);
    const base = sub && magma.has(sub[1]) ? sub[1] : undefined;
    const own = base ?? variable.name;
    let at = looked.get(own) ?? inferred.get(own);
    if (!at && !base) {
      const namespace = namespaceByPrefix(variable.name);
      if (namespace) at = { namespace, key: variable.name.slice(namespace.length + 1) || null };
    }
    const entry: TokenEntry = {
      theme: variable.name,
      ...(descriptions.has(token) ? { description: descriptions.get(token) } : {}),
      namespace: at?.namespace ?? null,
    };
    if (at) entry.key = at.key;
    if (base && sub) entry.property = sub[2];
    if (aliases.has(variable.name)) entry.aliases = [...aliases.get(variable.name)!].sort(byName);

    // where the class or variant this token would give reads another variable instead
    // (an alias of the token is the token)
    if (at?.key && !base) {
      const { namespace, key } = at;
      const shadowed: Record<string, string | null> = {};
      const published = new Set([variable.name, ...(entry.aliases ?? [])]);
      const check = (slot: string, candidate: string) => {
        const { hits } = compile(candidate);
        if (hits.some((hit) => published.has(hit.variable))) return;
        shadowed[slot] =
          hits.find((hit) => hit.key === key && hit.namespace !== namespace)?.variable ?? null;
      };
      for (const root of roots.get(namespace) ?? []) check(root, `${root}-${key}`);
      for (const pattern of patterns.get(namespace) ?? [])
        check(pattern, `${pattern.replace('*', key)}:flex`);
      if (Object.keys(shadowed).length)
        entry.shadowed = Object.fromEntries(
          Object.entries(shadowed).sort(([a], [b]) => byName(a, b)),
        );
    }
    tokens[token] = entry;
  }

  const namespaces: Record<string, { utilities: string[]; variants: string[] }> = {};
  for (const { namespace } of [...Object.values(tokens), ...Object.values(keywords)])
    if (namespace && !namespaces[namespace])
      namespaces[namespace] = {
        utilities: [...(roots.get(namespace) ?? [])].sort(byName),
        variants: [...(patterns.get(namespace) ?? [])].sort(byName),
      };

  // --- spacing: the multiplier, and the keys and steps of its namespace ----------------
  const spacing = magma.get('--spacing');
  if (!spacing) throw new Error('No --spacing in the Magma theme');
  const stepRoots = new Set<string>();
  for (const [name, { css }] of compiled) {
    if (!css?.includes(`var(${spacing.name})`)) continue;
    for (const parsed of ds.parseCandidate(name))
      if (
        parsed.kind === 'functional' &&
        parsed.value?.kind === 'named' &&
        NUMERIC.test(parsed.value.value)
      )
        stepRoots.add(name.slice(0, -(parsed.value.value.length + 1)));
  }
  const spacingKeys = Object.values(tokens).flatMap(({ namespace, key, property }) =>
    namespace === spacing.name && key && !property ? [key] : [],
  );

  // --- the @utility Magma defines --------------------------------------------------------
  const themeToToken = new Map(Object.entries(tokens).map(([token, { theme }]) => [theme, token]));
  const utilities: Record<string, unknown> = {};
  for (const { name, sources, apply } of utilitySources.values()) {
    const { css, hits } = read(name);
    if (!css) throw new Error(`@utility ${name} compiles to nothing`);
    const root = postcss.parse(css);
    root.walkAtRules('property', (rule) => {
      rule.remove();
    });
    const variables = [
      ...hits.map((hit) => hit.variable),
      ...[...css.matchAll(/var\((--[a-z0-9-]+)/g)].map((match) => match[1]),
    ].filter(
      (variable, index, all) => !variable.startsWith('--tw-') && all.indexOf(variable) === index,
    );
    const used = variables.flatMap((variable) => {
      const token = themeToToken.get(variable) ?? (tokenNames.has(variable) ? variable : undefined);
      return token ? [token] : [];
    });
    utilities[name] = {
      source: sources.length === 1 ? sources[0] : sources,
      ...(apply.length ? { apply } : {}),
      tokens: [...new Set(used)],
      // Tailwind's own theme variables it reads (`font-black` is --font-weight-black)
      theme: variables.filter(
        (variable) =>
          !themeToToken.has(variable) && !tokenNames.has(variable) && tailwind.has(variable),
      ),
      css: root.toString().trim(),
    };
  }

  const map = {
    description:
      'How the global tokens of Magma are consumed through Tailwind 4. tokens: by the custom property dist/dtcg names them with, the @theme variable that publishes each one, its namespace and key, the @theme variables that republish it for the utilities of another namespace (aliases), and where a class or variant of that namespace reads another variable instead. keywords: the @theme variables that hold a CSS keyword, no token. namespaces: the utility roots (<root>-<key>) and variant patterns (* is the key) that read the namespace. Generated from the Tailwind design system of the entry point below; do not edit.',
    tailwind: TAILWIND_VERSION,
    entry: ENTRY,
    tokens,
    keywords,
    namespaces,
    spacing: {
      multiplier: spacing.name,
      value: spacing.value,
      utilities: [...stepRoots].sort(byName),
      keys: spacingKeys.filter((key) => !NUMERIC.test(key)),
      steps: spacingKeys.filter((key) => NUMERIC.test(key)),
    },
    utilities,
  };

  await writeFile(OUT_FILE, `${JSON.stringify(map, null, 2)}\n`, 'utf8');
  console.info(
    chalk.green(
      `[consumption] ${Object.keys(tokens).length} tokens, ${Object.keys(namespaces).length} namespaces, ` +
        `${Object.keys(utilities).length} @utility -> ${path.relative(process.cwd(), OUT_FILE)}`,
    ),
  );
};

main().catch((error) => {
  console.error(chalk.red(error instanceof Error ? (error.stack ?? error.message) : String(error)));
  process.exitCode = 1;
});

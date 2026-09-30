import path from 'path';
import postcss, { Declaration } from 'postcss';
import { BUILD_DIR, PROJECT_DIR } from './meta';
import { mkdir, readFile, readdir, writeFile } from 'fs/promises';
import { logFileSavedTo } from '../../../scripts/log';

/*
  Generate the single stylesheet an editor reads to autocomplete Magma tokens.

  Why a dedicated file at all: editor tooling discovers custom properties by walking
  DECLARATIONS, so an `@property` registration - which is how every `--mds-*` component
  token and the `--magma-pref-*` switches are published - gives a working token in the
  browser and nothing in the IDE.

  Why ONE file rather than pointing the editor at the real stylesheets: the token layer
  ships the same names several times over (design-tokens/dist/css is copied into
  styles/dist/css, and every scale exists both as `:root` and as an `@theme` bridge), and
  editors dedupe per file, not across files. Pointing at the sources therefore yields four
  to eight completion entries per token. One generated file makes duplicates impossible by
  construction, and puts the ORDER of the list under our control: editors that keep the
  provider's order (CSS Var Complete with `cssvar.disableSort`) then show each scale from
  its smallest step up.

  Two properties of the output that are not cosmetic:
  - every value is collapsed onto one line. CSS Var Complete resolves values with
    `/var\s*\((.*?)\)/`, whose `.` does not cross newlines, so a multi-line `var()` is a
    fixed point and its resolver recurses until `RangeError: Maximum call stack size
    exceeded`. Prettier wraps ~99 of the component declarations exactly that way.
  - the declarations sit inside a query that can never match. A plain `:root` block would,
    if anyone ever imported the file, pin every token to its light-theme value at the
    highest-priority origin and freeze theming; the selector stays `:root` for editors
    that index by selector rather than by declaration.
*/

const TOKENS_CSS_DIR = path.resolve(PROJECT_DIR, '../design-tokens/dist/css');
const BUILD_CSS_DIR = path.resolve(BUILD_DIR, 'css');
const SOURCE_CSS_DIR = path.resolve(PROJECT_DIR, 'css');
const COMPONENTS_DIR = path.resolve(PROJECT_DIR, '../stencil/src/components');
const PROPERTIES_CSS = path.resolve(BUILD_CSS_DIR, 'properties.css');
const PROPERTY_SUFFIX = '-property.css';
const OUT_FILE = path.resolve(BUILD_CSS_DIR, 'tokens.editor.css');

interface Source {
  group: string;
  /** A stylesheet to read every custom property from. */
  file?: string;
  /** Use the file's own one-line comments as sub-headings. */
  subgroups?: boolean;
  /** Collect the group programmatically instead of from a single file. */
  collect?: () => Promise<Token[]>;
}

/*
  Order matters twice: it is the order of the completion list, and the first occurrence of
  a name wins, so the file that owns a token comes before any file that restates it. What
  is deliberately absent: the `colors-hex-*` sheets (the same palette in a second format),
  the `tailwind-theme-*` bridges (the same names again inside `@theme`, and Tailwind
  IntelliSense already completes those) and anything under dist/ (generated copies).
*/
const SOURCES: Source[] = [
  { file: path.join(TOKENS_CSS_DIR, 'typography.css'), group: 'scale' },
  { file: path.join(TOKENS_CSS_DIR, 'transitions.css'), group: 'motion' },
  { file: path.join(TOKENS_CSS_DIR, 'colors-rgb.css'), group: 'palette' },
  { file: path.join(BUILD_CSS_DIR, 'semantic.css'), group: 'semantic' },
  { file: path.join(BUILD_CSS_DIR, 'themes.css'), group: 'semantic: theme variants' },
  { file: path.join(SOURCE_CSS_DIR, 'globals.css'), group: 'globals' },
  { file: path.join(SOURCE_CSS_DIR, 'theme.css'), group: 'globals: theme' },
  { group: 'component', collect: () => collectComponents() },
];

interface Token {
  name: string;
  value: string;
  subgroup: string;
}

const oneLine = (value: string): string => value.replace(/\s+/g, ' ').trim();

/*
  A palette token holds a bare rgb triplet (`112 85 4`), because it is meant to be read
  as `rgb(var(--label-yellow-03))`. No editor can preview that: a triplet is not a color,
  the color only exists once rgb() wraps it, and VS Code's own color support returns
  nothing for `rgb(var(--x))` even when the token is declared in the same file. Wrapping
  the triplet HERE, in a file no browser ever loads, is what gives the whole palette a
  real swatch in the completion list and on hover. The token's own value is still the
  triplet - this file is a view for editors, and its header says so.
*/
const TRIPLET = /^\d{1,3} \d{1,3} \d{1,3}$/;

const previewable = (value: string): string => (TRIPLET.test(value) ? `rgb(${value})` : value);

const collect = async (source: Source): Promise<Token[]> => {
  const file = source.file as string;
  const root = postcss.parse(await readFile(file, 'utf8'), { from: file });
  const tokens: Token[] = [];
  let subgroup = '';

  const pushDeclaration = (decl: Declaration): void => {
    if (decl.prop.startsWith('--')) {
      tokens.push({ name: decl.prop, value: oneLine(decl.value), subgroup });
    }
  };

  // An @property registration carries the name in its params and the value in its
  // initial-value; a registration with neither is not a token an editor can offer.
  const pushRegistration = (params: string, initialValue: string): void => {
    const name = params.trim();
    if (name.startsWith('--')) {
      tokens.push({ name, value: oneLine(initialValue), subgroup });
    }
  };

  for (const node of root.nodes) {
    if (node.type === 'comment') {
      // The generated sheets open with a multi-line provenance header; only the short
      // one-line markers (`/* mds-accordion-item */`) are meant as headings.
      if (source.subgroups === true && !node.text.includes('\n')) {
        subgroup = node.text.trim();
      }
      continue;
    }

    if (node.type === 'atrule' && node.name === 'property') {
      let initialValue = '';
      node.walkDecls('initial-value', (decl) => {
        initialValue = decl.value;
      });
      pushRegistration(node.params, initialValue);
      continue;
    }

    // Rules, @media, @layer, @theme: the declarations can be at any depth, and a
    // registration can be nested too (theme.css keeps one next to its rules).
    node.walkAtRules('property', (atRule) => {
      let initialValue = '';
      atRule.walkDecls('initial-value', (decl) => {
        initialValue = decl.value;
      });
      pushRegistration(atRule.params, initialValue);
    });
    node.walkDecls(pushDeclaration);
  }

  return tokens;
};

/** Every `.css` under a directory tree. */
const collectCssFiles = async (dir: string): Promise<string[]> => {
  const found: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await collectCssFiles(full)));
    } else if (entry.isFile() && entry.name.endsWith('.css')) {
      found.push(full);
    }
  }
  return found;
};

/*
  The component tokens, grouped by the component that owns them, from BOTH places they
  are published: the `@property` registrations (whose default properties.ts has already
  resolved to a literal, which is what gives an editor a color swatch) and the plain
  declarations a component makes on its own `:host` - two thirds of the surface is
  registered, the rest only declared, and a completion list needs all of it.

  `--private-*` is deliberately left out: it is a component's internal wiring, not part
  of its contract, and it is declared in the very file that uses it, where the editor's
  own same-document completion already offers it.
*/
const collectComponents = async (): Promise<Token[]> => {
  const registered = new Map<string, Map<string, string>>();
  const properties = postcss.parse(await readFile(PROPERTIES_CSS, 'utf8'), {
    from: PROPERTIES_CSS,
  });
  let component = '';
  for (const node of properties.nodes) {
    if (node.type === 'comment' && !node.text.includes('\n')) {
      component = node.text.trim();
      continue;
    }
    if (node.type === 'atrule' && node.name === 'property') {
      let initialValue = '';
      node.walkDecls('initial-value', (decl) => {
        initialValue = decl.value;
      });
      const name = node.params.trim();
      if (name.startsWith('--')) {
        const owned = registered.get(component) ?? new Map<string, string>();
        owned.set(name, oneLine(initialValue));
        registered.set(component, owned);
      }
    }
  }

  const declared = new Map<string, Map<string, string>>();
  const components = (await readdir(COMPONENTS_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  for (const name of components) {
    const owned = new Map<string, string>();
    for (const file of (await collectCssFiles(path.join(COMPONENTS_DIR, name))).sort()) {
      if (file.endsWith(PROPERTY_SUFFIX)) {
        continue;
      }
      postcss.parse(await readFile(file, 'utf8'), { from: file }).walkDecls((decl) => {
        if (decl.prop.startsWith('--mds-') && !owned.has(decl.prop)) {
          owned.set(decl.prop, oneLine(decl.value));
        }
      });
    }
    declared.set(name, owned);
  }

  const tokens: Token[] = [];
  for (const name of [...new Set([...components, ...registered.keys()])].sort()) {
    const merged = new Map<string, string>([
      ...(registered.get(name) ?? new Map<string, string>()),
      // A registered default is a literal; a declaration is the live var() chain. Keep
      // the literal where both exist, so the value shown is a value.
      ...[...(declared.get(name) ?? new Map<string, string>())].filter(
        ([token]) => registered.get(name)?.has(token) !== true,
      ),
    ]);
    for (const [token, value] of merged) {
      tokens.push({ name: token, value, subgroup: name });
    }
  }
  return tokens;
};

const NUMERIC = /^(-?\d*\.?\d+)([a-z%]*)$/i;

/**
 * The family a token belongs to: its name without the last segment, so `--radius-md` and
 * `--radius-full` share one, and `--tone-neutral-01` sits with the rest of its ramp.
 */
const familyOf = (name: string): string => name.slice(0, name.lastIndexOf('-'));

/**
 * Sort one family by value, ascending - but only when every member is a bare number in
 * the same unit. A family that mixes units, or holds colors, keyword values or `var()`
 * chains, has no meaningful numeric order, so it keeps the order the design system
 * declares it in (which is the ramp order for the palettes).
 */
const byValue = (family: Token[]): Token[] => {
  if (family.length < 2) {
    return family;
  }
  const parsed = family.map((token) => NUMERIC.exec(token.value));
  if (parsed.some((match) => match === null)) {
    return family;
  }
  const unit = parsed[0]![2];
  if (parsed.some((match) => match![2] !== unit)) {
    return family;
  }
  return family
    .map((token, index) => ({ token, size: parseFloat(parsed[index]![1]) }))
    .sort((a, b) => a.size - b.size)
    .map((entry) => entry.token);
};

/**
 * Split a source's tokens into consecutive runs of the same subgroup and family, sort
 * each run, and keep the runs where they were. Families are never reordered against each
 * other: their order is the design system's own.
 */
const ordered = (tokens: Token[]): Token[] => {
  const out: Token[] = [];
  let run: Token[] = [];
  for (const token of tokens) {
    const head = run[0];
    if (
      head !== undefined &&
      (head.subgroup !== token.subgroup || familyOf(head.name) !== familyOf(token.name))
    ) {
      out.push(...byValue(run));
      run = [];
    }
    run.push(token);
  }
  out.push(...byValue(run));
  return out;
};

const HEADER = [
  '/*',
  '  GENERATED - do not edit, and do not import: this file is for editors, not for the',
  '  browser. It is the single source to point an editor at, so that every Magma token',
  '  appears exactly once in a var() completion, in scale order, with its value.',
  '',
  '  One deliberate difference from the real stylesheets: a palette token whose value is',
  '  a bare rgb triplet is written here as rgb(<triplet>), so that editors can show its',
  '  actual color. The token itself still holds the triplet, to be read as',
  '  rgb(var(--label-yellow-03)).',
  '',
  '  With CSS Var Complete (phoenisx.cssvar):',
  '    "cssvar.files": [',
  '      "node_modules/@maggioli-design-system/styles/dist/css/tokens.editor.css"',
  '    ],',
  '    "cssvar.ignore": [],',
  '    "cssvar.disableSort": true',
  '',
  '  Source: projects/styles/scripts/editor-tokens.ts.',
  '*/',
  '@media not all {',
  '  :root {',
].join('\n');

const main = async (): Promise<void> => {
  const emitted = new Set<string>();
  const chunks: string[] = [];
  let heading = '';

  for (const source of SOURCES) {
    const collected = source.collect !== undefined ? await source.collect() : await collect(source);
    const tokens = ordered(collected).filter((token) => {
      if (emitted.has(token.name)) {
        return false;
      }
      emitted.add(token.name);
      return true;
    });

    for (const token of tokens) {
      const label = token.subgroup === '' ? source.group : `${source.group}: ${token.subgroup}`;
      if (label !== heading) {
        chunks.push(`${chunks.length === 0 ? '' : '\n'}    /* ${label} */`);
        heading = label;
      }
      chunks.push(`    ${token.name}: ${previewable(token.value)};`);
    }
  }

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, `${HEADER}\n${chunks.join('\n')}\n  }\n}\n`, 'utf8');
  await logFileSavedTo(OUT_FILE, OUT_FILE);
  console.log(`[editor-tokens] ${emitted.size} tokens, one entry each.`);
};

main();

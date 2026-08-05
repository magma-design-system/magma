import chalk from 'chalk';
import path from 'path';
import postcss, { Declaration, Rule } from 'postcss';
import { BUILD_DIR, PROJECT_DIR } from './meta';
import { mkdir, readFile, readdir, writeFile } from 'fs/promises';
import { logFileSavedTo } from '../../../scripts/log';

/*
  Aggregate the document-level `@property` registrations for the component custom
  properties (`--mds-*`) into a single stylesheet shipped with globals.css.

  The registrations are authored NEXT TO THE COMPONENT they belong to, as
  `<component>/css/<component>-property.css` under the stencil project: they are part of
  the component's contract, so they have to live and be reviewed with it. This step
  collects them.

  Why they cannot simply stay in the component's own CSS: an `@property` rule inside
  a shadow root registers nothing (the registration map is document-wide and browsers
  ignore shadow-tree rules), and all Magma components are `shadow: true`. So the
  registrations have to ship in a stylesheet the DOCUMENT loads, which is globals.css.

  Why this step rewrites them: a registration is only valid when its `initial-value`
  is computationally independent, i.e. free of `var()`. The authored sources keep the
  readable token references and this step resolves them down to literals.

  Anything that cannot be resolved is a hard error: shipping the rule unresolved
  would make the whole registration silently invalid, which is exactly the failure
  mode this pipeline exists to remove.

  NOTE ON THE DEPENDENCY DIRECTION: this reads stencil SOURCES, never its build
  output, so it does not turn into a task dependency (stencil already depends on
  styles - the reverse would be a cycle). The files are declared as inputs of the
  styles build in project.json so the Nx cache still invalidates when they change.
*/

const COMPONENTS_DIR = path.resolve(PROJECT_DIR, '../stencil/src/components');
const PROPERTY_SUFFIX = '-property.css';
const TOKENS_CSS_DIR = path.resolve(PROJECT_DIR, '../design-tokens/dist/css');
const SEMANTIC_CSS = path.resolve(BUILD_DIR, 'css', 'semantic.css');
// The registrations end up appended to this very file, so anything it declares
// (--magma-modal-z-index, --magma-selection-*, ...) is in scope for them.
const GLOBALS_CSS = path.resolve(PROJECT_DIR, 'css', 'globals.css');
const OUT_FILE = path.resolve(BUILD_DIR, 'css', 'properties.css');

const MAX_DEPTH = 12;

type Tokens = Record<string, string>;

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
const buildLookup = async (files: string[]): Promise<Tokens> => {
  const preferred: Tokens = {};
  const anyValue: Tokens = {};
  for (const file of files) {
    const root = postcss.parse(await readFile(file, 'utf8'), { from: file });
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

const collectCss = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.css'))
    .map((e) => path.join(dir, e.name));
};

/**
 * Every `.css` under a directory tree.
 */
const collectAllCss = async (dir: string): Promise<string[]> => {
  const found: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await collectAllCss(full)));
    } else if (entry.isFile() && entry.name.endsWith('.css')) {
      found.push(full);
    }
  }
  return found;
};

/**
 * Every `<component>/css/<component>-property.css`, sorted so the emitted sheet is
 * stable across builds.
 */
const collectPropertySources = async (dir: string): Promise<string[]> =>
  (await collectAllCss(dir)).filter((file) => file.endsWith(PROPERTY_SUFFIX)).sort();

/*
  `initial-value` must be computationally independent, and no font- or viewport-relative
  unit is: Chrome accepts `2px` and drops the entire registration for `0.5rem`. The
  spacing scale is authored in rem, so fold it against the root font size, which Magma
  never overrides. This only reshapes the DEFAULT: a declaration is free to stay in rem,
  and by construction these defaults apply nowhere, since a property is only registered
  when its component sets it on a bare :host. Units that depend on the element rather
  than the root (em, ch, lh) or on the viewport cannot be folded at all, so they are
  reported instead of guessed at.
*/
const ROOT_FONT_SIZE = 16;

const foldRem = (value: string): string =>
  value.replace(
    /(-?\d*\.?\d+)rem\b/g,
    (_, count: string) => `${parseFloat((parseFloat(count) * ROOT_FONT_SIZE).toFixed(4))}px`,
  );

const RELATIVE_UNIT =
  /-?\d*\.?\d+(em|ex|ch|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax|svw|svh|lvw|lvh|dvw|dvh|cq[a-z]+)\b/i;

/**
 * Tailwind's `--spacing(n)` helper is not available here (this sheet never goes
 * through Tailwind), so fold it into a literal using the `--spacing` token, the
 * same way Tailwind would: `calc(var(--spacing) * n)`.
 */
const foldSpacing = (value: string, unit: string): string =>
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

const resolve = (value: string, lookup: Tokens, spacingUnit: string, depth = 0): string => {
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

const main = async () => {
  const tokenFiles = await collectCss(TOKENS_CSS_DIR);
  const lookup = await buildLookup([...tokenFiles, SEMANTIC_CSS, GLOBALS_CSS]);
  const spacingUnit = lookup['spacing'] ?? '0.0025rem';

  const sources = await collectPropertySources(COMPONENTS_DIR);
  const unresolved: string[] = [];
  const relative: string[] = [];
  const importedBy: string[] = [];
  const chunks: string[] = [];

  // No component stylesheet may @import a -property.css: Stencil would inline it
  // into the shadow root, where the registration is inert again and lightningcss
  // starts dropping it. Cheap guard, because these files now sit in the component's
  // css/ dir next to the ones that ARE imported.
  const propertyNames = sources.map((file) => path.basename(file));
  for (const stylesheet of await collectAllCss(COMPONENTS_DIR)) {
    if (stylesheet.endsWith(PROPERTY_SUFFIX)) {
      continue;
    }
    const content = await readFile(stylesheet, 'utf8');
    for (const name of propertyNames) {
      if (content.includes(name)) {
        importedBy.push(`${path.relative(COMPONENTS_DIR, stylesheet)} references ${name}`);
      }
    }
  }

  if (importedBy.length > 0) {
    console.error(
      chalk.red(
        `[properties] a component stylesheet references a -property.css file:\n` +
          importedBy.map((i) => `  ${i}`).join('\n') +
          `\nThese registrations must only be aggregated into globals.css, never inlined` +
          ` into a shadow root, where they would be inert.`,
      ),
    );
    process.exit(1);
  }

  for (const file of sources) {
    const root = postcss.parse(await readFile(file, 'utf8'), { from: file });
    root.walkAtRules('property', (atRule) => {
      atRule.walkDecls('initial-value', (decl) => {
        const literal = foldRem(resolve(decl.value, lookup, spacingUnit));
        if (/var\(|--spacing\(/.test(literal)) {
          unresolved.push(`${path.basename(file)}  ${atRule.params}  ->  ${literal}`);
          return;
        }
        if (RELATIVE_UNIT.test(literal)) {
          relative.push(`${path.basename(file)}  ${atRule.params}  ->  ${literal}`);
          return;
        }
        decl.value = literal;
      });
    });

    // The sources carry the review-facing rationale (why a registration is there, and
    // why the neighbouring properties are deliberately left out); shipping ~80 of those
    // headers would be most of globals.css. A one-line marker keeps the output
    // navigable back to the authoring file.
    root.walkComments((comment) => comment.remove());

    const component = path.basename(file, PROPERTY_SUFFIX);
    chunks.push(`/* ${component} */\n${root.toString().trim()}`);
  }

  if (unresolved.length > 0) {
    console.error(
      chalk.red(
        `[properties] ${unresolved.length} initial-value could not be resolved to a literal.\n` +
          `An @property with a var() in its initial-value is invalid and gets dropped, so this is fatal.\n` +
          unresolved.map((u) => `  ${u}`).join('\n'),
      ),
    );
    process.exit(1);
  }

  if (relative.length > 0) {
    console.error(
      chalk.red(
        `[properties] ${relative.length} initial-value still carries a relative unit.\n` +
          `An initial-value must be computationally independent, so the browser drops the whole` +
          ` registration. rem is folded automatically; these units depend on the element or the` +
          ` viewport and cannot be.\n` +
          relative.map((r) => `  ${r}`).join('\n'),
      ),
    );
    process.exit(1);
  }

  const header = [
    '/*',
    '  GENERATED - do not edit.',
    '  Source: the <component>/css/<component>-property.css files under',
    '  projects/stencil/src/components, with every initial-value resolved to a',
    '  literal by projects/styles/scripts/properties.ts.',
    '*/',
    '',
  ].join('\n');

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, `${header}${chunks.join('\n\n')}\n`, 'utf8');
  await logFileSavedTo(OUT_FILE, OUT_FILE);
};

main();

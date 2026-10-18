/**
 * The component sheets no build ever reads (#1004). Stencil compiles what a component's
 * `styleUrl(s)` names and what those sheets pull in through `@import` (inlined) or
 * `@reference` (read for `@apply`, not emitted); anything else under the components
 * directory is dead, and nothing says so. A sheet whose import got lost keeps being
 * edited as if it were live, and `check.tokens` scans every `.css` under `src`, so a dead
 * sheet can also keep a name alive in its baseline (`mds-tooltip-variants.css`, #1000).
 *
 * `<component>/css/<component>-property.css` is the one exception: those registrations
 * must never be imported (they would be inert in a shadow root) and
 * `projects/styles/scripts/properties.ts` collects them into globals.css directly.
 *
 * Kept free of anything but reads, so scripts/unreachable-sheets.spec.ts can run it on
 * fixtures and on the real tree.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

export const PROPERTY_SUFFIX = '-property.css';

const walk = (dir: string, ext: RegExp): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return walk(path, ext);
    return ext.test(path) ? [path] : [];
  });

/** The sheets a component file hands to Stencil: `styleUrl` and both forms of `styleUrls`. */
export const styleUrls = (source: string): string[] => {
  const urls: string[] = [];
  for (const [, value] of source.matchAll(
    /\bstyleUrls?\s*:\s*(['"][^'"]+['"]|\[[^\]]*\]|\{[^}]*\})/g,
  )) {
    for (const [, url] of value.matchAll(/['"]([^'"]+\.css)['"]/g)) urls.push(url);
  }
  return urls;
};

/** The relative sheets a stylesheet pulls in through `@import` or `@reference`. */
export const sheetImports = (css: string): string[] =>
  [
    ...css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .matchAll(/@(?:import|reference)\s+(?:url\()?\s*['"](\.{1,2}\/[^'"]+)['"]/g),
  ].map(([, url]) => url);

/**
 * Every `.css` under `componentsDir` that no component's `styleUrl(s)` reaches, directly or
 * through a chain of relative `@import`/`@reference`, outside the `-property.css` files.
 * Paths are relative to `componentsDir`, sorted.
 */
export const unreachableSheets = (componentsDir: string): string[] => {
  const reached = new Set<string>();
  const queue = walk(componentsDir, /\.tsx$/).flatMap((file) =>
    styleUrls(readFileSync(file, 'utf8')).map((url) => resolve(dirname(file), url)),
  );

  while (queue.length > 0) {
    const sheet = queue.pop()!;
    if (reached.has(sheet) || !existsSync(sheet)) continue;
    reached.add(sheet);
    for (const url of sheetImports(readFileSync(sheet, 'utf8'))) {
      queue.push(resolve(dirname(sheet), url));
    }
  }

  return walk(componentsDir, /\.css$/)
    .filter((sheet) => !sheet.endsWith(PROPERTY_SUFFIX) && !reached.has(sheet))
    .map((sheet) => relative(componentsDir, sheet))
    .sort();
};

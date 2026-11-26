// @vitest-environment node
// #1540: the package root holds the services, and the apps on the wrappers render from the
// custom-elements build (dist/components). An import of the services that reached the runtime of
// the lazy loader shipped a second Stencil runtime in those apps, about 100 kB. This walks the
// modules the built entries of `.` and `./services` reach, as a bundler does, and fails when one
// of them is the runtime: it needs the build (`nx run stencil:test` runs one).
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(PACKAGE, 'dist');

// `from "x"`, `import "x"`, `import("x")`, `require("x")`, minified or not
const SPECIFIER = /(?:\bfrom|\bimport\s*\(?|\brequire\s*\()\s*(["'])([^"']+)\1/g;

const read = (file: string): string => readFileSync(file, 'utf8');

/** Every module the entry reaches through its relative imports, and the packages it imports. */
const graph = (entry: string): { modules: Set<string>; packages: Set<string> } => {
  const modules = new Set<string>();
  const packages = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.shift()!;
    if (modules.has(file)) {
      continue;
    }
    modules.add(file);
    for (const [, , specifier] of read(file).matchAll(SPECIFIER)) {
      if (!specifier.startsWith('.')) {
        packages.add(specifier);
        continue;
      }
      const target = resolve(dirname(file), specifier);
      if (existsSync(target)) {
        queue.push(target);
      }
    }
  }
  return { modules, packages };
};

/**
 * The runtime of a lazy build: the chunk its loader takes `bootstrapLazy` from. Chunk names are
 * hashed, so the loader is what names it.
 */
const runtimeOf = (loader: string): string => {
  const source = read(loader);
  const esm = source.match(/\{[^}]*\bas\s+bootstrapLazy\b[^}]*\}\s*from\s*(["'])([^"']+)\1/);
  if (esm) {
    return resolve(dirname(loader), esm[2]);
  }
  const binding = source.match(/\b(\w+)\.bootstrapLazy\(/)?.[1];
  const cjs = binding
    ? source.match(new RegExp(`\\b${binding}\\s*=\\s*require\\(\\s*(["'])([^"']+)\\1`))
    : null;
  if (cjs) {
    return resolve(dirname(loader), cjs[2]);
  }
  throw new Error(`no bootstrapLazy import in ${relative(PACKAGE, loader)}`);
};

const loaders = ['esm-es5/loader.js', 'esm/loader.js', 'cjs/loader.cjs.js'].map((file) =>
  join(DIST, file),
);

const exportsMap = JSON.parse(read(join(PACKAGE, 'package.json'))).exports as Record<
  string,
  Record<string, string>
>;

const entries = ['.', './services'].flatMap((subpath) =>
  ['import', 'require', 'default'].map((condition) => ({
    subpath,
    condition,
    file: resolve(PACKAGE, exportsMap[subpath][condition]),
  })),
);

describe('the built services entry', () => {
  const runtimes = loaders.filter(existsSync).map(runtimeOf);

  it('finds the runtime of every lazy build', () => {
    expect(runtimes).toHaveLength(loaders.length);
    for (const runtime of runtimes) {
      expect(existsSync(runtime)).toBe(true);
    }
  });

  it.each(entries)('$subpath ($condition) does not reach the Stencil runtime', ({ file }) => {
    const { modules, packages } = graph(file);

    // the services themselves are there: the walk followed the entry
    expect(modules.size).toBeGreaterThan(1);
    expect([...modules].some((module) => read(module).includes('mdsIconSvgPath'))).toBe(true);
    const reached = runtimes.filter((runtime) => modules.has(runtime));
    expect(reached.map((runtime) => relative(PACKAGE, runtime))).toEqual([]);
    expect([...packages].filter((name) => name.startsWith('@stencil/'))).toEqual([]);
  });
});

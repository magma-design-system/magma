/**
 * Fails when a declaration file magma publishes names a module a consumer's TypeScript cannot
 * type, so that with `skipLibCheck: false` its type-check stops, and with the default `true` the
 * names it brings become `any`. Two rules, scripts/public-types-lib.ts says why and which forms
 * are read:
 *
 * - a path alias of the stencil tsconfig (`@type/*`, `@dictionary/*`, ...): no consumer can
 *   resolve it (#1357). Stencil rewrites the alias of an import in the `.d.ts` it emits, not the
 *   one of an `export ... from`;
 * - a package the install of magma does not give its consumer with declarations: one outside
 *   `dependencies` and `peerDependencies`, one with no types (luxon, #1360), one typed by an
 *   `@types` package magma does not depend on, and a Node built-in outside the hydrate app.
 *
 * The aliases come from the tsconfig the build compiles with (tsconfig.stencil.json, which takes
 * `paths` from tsconfig.json); the files are every `.d.ts` under the folders of `files` in
 * package.json that hold declarations (dist/, loader/).
 *
 * Run from the stencil package dir, after the stencil build:  npm run check.public-types
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import ts from 'typescript';
import { PROJECT_DIR } from './meta';
import {
  aliasPatterns,
  findModuleSpecifiers,
  matchAlias,
  specifierProblem,
  type PackageScope,
} from './public-types-lib';

const TSCONFIG = join(PROJECT_DIR, 'tsconfig.stencil.json');
const PUBLISHED = ['dist', 'loader'].map((dir) => join(PROJECT_DIR, dir));
// the server-side renderer, which runs in Node: the one place a Node built-in may be named
const NODE_ENTRY = join(PROJECT_DIR, 'dist', 'hydrate') + sep;

/*
 * How a consumer's TypeScript looks a package up: `bundler` (TypeScript's resolution for code a
 * bundler consumes, which reads the `types` condition of `exports`), the one the reproductions of
 * #1357 and #1360 used. `types: []` keeps the @types packages of the monorepo out of the lookup of
 * a built-in, which the consumer types only if it brings @types/node.
 */
const RESOLUTION: ts.CompilerOptions = {
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  types: [],
};

const config = ts.getParsedCommandLineOfConfigFile(
  TSCONFIG,
  {},
  {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
      process.exit(2);
    },
  },
);
const patterns = aliasPatterns(config?.options.paths ?? {});
if (!patterns.length) {
  // a tsconfig without aliases would make the check pass on anything: say so instead
  console.error(
    `no path alias found in ${relative(PROJECT_DIR, TSCONFIG)}: nothing to check against`,
  );
  process.exit(2);
}

const manifest = JSON.parse(readFileSync(join(PROJECT_DIR, 'package.json'), 'utf8')) as {
  name: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
const scope: PackageScope = {
  self: manifest.name,
  installed: new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
  ]),
};

if (!existsSync(join(PROJECT_DIR, 'dist/types'))) {
  console.error('missing dist/types - run the stencil build first');
  process.exit(2);
}

const declarations = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) return declarations(path);
        return entry.name.endsWith('.d.ts') ? [path] : [];
      })
    : [];

const REASON: Record<string, string> = {
  'node-built-in': 'a Node built-in, typed only by the @types/node of a consumer that runs in Node',
  'not-installed': 'not in dependencies nor peerDependencies: a consumer does not install it',
  unresolved: 'TypeScript finds no package for it',
  'no-declarations': 'the package ships no types and magma depends on no @types for it',
  'declarations-not-installed': 'typed by an @types package magma does not depend on',
};

const files = PUBLISHED.flatMap(declarations);
const found: { file: string; line: number; specifier: string; why: string }[] = [];
for (const file of files) {
  const nodeEntry = file.startsWith(NODE_ENTRY);
  for (const { line, specifier } of findModuleSpecifiers(file, readFileSync(file, 'utf8'))) {
    const alias = matchAlias(specifier, patterns);
    if (alias) {
      found.push({ file, line, specifier, why: `path alias ${alias.key}, no consumer has it` });
      continue;
    }
    const problem = specifierProblem(specifier, { nodeEntry }, scope, (bare) => {
      const resolved = ts.resolveModuleName(bare, file, RESOLUTION, ts.sys).resolvedModule;
      return resolved && { extension: resolved.extension, holder: resolved.packageId?.name };
    });
    if (problem) found.push({ file, line, specifier, why: REASON[problem] });
  }
}

if (!found.length) {
  console.log(
    `OK - every module the ${files.length} published declaration files name is typed for a ` +
      `consumer (aliases: ${patterns.map(({ key }) => key).join(', ')}; packages: ` +
      `the dependencies and peerDependencies of ${scope.self})`,
  );
  process.exit(0);
}

console.error(`${found.length} module(s) of the published types a consumer cannot type:\n`);
for (const { file, line, specifier, why } of found) {
  console.error(`  ${relative(PROJECT_DIR, file)}:${line}  '${specifier}'  ${why}`);
}
console.error(
  '\nAn alias: Stencil rewrites the alias of an import in the .d.ts it emits, but not the one of a' +
    " re-export (export ... from) nor of an inline import('...') type. Write the relative path in" +
    " the source the file comes from (export * from '../dictionary/x'), or import the type" +
    ' explicitly.' +
    '\nA package: keep its types out of the public members (a private member is emitted without' +
    ' its type; an explicit type of our own replaces an inferred one), or ship them with magma' +
    ' (the package or its @types in dependencies), which every consumer then installs.',
);
process.exit(1);

/**
 * Fails when a declaration file magma publishes names a module through a path alias of the
 * stencil tsconfig (`@type/*`, `@dictionary/*`, ...): no consumer can resolve it, so with
 * `skipLibCheck: false` its type-check stops on TS2307, and with the default `true` the names
 * it brings become `any` (#1357). Stencil rewrites the alias of an import in the `.d.ts` it
 * emits, not the one of an `export ... from`: scripts/public-types-lib.ts says why and which
 * forms are read.
 *
 * The aliases come from the tsconfig the build compiles with (tsconfig.stencil.json, which takes
 * `paths` from tsconfig.json); the files are every `.d.ts` under the folders of `files` in
 * package.json that hold declarations (dist/, loader/).
 *
 * Run from the stencil package dir, after the stencil build:  npm run check.public-types
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';
import { PROJECT_DIR } from './meta';
import { aliasPatterns, findAliasedSpecifiers, type AliasHit } from './public-types-lib';

const TSCONFIG = join(PROJECT_DIR, 'tsconfig.stencil.json');
const PUBLISHED = ['dist', 'loader'].map((dir) => join(PROJECT_DIR, dir));

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

const files = PUBLISHED.flatMap(declarations);
const found: { file: string; hit: AliasHit }[] = files.flatMap((file) =>
  findAliasedSpecifiers(file, readFileSync(file, 'utf8'), patterns).map((hit) => ({ file, hit })),
);

if (!found.length) {
  console.log(
    `OK - no path alias in the ${files.length} published declaration files ` +
      `(aliases: ${patterns.map(({ key }) => key).join(', ')})`,
  );
  process.exit(0);
}

console.error(
  `${found.length} module specifier(s) of the published types go through a path alias no consumer has:\n`,
);
for (const { file, hit } of found) {
  console.error(`  ${relative(PROJECT_DIR, file)}:${hit.line}  '${hit.specifier}'  (${hit.alias})`);
}
console.error(
  '\nStencil rewrites the alias of an import in the .d.ts it emits, but not the one of a re-export' +
    " (export ... from) nor of an inline import('...') type. Write the relative path in the source" +
    " the file comes from (export * from '../dictionary/x'), or import the type explicitly.",
);
process.exit(1);

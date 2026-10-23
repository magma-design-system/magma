/*
  Ships the consumer lint (projects/lint, #1102) inside this package, so it arrives with the
  components and always matches their version: compiles its sources into dist/lint, and
  marks that folder as ES modules with its own package.json, since this package is not one.
  package.json exports it as ./eslint, ./stylelint, ./stylelint/recommended,
  ./stylelint/strict and ./lint (the core). Runs at the end of the build, after the clean
  step has emptied dist.
*/
import { execFileSync } from 'child_process';
import { writeFileSync } from 'fs';
import { createRequire } from 'module';
import { resolve } from 'path';
import { DIST_DIR, PROJECT_DIR } from './meta';

const LINT_DIR = resolve(PROJECT_DIR, '../lint');
const OUT_DIR = resolve(DIST_DIR, 'lint');

const tsc = createRequire(resolve(PROJECT_DIR, 'package.json')).resolve('typescript/bin/tsc');
execFileSync(
  process.execPath,
  [tsc, '-p', resolve(LINT_DIR, 'tsconfig.build.json'), '--outDir', OUT_DIR],
  { stdio: 'inherit' },
);
writeFileSync(resolve(OUT_DIR, 'package.json'), `${JSON.stringify({ type: 'module' }, null, 2)}\n`);
console.info(`Consumer lint compiled into ${OUT_DIR}`);

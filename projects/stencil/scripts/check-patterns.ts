/**
 * The check of the patterns Magma ships (docs/agents/patterns/*.md, as agents/patterns/<id>.md
 * in the entry packages; #1174), the one CI runs after the build:
 *
 * - the format: every field of the template, typed; the entries on the pattern's own variables;
 * - the cases: every combination of the variables in exactly one case, or in a declared gap or
 *   not-applicable entry (a variable left out means any value, except `decision`, which means
 *   none); only two cases on one combination are a conflict;
 * - the release: every component and attribute named exists in dist/documentation.json, with a
 *   value it takes;
 * - the lint: every "Always true" rule checked by lint names a rule the lint has; a planned one
 *   names a rule it does not have yet;
 * - the links: every pattern, case and rule cited exists, and no reference uses an old id;
 * - the body: its sections in the order of the template, the generated ones up to date.
 *
 * With `--layer <dir>` it checks a product layer too (magma/patterns/ of a product): a layer may
 * narrow the open choices and add situations, never narrow an "Always true" rule.
 *
 * The logic is in the lint core (projects/lint/src/core/patterns.ts); the format is written in
 * docs/PATTERNS.md. Needs the build (dist/documentation.json).
 *
 * Run from the stencil package dir:  npm run check.patterns [-- --layer <dir>]
 */
import { existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { loadComponents } from '../../lint/src/core/data';
import {
  MAGMA_LAYER,
  bodyErrors,
  componentErrors,
  coverage,
  formatErrors,
  isLayer,
  layerErrors,
  lintErrors,
  linkErrors,
  readPatternDir,
  type Layer,
  type PatternFile,
} from '../../lint/src/core/patterns';
import { rules as eslintRules } from '../../lint/src/eslint/index';
import stylelintPlugins from '../../lint/src/stylelint/index';
import { PROJECT_DIR } from './meta';
import { PATTERNS_DIR, REPO, readPatterns } from './patterns-lib';

const DOCUMENTATION = join(PROJECT_DIR, 'dist/documentation.json');
if (!existsSync(DOCUMENTATION)) {
  console.error(`missing ${relative(REPO, DOCUMENTATION)} - build first (nx run stencil:build)`);
  process.exit(2);
}
const components = loadComponents({ documentation: DOCUMENTATION });
const lintRules = new Set([
  ...Object.keys(eslintRules).map((name) => `magma/${name}`),
  ...stylelintPlugins.map((plugin) => plugin.ruleName),
]);

const found = new Map<string, string[]>();
const report = (file: string, errors: string[]) => {
  if (errors.length) found.set(file, [...(found.get(file) ?? []), ...errors]);
};
const sample = (combos: Record<string, string>[]) =>
  combos
    .slice(0, 5)
    .map(
      (combo) =>
        `    ${Object.entries(combo)
          .map(([name, value]) => `${name}=${value}`)
          .join(' ')}`,
    )
    .join('\n');

let files: PatternFile[] = [];
try {
  files = readPatterns();
} catch (error) {
  console.error(String(error));
  process.exit(1);
}
const patterns = files.map((one) => one.data);
let combinations = 0;
for (const file of files) {
  const { data } = file;
  const errors = formatErrors(file);
  if (data.layer !== MAGMA_LAYER)
    errors.push(`layer is ${MAGMA_LAYER}: a product layer lives in its product`);
  if (!errors.length && data.status !== 'candidate') {
    const { total, none, conflicts } = coverage(data);
    combinations += total;
    if (none.length)
      errors.push(
        `${none.length} of ${total} combinations have no case, gap or not-applicable entry, such as:\n${sample(none)}`,
      );
    for (const { combo, cases } of conflicts.slice(0, 5))
      errors.push(
        `two cases on one combination, ${cases.join(' and ')}: ${Object.entries(combo)
          .map(([name, value]) => `${name}=${value}`)
          .join(' ')}`,
      );
    errors.push(...componentErrors(data, components), ...lintErrors(data, lintRules));
    errors.push(...bodyErrors(data, file.body, patterns));
  }
  report(file.file, errors);
}
for (const [id, errors] of linkErrors(patterns))
  report(files.find((one) => one.data.id === id)!.file, errors);

const layerArg = process.argv.indexOf('--layer');
if (layerArg > -1) {
  const dir = resolve(process.argv[layerArg + 1] ?? '');
  const ids = new Set(patterns.flatMap((one) => [one.id, ...(one.aliases ?? [])]));
  for (const file of readPatternDir<Layer>(dir)) {
    if (isLayer(file.data)) report(file.file, layerErrors(file, patterns));
    else {
      const own = file as unknown as PatternFile;
      const errors = formatErrors(own);
      if (ids.has(own.data.id))
        errors.push(
          `Magma has a pattern ${own.data.id}: extend it (extends: magma:${own.data.id})`,
        );
      if (own.data.layer === MAGMA_LAYER) errors.push('layer is the name of the product');
      report(file.file, errors);
    }
  }
}

if (found.size) {
  for (const [file, errors] of found) {
    console.error(`\n${relative(REPO, file)}`);
    for (const error of errors) console.error(`  - ${error}`);
  }
  console.error(
    `\n${[...found.values()].flat().length} problem(s) in the patterns. The format: docs/PATTERNS.md.`,
  );
  process.exit(1);
}
const decided = patterns.filter((one) => one.status !== 'candidate').length;
console.log(
  `OK - ${patterns.length} patterns in ${relative(REPO, PATTERNS_DIR)} (${decided} defined, ${
    patterns.length - decided
  } candidates): ${combinations} combinations each in one case, a gap or not applicable; every component, attribute, lint rule and link exists`,
);

/**
 * The check of the patterns Magma ships (docs/agents/patterns/*.md, as agents/patterns/<id>.md
 * in the entry packages; #1174), the one CI runs after the build:
 *
 * - the format: every field of the template, typed; the entries on the pattern's own variables;
 * - the cases: every combination of the variables in exactly one case, or in a declared gap or
 *   not-applicable entry (a variable left out means any value, except `decision`, which means
 *   none); only two cases on one combination are a conflict;
 * - the regions of a building block (kind block, #1210): each `when` on the block's own
 *   variables, a required region in every combination, the patterns of `used-by` (two at least)
 *   naming the block among their related;
 * - the release: every component and attribute named exists in dist/documentation.json, with a
 *   value it takes;
 * - the parts of a case (#1396): in a pattern and a block of Magma, every entry of use with its
 *   role, every attribute written as its kind asks (the case's value, the application's text as
 *   <what it holds>, never its wiring); the solution each preview shows outside its data-stage
 *   names the same components as use, in its order (a block: the regions its situation shows);
 * - the lint: every "Always true" rule checked by lint names a rule the lint has; a planned one
 *   names a rule it does not have yet;
 * - the carriers of a domain of the design language (kind design-language, #1196): each
 *   component, custom property, utility and lint rule of carried-by is in the release, each of
 *   carried-by-planned is not yet;
 * - the links: every pattern, case and rule cited exists, and no reference uses an old id;
 * - the body: its sections in the order of the template, the generated ones up to date;
 * - the previews of the cases (docs/agents/patterns/previews/<pattern>/<case>.html, #1186) and of
 *   the situations of a block (<block>/<situation>.html, 2026-11-03): each of a case, a rule of
 *   a domain or a situation that exists, with its keys, only a stage, and its markup clean for
 *   the Magma lint (the strict preset, as check_markup runs it); the cases and the situations of
 *   a decided block with no preview are listed as a warning, which does not fail the check while
 *   previews are being made;
 * - the images of the previews in the build (agents/patterns/previews/ of magma, #1243): each
 *   preview with its light and its dark image, WebP of the frame, and no image of no preview.
 *
 * With `--layer <dir>` it checks a product's folder too (magma/patterns/ of a product), as
 * get_pattern does without arguments (projectErrors of the core): a layer may narrow the open
 * choices and add situations, never narrow an "Always true" rule; a pattern of the product's own
 * holds to the format, the cases and the components as Magma's do.
 *
 * The logic is in the lint core (projects/lint/src/core/patterns.ts); the format is written in
 * docs/PATTERNS.md. Needs the build (dist/documentation.json).
 *
 * Run from the stencil package dir:  npm run check.patterns [-- --layer <dir>]
 */
import * as htmlParser from '@html-eslint/parser';
import { Linter } from 'eslint';
import { existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import {
  loadComponents,
  loadStyles,
  loadThemeNames,
  loadTokenNames,
} from '../../lint/src/core/data';
import {
  BLOCK,
  DESIGN_LANGUAGE,
  MAGMA_LAYER,
  bodyErrors,
  carrierErrors,
  componentErrors,
  coverage,
  coverageErrors,
  formatErrors,
  lintErrors,
  linkErrors,
  magmaUseErrors,
  missingPreviews,
  previewImageErrors,
  previewLinkErrors,
  previewUseErrors,
  projectErrors,
  readPreviews,
  readProjectDir,
  type MarkupNode,
  type PatternFile,
  type Release,
} from '../../lint/src/core/patterns';
import magmaEslint, { rules as eslintRules } from '../../lint/src/eslint/index';
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
// what the carriers of a domain are checked against: the styles beside the built
// documentation.json, the theme of the styles package and the tokens of the design-tokens
// package of this repository
const release: Release = {
  components,
  styles: loadStyles({ documentation: DOCUMENTATION }),
  theme: loadThemeNames({ root: REPO }),
  tokens: loadTokenNames({ root: REPO }),
  lintRules,
};

const found = new Map<string, string[]>();
const report = (file: string, errors: string[]) => {
  if (errors.length) found.set(file, [...(found.get(file) ?? []), ...errors]);
};
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
    const covered = coverage(data);
    combinations += covered.total;
    errors.push(...coverageErrors(covered));
    errors.push(...componentErrors(data, components), ...lintErrors(data, lintRules));
    // a pattern and a block of Magma give each part of a case with its role (#1396)
    errors.push(...magmaUseErrors(data, components));
    if (data.kind === DESIGN_LANGUAGE) errors.push(...carrierErrors(data, release));
    errors.push(...bodyErrors(data, file.body, patterns));
  }
  report(file.file, errors);
}
for (const [id, errors] of linkErrors(patterns))
  report(files.find((one) => one.data.id === id)!.file, errors);

// the previews: their keys and their stage, the case or the rule of a domain they show, and their
// markup through the lint the products run (strict, every finding an error here)
const previews = readPreviews(PATTERNS_DIR);
const linter = new Linter({ cwd: REPO });
const lintConfig: Linter.Config[] = [
  {
    files: ['**/*.html'],
    languageOptions: { parser: htmlParser as Linter.Parser },
    ...magmaEslint.configs.strict,
    settings: { magma: { root: REPO, documentation: DOCUMENTATION } },
  },
];
for (const preview of previews) {
  const errors = [...preview.errors];
  for (const message of linter.verify(preview.markup, lintConfig, { filename: preview.file }))
    errors.push(
      message.fatal
        ? `the stage does not parse as HTML: ${message.message}`
        : `${message.ruleId}: ${message.message} (line ${message.line} of the stage)`,
    );
  report(preview.file, errors);
}
for (const [file, errors] of previewLinkErrors(previews, patterns)) report(file, errors);
// the solution each preview shows, outside its data-stage, against the use of its case (#1396)
const parse = (markup: string) =>
  (htmlParser.parseForESLint(markup, {}) as unknown as { ast: MarkupNode }).ast;
for (const [file, errors] of previewUseErrors(patterns, previews, parse, components))
  report(file, errors);
const missing = missingPreviews(patterns, previews);
// the images the build made of them (scripts/preview-images.ts), in the package
for (const [file, errors] of previewImageErrors(previews, join(PROJECT_DIR, 'agents/patterns')))
  report(file, errors);

const layerArg = process.argv.indexOf('--layer');
if (layerArg > -1) {
  const dir = resolve(process.argv[layerArg + 1] ?? '');
  const { files: layerFiles, unreadable } = readProjectDir(dir);
  for (const [file, error] of unreadable) report(file, [error]);
  for (const [file, errors] of projectErrors(layerFiles, patterns, components))
    report(file, errors);
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
if (missing.length)
  console.warn(
    `${missing.length} case(s) or situation(s) of a block with no preview yet (docs/PATTERNS.md, "The preview of a case"; /pattern-preview <id> makes them):\n${missing
      .map((one) => `  - ${one}`)
      .join('\n')}\n`,
  );
const domains = patterns.filter((one) => one.kind === DESIGN_LANGUAGE).length;
const blocks = patterns.filter((one) => one.kind === BLOCK).length;
const decided = patterns.filter(
  (one) => one.kind === 'pattern' && one.status !== 'candidate',
).length;
console.log(
  `OK - ${patterns.length - domains - blocks} patterns, ${blocks} building block(s) and ${domains} domain(s) of the design language in ${relative(REPO, PATTERNS_DIR)} (${decided} patterns defined, ${
    patterns.length - domains - blocks - decided
  } candidates): ${combinations} combinations each in one case, a gap or not applicable, or with a required region of a block; every component, attribute, carrier, lint rule and link exists; ${
    previews.length
  } preview(s), each of a case, a rule of a domain or a situation of a block and clean, each with its light and dark image in the build`,
);

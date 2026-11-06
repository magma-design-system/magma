#!/usr/bin/env node
/**
 * CLI wrapper around {@link runMigration}. Dry-run is the default; pass
 * `--write` to apply changes (refused on a dirty git tree unless `--force`).
 */
import arg from 'arg';
import chalk from 'chalk';
import { exitCode, runMigration, type Framework, type FromMajor } from './index.js';

const HELP = `magma-codemods - migrate @maggioli-design-system/magma consumer code to Magma 3

Usage:
  npx @maggioli-design-system/magma-codemods --path ./src [options]

Without --from the code is taken to be on Magma 2 and migrated to Magma 3. Code still on
Magma 1 passes --from 1: the v1 -> v2 rules run first, then v2 -> v3. Never run the v1 -> v2
rules on Magma 2 code: they add attributes that keep the Magma 1 defaults. To stop at
Magma 2, run magma-codemods@1.

Options:
  --from <1|2>                                 the major the code is on (default: 2)
  --framework <react|angular|html|css|auto>   surface (default: auto, inferred by extension)
  --path <file|dir>                            file or directory to scan (repeatable; positional args also work)
  --dry-run                                    print a diff and report, write nothing (DEFAULT)
  --write                                      apply changes in place
  --force                                      allow --write on a dirty git working tree
  --ignore <glob>                              extra ignore globs (repeatable)
  --report <path>                              write the JSON report
  --report-md <path>                           write a Markdown worklist: decisions by token (with alternatives)
                                               and a checklist per file
  --only <ruleId,...>                          run only these rules
  --skip <ruleId,...>                          skip these rules
  --manifest <path>                            replace the bundled jumps with one manifest (JSON)
  --accept-semantic <exact|near>               v1 -> v2: write the raw palette -> semantic role matches up
                                               to this tier (default: report them only)
  --keep-dark-overrides                        v1 -> v2: match semantic roles on light AND dark instead of
                                               dropping the dark: overrides
  -h, --help                                   show this help
`;

const split = (value: string | undefined): string[] | undefined =>
  value
    ?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const main = async (): Promise<number> => {
  const args = arg({
    '--from': String,
    '--framework': String,
    '--path': [String],
    '--write': Boolean,
    '--dry-run': Boolean,
    '--force': Boolean,
    '--ignore': [String],
    '--report': String,
    '--report-md': String,
    '--only': String,
    '--skip': String,
    '--manifest': String,
    '--accept-semantic': String,
    '--keep-dark-overrides': Boolean,
    '--help': Boolean,
    '-h': '--help',
  });

  if (args['--help']) {
    console.log(HELP);
    return 0;
  }

  const paths = [...(args['--path'] ?? []), ...args._];
  if (paths.length === 0) {
    console.error(chalk.red('Nothing to do: pass at least one --path (or a positional path).\n'));
    console.log(HELP);
    return 2;
  }

  const from = args['--from'] ?? '2';
  if (from !== '1' && from !== '2') {
    console.error(
      chalk.red(`--from takes \`1\` or \`2\`, the major the code is on, not \`${from}\`.\n`),
    );
    return 2;
  }

  const accept = args['--accept-semantic'] ?? 'none';
  if (accept !== 'none' && accept !== 'exact' && accept !== 'near') {
    console.error(chalk.red(`--accept-semantic takes \`exact\` or \`near\`, not \`${accept}\`.\n`));
    return 2;
  }

  const { report, reporter } = await runMigration({
    paths,
    from: Number(from) as FromMajor,
    framework: (args['--framework'] as Framework) ?? 'auto',
    write: args['--write'] === true,
    force: args['--force'] === true,
    ignore: args['--ignore'],
    only: split(args['--only']),
    skip: split(args['--skip']),
    manifestPath: args['--manifest'],
    reportPath: args['--report'],
    reportMarkdownPath: args['--report-md'],
    semantic: { accept, keepDarkOverrides: args['--keep-dark-overrides'] === true },
  });

  console.log(reporter.renderHuman(report, { showDiff: true }));
  return exitCode(report);
};

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exitCode = 2;
  });

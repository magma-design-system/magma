#!/usr/bin/env node
/**
 * CLI wrapper around {@link runMigration}. Dry-run is the default; pass
 * `--write` to apply changes (refused on a dirty git tree unless `--force`).
 */
import arg from 'arg';
import chalk from 'chalk';
import { exitCode, runMigration, type Framework } from './index.js';

const HELP = `magma-codemods — migrate @maggioli-design-system/magma consumer code from v1 to v2

Usage:
  npx @maggioli-design-system/magma-codemods --path ./src [options]

Options:
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
  --manifest <path>                            override the bundled manifest (JSON)
  --accept-semantic <exact|near>               write the raw palette -> semantic role matches up to this
                                               tier (default: report them only)
  --keep-dark-overrides                        match semantic roles on light AND dark instead of dropping
                                               the dark: overrides
  -h, --help                                   show this help
`;

const split = (value: string | undefined): string[] | undefined =>
  value
    ?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const main = async (): Promise<number> => {
  const args = arg({
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

  const accept = args['--accept-semantic'] ?? 'none';
  if (accept !== 'none' && accept !== 'exact' && accept !== 'near') {
    console.error(chalk.red(`--accept-semantic takes \`exact\` or \`near\`, not \`${accept}\`.\n`));
    return 2;
  }

  const { report, reporter } = await runMigration({
    paths,
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

/**
 * APCA contrast gate CLI (issue #575, A3).
 *
 *   npm run contrast                    # verify; exits 1 on un-baselined failures
 *   npm run contrast -- --update-baseline   # record current offenders as the baseline
 *   nx run design-tokens:contrast       # same, via Nx
 *
 * Loads the token config (in-memory model), the semantic mapping from
 * semantic.config.ts, and the baseline, then prints a readable table and
 * fails on any enforced pair that is not covered by the baseline (section 9.1).
 * The base layer first, then every named theme that repoints something, in its
 * own family and accents (#692): a theme the gate never saw is not verified.
 */
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { getColorsConfig } from '../src/lib/utils.mjs';
import { createColorTokens, type MagmaConfig } from '../src/lib/color.mjs';
import { semantic } from '../semantic.config.js';
import {
  aliasesFromConfig,
  applyBaseline,
  buildBaseline,
  evaluatePairs,
  evaluateTheme,
  formatRow,
  formatTable,
  themeMappingsFromConfig,
  type Baseline,
  type ColorTree,
  type PairResult,
} from '../src/lib/contrast-gate.js';

const BASELINE_FILE = path.resolve(__dirname, '../contrast-baseline.json');
const UPDATE = process.argv.includes('--update-baseline');

const readBaseline = (): Baseline => {
  if (!fs.existsSync(BASELINE_FILE)) return {};
  return JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8')).pairs ?? {};
};

const writeBaseline = (baseline: Baseline) => {
  // sort keys for a stable, review-friendly diff
  const pairs = Object.fromEntries(Object.entries(baseline).sort(([a], [b]) => a.localeCompare(b)));
  const doc = {
    $comment:
      'Known contrast offenders accepted by the APCA gate (A3, issue #575). ' +
      'Each entry is an enforced pair currently below its target, to be tuned (issue #571). ' +
      'The gate fails on NEW enforced failures and on any baselined pair that regresses. ' +
      'Regenerate with: npm run contrast -- --update-baseline',
    pairs,
  };
  fs.writeFileSync(BASELINE_FILE, JSON.stringify(doc, null, 2) + '\n');
};

async function main() {
  const rc = await getColorsConfig();
  if (!rc) throw new Error('contrast-gate: base config not found (.magma-design-tokensrc.json)');
  const tree = (createColorTokens(rc.config as MagmaConfig).tokens as { color: ColorTree }).color;
  const aliases = aliasesFromConfig(semantic);

  const base = evaluatePairs(tree, aliases);
  const themes = themeMappingsFromConfig(semantic, semantic.themes).map((theme) => ({
    name: theme.name,
    results: evaluateTheme(tree, theme),
  }));
  const results = [...base, ...themes.flatMap((theme) => theme.results)];
  // the theme of a row, which formatRow does not print: the prefix of its key
  const row = (r: PairResult) =>
    (r.key.includes(':') ? `${r.key.split(':')[0]}  ` : '') + formatRow(r);

  if (UPDATE) {
    const baseline = buildBaseline(results);
    writeBaseline(baseline);
    console.log(
      chalk.green(`Baseline written: ${Object.keys(baseline).length} offender(s) recorded.`),
    );
    console.log(path.relative(process.cwd(), BASELINE_FILE));
    return;
  }

  const outcome = applyBaseline(results, readBaseline());

  console.log(chalk.bold('\nAPCA contrast gate (semantic pairs, both modes)'));
  console.log(formatTable(base, outcome));
  for (const theme of themes) {
    console.log(chalk.bold(`\nTheme ${theme.name} (its own family and accents)`));
    console.log(formatTable(theme.results, outcome));
  }

  const warnFailures = results.filter((r) => r.severity === 'warn' && !r.pass);
  if (warnFailures.length) {
    console.log(
      chalk.yellow(`\n${warnFailures.length} report-only pair(s) below target (not gated):`),
    );
    for (const r of warnFailures) console.log('  ' + chalk.yellow(row(r)));
  }

  if (outcome.baselinedFailures.length) {
    console.log(
      chalk.dim(
        `\n${outcome.baselinedFailures.length} known offender(s) accepted by baseline (to tune, issue #571):`,
      ),
    );
    for (const r of outcome.baselinedFailures) console.log('  ' + chalk.dim(row(r)));
  }

  if (outcome.staleBaseline.length) {
    console.log(
      chalk.yellow(`\nStale baseline entr(y/ies) - now passing, remove with --update-baseline:`),
    );
    for (const k of outcome.staleBaseline) console.log('  ' + chalk.yellow(k));
  }

  if (outcome.violations.length) {
    console.log(
      chalk.red.bold(
        `\nFAIL: ${outcome.violations.length} enforced pair(s) below target and not baselined:`,
      ),
    );
    for (const r of outcome.violations) console.log('  ' + chalk.red(row(r)));
    console.log('');
    process.exitCode = 1;
    return;
  }

  console.log(
    chalk.green.bold(
      '\nPASS: all enforced semantic pairs meet their APCA targets (or are baselined).\n',
    ),
  );
}

main().catch((err) => {
  console.error(chalk.red(err instanceof Error ? (err.stack ?? err.message) : String(err)));
  process.exitCode = 1;
});

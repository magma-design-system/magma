/**
 * What magma/host-knobs reports in the component sheets, without the baseline (#1499, SPEC.md
 * "The design decisions on :host"): the colours, radii, shadows, motion and z-index read outside a
 * custom property on :host, and the knobs out of their naming order or without an @prop.
 *
 *   npm run list.host-knobs                    the components, their reports and their baseline
 *   npm run list.host-knobs -- mds-button      the reports of one component, sheet by sheet
 *   npm run list.host-knobs -- --lower         lower scripts/host-knobs-pending.json to the
 *                                              counts of now (never raises one, adds no sheet)
 *
 * Reads the sources only, no build. Run from the stencil package dir. `npm run lint.css` holds
 * the baseline; this lists what it lets through, for the work that brings a component to the rule.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import {
  componentOfSheet,
  countBySheet,
  lowerPending,
  type Pending,
  type Problem,
} from './host-knobs-lib';
import { PROJECT_DIR } from './meta';

const COMPONENTS = join(PROJECT_DIR, 'src/components');
const PENDING = join(PROJECT_DIR, 'scripts/host-knobs-pending.json');

const args = process.argv.slice(2);
const lower = args.includes('--lower');
const tags = args.filter((arg) => !arg.startsWith('--'));

const main = async (): Promise<void> => {
  // the ESM entry of stylelint: its CommonJS API is deprecated
  const { default: stylelint } = await import('stylelint');
  const { results } = await stylelint.lint({
    config: {
      plugins: [join(PROJECT_DIR, 'scripts/stylelint-host-knobs.mjs')],
      rules: { 'magma/host-knobs': true },
    },
    files:
      tags.length > 0
        ? tags.map((tag) => `${COMPONENTS}/${tag}/**/*.css`)
        : `${COMPONENTS}/**/*.css`,
  });

  const problems: Problem[] = results.flatMap((result) =>
    result.warnings.map((warning) => ({
      line: warning.line,
      sheet: relative(COMPONENTS, result.source ?? ''),
      text: warning.text.replace(/ \(magma\/host-knobs\)$/, ''),
    })),
  );
  const counts = countBySheet(problems);
  const pending = JSON.parse(readFileSync(PENDING, 'utf8')) as Pending;
  const list = relative(PROJECT_DIR, PENDING);

  if (lower) {
    const lowered = lowerPending(pending, countBySheet(problems));
    writeFileSync(PENDING, `${JSON.stringify(lowered, null, 2)}\n`);
    const changed = Object.keys(pending).filter((sheet) => lowered[sheet] !== pending[sheet]);
    changed.forEach((sheet) =>
      console.log(`${sheet}: ${pending[sheet]} -> ${lowered[sheet] ?? 'out of the list'}`),
    );
    console.log(`${list}: ${changed.length} sheets lowered, ${Object.keys(lowered).length} left`);
  } else if (tags.length > 0) {
    for (const sheet of Object.keys(counts).sort()) {
      console.log(
        `\n${sheet}: ${counts[sheet]} reported, ${pending[sheet] ?? 0} allowed by ${list}`,
      );
      problems
        .filter((problem) => problem.sheet === sheet)
        .forEach((problem) =>
          console.log(`  ${String(problem.line).padStart(4)}  ${problem.text}`),
        );
    }
    if (problems.length === 0) console.log(`${tags.join(', ')}: nothing reported`);
  } else {
    const byComponent = new Map<string, { reported: number; allowed: number }>();
    for (const sheet of new Set([...Object.keys(counts), ...Object.keys(pending)])) {
      const row = byComponent.get(componentOfSheet(sheet)) ?? { allowed: 0, reported: 0 };
      row.reported += counts[sheet] ?? 0;
      row.allowed += pending[sheet] ?? 0;
      byComponent.set(componentOfSheet(sheet), row);
    }
    console.log('| Component | Reported | Baseline |\n| --- | --- | --- |');
    [...byComponent.entries()]
      .sort(([, a], [, b]) => a.reported - b.reported)
      .forEach(([tag, row]) => console.log(`| ${tag} | ${row.reported} | ${row.allowed} |`));
    console.log(
      `\n${problems.length} reported in ${byComponent.size} components; the details of one: npm run list.host-knobs -- <tag>`,
    );
  }
};

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

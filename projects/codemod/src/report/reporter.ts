/**
 * Collects per-file results and renders them for humans (diff + grouped
 * findings + summary table) and for machines (JSON). Exit-code policy: `0` on
 * success (with or without warnings/flags/dynamic notes), `2` if any file
 * failed to parse.
 */
import chalk from 'chalk';
import {
  type FileReport,
  type Finding,
  type FindingKind,
  type Report,
  type ReportSummary,
  type Surface,
} from './types.js';

export interface ParseError {
  file: string;
  surface: Surface;
  message: string;
}

export interface ReporterMeta {
  fromVersion: string;
  toVersion: string;
  dryRun: boolean;
}

export class Reporter {
  private readonly files: FileReport[] = [];
  private readonly errors: ParseError[] = [];

  constructor(private readonly meta: ReporterMeta) {}

  addFile(report: FileReport): void {
    this.files.push(report);
  }

  addError(error: ParseError): void {
    this.errors.push(error);
  }

  build(): Report {
    const summary: ReportSummary = {
      filesScanned: this.files.length + this.errors.length,
      filesChanged: this.files.filter((f) => f.changed).length,
      changes: this.countKind('change'),
      warnings: this.countKind('warn'),
      flags: this.countKind('flag'),
      dynamic: this.countKind('dynamic'),
      errors: this.errors.length,
    };
    return {
      fromVersion: this.meta.fromVersion,
      toVersion: this.meta.toVersion,
      dryRun: this.meta.dryRun,
      files: this.files,
      summary,
    };
  }

  private countKind(kind: FindingKind): number {
    return this.files.reduce(
      (total, file) => total + file.findings.filter((f) => f.kind === kind).length,
      0,
    );
  }

  /** Plain JSON report (errors included under a top-level key). */
  toJSON(report: Report): string {
    return JSON.stringify({ ...report, parseErrors: this.errors }, null, 2);
  }

  renderHuman(report: Report, options: { showDiff: boolean } = { showDiff: true }): string {
    const out: string[] = [];

    for (const file of report.files) {
      if (!file.changed && file.findings.length === 0) continue;
      out.push(chalk.bold.underline(file.file));
      if (options.showDiff && file.diff) out.push(colorizeDiff(file.diff));
      for (const finding of file.findings) out.push(`  ${renderFinding(finding)}`);
      out.push('');
    }

    for (const error of this.errors) {
      out.push(`${chalk.red('✖ parse error')} ${chalk.bold(error.file)}: ${error.message}`);
    }
    if (this.errors.length) out.push('');

    out.push(renderSummary(report));
    return out.join('\n');
  }
}

export const exitCode = (report: Report): number => (report.summary.errors > 0 ? 2 : 0);

const KIND_LABEL: Record<FindingKind, (s: string) => string> = {
  change: (s) => chalk.green(s),
  warn: (s) => chalk.yellow(s),
  flag: (s) => chalk.yellow(s),
  dynamic: (s) => chalk.magenta(s),
};

const KIND_GLYPH: Record<FindingKind, string> = {
  change: '✓',
  warn: '⚠',
  flag: '⚠',
  dynamic: '✋',
};

const renderFinding = (finding: Finding): string => {
  const color = KIND_LABEL[finding.kind];
  const loc = finding.line ? chalk.dim(`:${finding.line}`) : '';
  const rule = finding.ruleId ? chalk.dim(` [${finding.ruleId}]`) : '';
  const head = `${color(KIND_GLYPH[finding.kind])}${loc} ${finding.message}${rule}`;
  if (finding.before !== undefined && finding.after !== undefined) {
    return `${head}\n      ${chalk.red(finding.before)} ${chalk.dim('→')} ${chalk.green(finding.after)}`;
  }
  return head;
};

const colorizeDiff = (diff: string): string =>
  diff
    .split('\n')
    .map((line) => {
      if (line.startsWith('+++') || line.startsWith('---')) return chalk.bold(line);
      if (line.startsWith('@@')) return chalk.cyan(line);
      if (line.startsWith('+')) return chalk.green(line);
      if (line.startsWith('-')) return chalk.red(line);
      return chalk.dim(line);
    })
    .join('\n');

const renderSummary = (report: Report): string => {
  const s = report.summary;
  const mode = report.dryRun ? chalk.yellow('dry-run (no files written)') : chalk.green('write');
  const parts = [
    `${chalk.bold('Magma codemods')} ${report.fromVersion} → ${report.toVersion}  ${chalk.dim(`[${mode}]`)}`,
    `  files scanned : ${s.filesScanned}`,
    `  files changed : ${s.filesChanged}`,
    `  changes       : ${chalk.green(String(s.changes))}`,
    `  warnings      : ${s.warnings ? chalk.yellow(String(s.warnings)) : '0'}`,
    `  flags         : ${s.flags ? chalk.yellow(String(s.flags)) : '0'}`,
    `  dynamic (manual): ${s.dynamic ? chalk.magenta(String(s.dynamic)) : '0'}`,
    `  parse errors  : ${s.errors ? chalk.red(String(s.errors)) : '0'}`,
  ];
  return parts.join('\n');
};

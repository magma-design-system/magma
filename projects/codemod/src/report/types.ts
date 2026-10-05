/** Report data model shared by the transformers, the reporter and the JSON output. */

export type Surface = 'html' | 'react' | 'angular' | 'css';

export type FindingKind =
  /** A transformation that was applied (or would be, in dry-run). */
  | 'change'
  /** A removed prop: an inline comment is injected and the consumer warned. */
  | 'warn'
  /** Applied but needs a look: enum literal outside the v2 set, CSS value-format change. */
  | 'flag'
  /** Dynamic / unanalyzable usage the tool cannot rewrite safely — manual action required. */
  | 'dynamic';

export interface Finding {
  kind: FindingKind;
  surface: Surface;
  file: string;
  /** 1-based line, when known. */
  line?: number;
  column?: number;
  /** The rule that produced (or would have produced) this finding. */
  ruleId?: string;
  /** Component tag, e.g. `mds-dropdown`. */
  component?: string;
  message: string;
  before?: string;
  after?: string;
  /**
   * The class token(s) as written, for findings that leave a decision to the
   * reader: the Markdown report groups the same token across files under it.
   */
  token?: string;
  /** Short label of why the site needs a decision: `seed as a background`, `removed in v2`. */
  reason?: string;
  /** Ready-to-paste replacements for `token`, best first. */
  alternatives?: Alternative[];
}

/** One possible replacement for a reported class token. */
export interface Alternative {
  /** The full class as it would be written, variants and modifier included. */
  value: string;
  /** OKLab deltaE x100 from what the token painted in light (and dark, when known). */
  light: number;
  dark?: number;
}

export interface FileReport {
  file: string;
  surface: Surface;
  changed: boolean;
  findings: Finding[];
  /** Unified diff of the file, present when `changed` and source/output are available. */
  diff?: string;
}

export interface ReportSummary {
  filesScanned: number;
  filesChanged: number;
  changes: number;
  warnings: number;
  flags: number;
  dynamic: number;
  /** Files that failed to parse. */
  errors: number;
}

export interface Report {
  fromVersion: string;
  toVersion: string;
  dryRun: boolean;
  files: FileReport[];
  summary: ReportSummary;
  /** Run-level notes: prerequisites the changes rely on, printed once under the summary. */
  notes?: string[];
}

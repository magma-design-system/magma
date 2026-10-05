/**
 * The problems output (`--problems`): one line per place that needs a hand,
 * `path:line:column: severity: message`, the shape editors read as a location.
 * In VS Code a task with the problem matcher below underlines every place in
 * the code, with the decision (alternatives, context, likely role) in the
 * hover tooltip of the class.
 *
 *   "problemMatcher": {
 *     "owner": "magma-codemods",
 *     "fileLocation": ["relative", "${workspaceFolder}"],
 *     "pattern": {
 *       "regexp": "^(.+?):(\\d+):(\\d+): (error|warning|info): (.*)$",
 *       "file": 1, "line": 2, "column": 3, "severity": 4, "message": 5
 *     }
 *   }
 *
 * Automatic changes are not listed: only what is left to decide or check.
 */
import { relative, resolve, sep } from 'node:path';
import { type Finding, type FindingKind, type Report } from './types.js';

export interface ProblemsOptions {
  /** Directory the paths are written relative to: the editor's workspace folder. */
  cwd: string;
  /** Files that failed to parse. */
  errors?: Array<{ file: string; message: string }>;
}

const SEVERITY: Record<Exclude<FindingKind, 'change'>, 'warning' | 'info'> = {
  dynamic: 'warning',
  warn: 'warning',
  flag: 'info',
};

const oneLine = (s: string): string => s.replace(/\s+/g, ' ').trim();

/** The message of one problem: the decision with its alternatives and hint, or the finding's message. */
const messageOf = (f: Finding): string => {
  if (!f.token || !f.reason) return f.message;
  const alternatives = f.alternatives?.length
    ? `: ${f.alternatives.map((a) => `\`${a.value}\``).join(' / ')}`
    : '';
  const place = f.context ? `; ${f.context}` : '';
  const hint = f.hint ? ` it could be a \`${f.hint.value}\` (dE ${f.hint.light.toFixed(1)})` : '';
  return `\`${f.token}\`, ${f.reason}${alternatives}${place}${hint}`;
};

export const renderProblems = (report: Report, options: ProblemsOptions): string => {
  const path = (file: string): string =>
    (relative(options.cwd, resolve(options.cwd, file)) || file).split(sep).join('/');
  const out: string[] = [];
  for (const file of report.files)
    for (const f of file.findings) {
      if (f.kind === 'change') continue;
      out.push(
        `${path(file.file)}:${f.line ?? 1}:${f.column ?? 1}: ${SEVERITY[f.kind]}: ${oneLine(messageOf(f))}`,
      );
    }
  for (const e of options.errors ?? [])
    out.push(`${path(e.file)}:1:1: error: ${oneLine(e.message)}`);
  return out.join('\n');
};

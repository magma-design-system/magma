/**
 * The Markdown report (`--report-md`): a worklist for the part of the migration
 * the codemod could not finish on its own.
 *
 *  1. Decisions by token: every class token that needs a human choice, once,
 *     with how to decide, its ready-to-paste alternatives and every place it
 *     occurs - one choice, applied everywhere.
 *  2. Suggestions: the value matches a rerun with `--accept-semantic` writes.
 *  3. A checklist per file, automatic changes folded away.
 */
import { relative, resolve, sep } from 'node:path';
import { type Finding, type Report } from './types.js';

export interface MarkdownOptions {
  /** Directory the links are relative to: where the Markdown file is written. */
  baseDir: string;
  /** Directory the report's (possibly relative) file paths are relative to. */
  cwd: string;
  /** Files that failed to parse. */
  errors?: Array<{ file: string; message: string }>;
}

/** How to make each kind of decision, keyed by the finding's `reason`. */
const HOW_TO_DECIDE: Record<string, string> = {
  'seed as a background':
    'Pick by what the element is: the page or a section -> `surface-default`, a card or panel -> `surface-raised`, a popover, menu or modal -> `surface-overlay`. The colour alone cannot tell.',
  'roles differ in dark':
    'Same light, different dark: a pill, chip or track -> `wash-*`; an area grouping content -> `surface-*`.',
  'no close role':
    'The class is still a valid v2 colour, so nothing breaks if you keep it. Pick a role only if the element should follow themes and contrast preferences.',
  'removed in v2':
    'The class paints nothing in v2 today (Tailwind ignores unknown classes): replace it, or ignore this if your app defines the colour itself.',
  'step does not exist':
    'This step never existed, so the class has never painted anything: replace it or delete it.',
  'dark-only override':
    'v2 colours flip by themselves: delete it unless the dark colour is a deliberate choice. `--accept-semantic` deletes it.',
  'dark-only override in a fragment':
    'Its light class is in another fragment of the expression: delete it if that light class is a raw tone the codemod migrates, keep it if the light colour is fixed.',
  'renamed breakpoint in CSS':
    'Tailwind 4 has no `@screen`, and the v1 name now means another range: wrap the rules in the `@variant` shown (or the equivalent `@media`).',
  'more than one dark value': 'Keep one dark value, then rerun.',
  'same utility set twice': 'Keep one of the two classes, then rerun.',
};

const code = (s: string): string => `\`${s.replace(/`/g, "'")}\``;
const cell = (s: string): string => s.replace(/\|/g, '\\|');
const dE = (n: number | undefined): string => (n === undefined ? '-' : n.toFixed(1));
const isSuggestion = (f: Finding): boolean => f.reason?.startsWith('suggested') ?? false;
const isDecision = (f: Finding): boolean =>
  f.kind !== 'change' && f.token !== undefined && f.reason !== undefined;

interface Group {
  token: string;
  reason: string;
  finding: Finding;
  where: Array<{ file: string; line?: number }>;
}

/** The deepest directory every path sits in. */
const commonDir = (paths: string[]): string => {
  if (paths.length === 0) return '';
  const split = paths.map((p) => p.split(sep).slice(0, -1));
  const first = split[0]!;
  let n = first.length;
  for (const parts of split) {
    let i = 0;
    while (i < n && parts[i] === first[i]) i++;
    n = i;
  }
  return first.slice(0, n).join(sep);
};

export const renderMarkdown = (report: Report, options: MarkdownOptions): string => {
  const abs = (file: string): string => resolve(options.cwd, file);
  const root = commonDir(report.files.map((f) => abs(f.file)));
  const link = (file: string, line?: number): string => {
    const shown = relative(root, abs(file)) || file;
    const target = encodeURI(relative(options.baseDir, abs(file)) || file)
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29');
    return `[${code(line ? `${shown}:${line}` : shown)}](${target}${line ? `#L${line}` : ''})`;
  };

  const groups = new Map<string, Group>();
  for (const file of report.files)
    for (const f of file.findings) {
      if (!isDecision(f)) continue;
      const key = `${f.token}\u0000${f.reason}`;
      const group = groups.get(key) ?? {
        token: f.token!,
        reason: f.reason!,
        finding: f,
        where: [],
      };
      group.where.push({ file: file.file, line: f.line });
      groups.set(key, group);
    }
  const byCount = (a: Group, b: Group): number =>
    b.where.length - a.where.length || a.token.localeCompare(b.token);
  const decisions = [...groups.values()].filter((g) => !isSuggestion(g.finding)).sort(byCount);
  const suggestions = [...groups.values()].filter((g) => isSuggestion(g.finding)).sort(byCount);
  const anchor = new Map(decisions.map((d, i) => [d, `decision-${i + 1}`]));

  const s = report.summary;
  const out: string[] = [
    '# Magma codemods report',
    '',
    `${report.fromVersion} -> ${report.toVersion}, ${report.dryRun ? 'dry-run (no files written)' : 'written'}. ` +
      `${s.filesScanned} files scanned, ${s.filesChanged} changed: ${s.changes} changes, ${s.warnings} warnings, ` +
      `${s.flags} flags, ${s.dynamic} to migrate by hand, ${s.errors} parse errors.` +
      (root ? ` Paths are relative to ${code(root)}.` : ''),
    '',
    ...(report.notes ?? []).flatMap((note) => [`> **Note:** ${note}`, '']),
  ];

  if (decisions.length > 0) {
    const sites = decisions.reduce((n, d) => n + d.where.length, 0);
    out.push(
      '## Decisions by token',
      '',
      `${decisions.length} tokens in ${sites} places need a choice. Decide each token once: the same choice ` +
        'usually holds wherever it appears. Alternatives are ready to paste, best first; dE is the OKLab ' +
        'distance from what the token painted (x100, about 2 is just noticeable).',
      '',
      '| # | Token | Why | Places |',
      '| --- | --- | --- | --- |',
      ...decisions.map(
        (d, i) =>
          `| [${i + 1}](#${anchor.get(d)}) | ${cell(code(d.token))} | ${d.reason} | ${d.where.length} |`,
      ),
      '',
    );
    for (const d of decisions) {
      out.push(`<a id="${anchor.get(d)}"></a>`, '');
      out.push(`### ${code(d.token)}: ${d.reason} (${d.where.length})`, '');
      const how = HOW_TO_DECIDE[d.reason];
      if (how) out.push(`**How to decide:** ${how}`, '');
      const alternatives = d.finding.alternatives ?? [];
      if (alternatives.length > 0) {
        out.push('| Alternative | dE light | dE dark |', '| --- | --- | --- |');
        for (const a of alternatives)
          out.push(`| ${cell(code(a.value))} | ${dE(a.light)} | ${dE(a.dark)} |`);
        out.push('');
      }
      out.push(...d.where.map((w) => `- [ ] ${link(w.file, w.line)}`), '');
    }
  }

  if (suggestions.length > 0) {
    out.push(
      '## Suggestions',
      '',
      'Value matches the codemod writes when you rerun it with `--accept-semantic=exact` (exact only) or ' +
        '`--accept-semantic=near` (both). Review them here first; skip one with `--skip <rule>` or by ' +
        'editing the class by hand.',
      '',
      '| Token | Becomes | Tier | Places |',
      '| --- | --- | --- | --- |',
      ...suggestions.map((g) => {
        const to = g.finding.alternatives?.[0]?.value;
        const tier = /\((\w+)\)/.exec(g.reason)?.[1] ?? '';
        return `| ${cell(code(g.token))} | ${to ? cell(code(to)) : '-'} | ${tier} | ${g.where.length} |`;
      }),
      '',
    );
  }

  const touched = report.files.filter((f) => f.findings.length > 0);
  if (touched.length > 0) {
    out.push('## Files', '');
    for (const file of touched) {
      const todo = file.findings.filter((f) => f.kind !== 'change');
      const done = file.findings.filter((f) => f.kind === 'change');
      out.push(`### ${link(file.file)}`, '');
      for (const f of todo) {
        const at = f.line ? `L${f.line} ` : '';
        let text = f.message;
        if (isDecision(f) && isSuggestion(f)) {
          const to = f.alternatives?.[0]?.value;
          text = `${code(f.token!)}${to ? ` -> ${code(to)}` : ''} (${f.reason}, see Suggestions)`;
        } else if (isDecision(f)) {
          const group = groups.get(`${f.token}\u0000${f.reason}`)!;
          const ref = anchor.get(group);
          const alts = f.alternatives?.length
            ? `: ${f.alternatives.map((a) => code(a.value)).join(' / ')}`
            : '';
          text = `${code(f.token!)}, ${ref ? `[${f.reason}](#${ref})` : f.reason}${alts}`;
        }
        out.push(`- [ ] ${at}${text}`);
      }
      if (todo.length > 0) out.push('');
      if (done.length > 0) {
        out.push(
          `<details><summary>${report.dryRun ? 'Would be applied' : 'Applied'} automatically (${done.length})</summary>`,
          '',
          ...done.map((f) => {
            const at = f.line ? `L${f.line} ` : '';
            const diff =
              f.before !== undefined && f.after !== undefined
                ? `${code(f.before)} -> ${f.after ? code(f.after) : '(removed)'}: `
                : '';
            return `- ${at}${diff}${f.message}`;
          }),
          '',
          '</details>',
          '',
        );
      }
    }
  }

  if (options.errors?.length) {
    out.push('## Parse errors', '');
    for (const e of options.errors) out.push(`- ${link(e.file)}: ${e.message}`);
    out.push('');
  }
  return out.join('\n');
};

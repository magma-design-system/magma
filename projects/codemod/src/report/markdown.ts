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
import { type SemanticThresholds } from '../manifest/schema.js';
import { roleMeaning } from './role-meaning.js';
import { type ContextHint, type Finding, type Report } from './types.js';

export interface MarkdownOptions {
  /** Directory the links are relative to: where the Markdown file is written. */
  baseDir: string;
  /** Directory the report's (possibly relative) file paths are relative to. */
  cwd: string;
  /** Files that failed to parse. */
  errors?: Array<{ file: string; message: string }>;
  /** The category L tiers the dE figures are marked against (default: the bundled manifest's). */
  thresholds?: Pick<SemanticThresholds, 'exact' | 'near'>;
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
const html = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** A file row: inline, so it shares the line with a task-list checkbox. */
const ROW =
  'display: inline-flex; gap: 0.75em; align-items: baseline; width: calc(100% - 2em); vertical-align: baseline';
const PATH =
  'flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap';
const isSuggestion = (f: Finding): boolean => f.reason?.startsWith('suggested') ?? false;
const isDecision = (f: Finding): boolean =>
  f.kind !== 'change' && f.token !== undefined && f.reason !== undefined;

interface Group {
  token: string;
  reason: string;
  finding: Finding;
  where: Array<{ file: string; line?: number; hint?: ContextHint; context?: string }>;
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

/** `2 -> 3`, or every step of a chain: `1.12.0 -> 2.0.0 -> 3`. */
export const versions = (report: Report, arrow = '->'): string =>
  report.jumps && report.jumps.length > 1
    ? [...report.jumps.map((j) => j.split(' -> ')[0]), report.toVersion].join(` ${arrow} `)
    : `${report.fromVersion} ${arrow} ${report.toVersion}`;

export const renderMarkdown = (report: Report, options: MarkdownOptions): string => {
  const { exact, near } = options.thresholds ?? { exact: 0.5, near: 2 };
  /** A dE figure with its verdict: identical, acceptable (not noticeable) or far. */
  const dE = (n: number | undefined): string =>
    n === undefined
      ? '-'
      : `${n <= exact ? '\u2705' : n <= near ? '\u26a0\ufe0f' : '\u26d4\ufe0f'} ${n.toFixed(1)}`;
  const abs = (file: string): string => resolve(options.cwd, file);
  const root = commonDir(report.files.map((f) => abs(f.file)));
  const target = (file: string): string =>
    encodeURI(relative(options.baseDir, abs(file)) || file)
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29');
  /**
   * The file's path across the whole row, cut with an ellipsis when too long,
   * and the link that opens it on the right. Inline HTML, since Markdown has no
   * layout: where styles are stripped (e.g. GitHub) it reads as path + link.
   */
  const fileRef = (file: string): string =>
    `<span style="${ROW}"><code style="${PATH}">${html(`./${relative(root, abs(file)) || file}`)}</code>` +
    `<a href="${target(file)}" style="flex: none">Open file</a></span>`;
  const lineLink = (file: string, line: number): string => `[L${line}](${target(file)}#L${line})`;
  const at = (file: string, line?: number): string => (line ? `${lineLink(file, line)} ` : '');

  /** Where a finding sits and, when the markup tells, the role it could be and how close it is (light). */
  const placeOf = (f: Finding): string | undefined =>
    f.context &&
    `${f.context}${f.hint ? ` it could be a ${code(f.hint.value)} ${dE(f.hint.light)}` : ''}`;

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
      group.where.push({ file: file.file, line: f.line, hint: f.hint, context: placeOf(f) });
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
    `${versions(report)}, ${report.dryRun ? 'dry-run (no files written)' : 'written'}. ` +
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
        'distance from what the token painted (x100, about 2 is just noticeable): ' +
        `\u2705 identical (up to ${exact}), \u26a0\ufe0f acceptable (up to ${near}), \u26d4\ufe0f far. ` +
        'Alternative meaning is what the role is for in the system, not a reading of your element: the codemod only ' +
        'sees the colour, so pick the alternative whose meaning matches what the element is.',
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
        out.push(
          '| Alternative | dE light | dE dark | Alternative meaning |',
          '| --- | --- | --- | --- |',
        );
        for (const a of alternatives)
          out.push(
            `| ${cell(code(a.value))} | ${dE(a.light)} | ${dE(a.dark)} | ${cell(roleMeaning(a.value) ?? '-')} |`,
          );
        out.push('');
      }
      // one checkbox per file, its occurrences linked to the lines
      const checklist = (where: Group['where']): string[] => {
        const lines = new Map<string, Map<number, string | undefined>>();
        for (const w of where) {
          const list = lines.get(w.file) ?? new Map<number, string | undefined>();
          if (w.line && !list.has(w.line)) list.set(w.line, w.context);
          lines.set(w.file, list);
        }
        return [...lines].flatMap(([file, list]) => {
          const sorted = [...list].sort((a, b) => a[0] - b[0]);
          if (sorted.length === 0) return [`- [ ] ${fileRef(file)}`];
          // where the markup was read, every occurrence with its context: on the
          // Occurrences line when it is the only one, one per line otherwise
          const one = ([l, context]: [number, string | undefined]): string =>
            `${lineLink(file, l)}${context ? ` ${context}` : ''}`;
          if (sorted.some(([, context]) => context))
            return sorted.length === 1
              ? [`- [ ] ${fileRef(file)}\\`, `  Occurrences ${one(sorted[0]!)}`]
              : [
                  `- [ ] ${fileRef(file)}\\`,
                  '  Occurrences\\',
                  ...sorted.map((o, k) => `  ${one(o)}${k < sorted.length - 1 ? '\\' : ''}`),
                ];
          return [
            `- [ ] ${fileRef(file)}\\`,
            `  Occurrences ${sorted.map(([l]) => lineLink(file, l)).join(' ')}`,
          ];
        });
      };
      // the places the markup points at one answer, batched under it
      const byHint = new Map<string, Group['where']>();
      for (const w of d.where)
        if (w.hint) byHint.set(w.hint.value, [...(byHint.get(w.hint.value) ?? []), w]);
      if (byHint.size === 0) out.push(...checklist(d.where));
      else {
        for (const [value, where] of [...byHint].sort((a, b) => b[1].length - a[1].length)) {
          const why = [...new Set(where.map((w) => w.hint!.why))].join(', ');
          out.push(
            `**Likely ${code(value)}** ${dE(where[0]!.hint!.light)} (${where.length}): ${why}`,
            '',
            ...checklist(where),
            '',
          );
        }
        const rest = d.where.filter((w) => !w.hint);
        if (rest.length > 0) out.push(`**No hint** (${rest.length})`, '', ...checklist(rest));
      }
      out.push('');
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
  /** In a chain, the jump of each item: `(2 -> 3)`. */
  const jumpOf = (f: Finding): string =>
    (report.jumps?.length ?? 0) > 1 && f.jump ? ` (${f.jump})` : '';
  if (touched.length > 0) {
    out.push('## Files', '');
    for (const file of touched) {
      const todo = file.findings.filter((f) => f.kind !== 'change');
      const done = file.findings.filter((f) => f.kind === 'change');
      out.push(`### ${fileRef(file.file)}`, '');
      for (const f of todo) {
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
        } else if (f.before !== undefined && f.after !== undefined) {
          // a rewrite to make by hand, ready to paste
          text = `${f.message}: ${code(f.before)} -> ${code(f.after)}`;
        }
        out.push(
          `- [ ] ${at(file.file, f.line)}${text}${jumpOf(f)}${placeOf(f) ? ` - ${placeOf(f)}` : ''}`,
        );
      }
      if (todo.length > 0) out.push('');
      if (done.length > 0) {
        out.push(
          `<details><summary>${report.dryRun ? 'Would be applied' : 'Applied'} automatically (${done.length})</summary>`,
          '',
          ...done.map((f) => {
            const diff =
              f.before !== undefined && f.after !== undefined
                ? `${code(f.before)} -> ${f.after ? code(f.after) : '(removed)'}: `
                : '';
            return `- ${at(file.file, f.line)}${diff}${f.message}${jumpOf(f)}${f.context ? ` - ${f.context}` : ''}`;
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
    for (const e of options.errors) out.push(`- ${fileRef(e.file)}: ${e.message}`);
    out.push('');
  }
  return out.join('\n');
};

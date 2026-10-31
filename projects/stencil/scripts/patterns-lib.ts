/**
 * What the pattern commands of this repository share (check.patterns, generate.pattern,
 * list.patterns; #1174): where the patterns are, the new file from the template, the list as
 * text. The format and its checks live in the lint core
 * (projects/lint/src/core/patterns.ts), which ships, since get_pattern reads the same files.
 * The format is written in docs/PATTERNS.md.
 */
import { join } from 'node:path';
import { PROJECT_DIR } from './meta';
import {
  FOUNDATION,
  PATTERN_GROUPS,
  readPatternDir,
  type ListEntry,
  type PatternFile,
} from '../../lint/src/core/patterns';

export const REPO = join(PROJECT_DIR, '../..');
/** The sources of the patterns Magma ships, as agents/patterns/<id>.md. */
export const PATTERNS_DIR = join(REPO, 'docs/agents/patterns');
/** The template of a new pattern: its fields are the questions that define one. */
export const TEMPLATE = join(PROJECT_DIR, 'template/pattern.md');
/** The template of a new domain of Foundation (kind foundation, #1196). */
export const FOUNDATION_TEMPLATE = join(PROJECT_DIR, 'template/foundation.md');

export const readPatterns = (dir = PATTERNS_DIR): PatternFile[] => readPatternDir(dir);

/** `notification-center` -> `Notification center`. */
export const titleOf = (id: string): string =>
  (id.charAt(0).toUpperCase() + id.slice(1)).replace(/-/g, ' ');

export interface NewPattern {
  id: string;
  title: string;
  /** Empty for a domain of Foundation, whose template has no group. */
  group: string;
  need: string;
  date: string;
}

/** The template with its `{{field}}` placeholders filled. */
export const fromTemplate = (template: string, fields: NewPattern): string =>
  template.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in fields ? fields[key as keyof NewPattern] : match,
  );

export interface ListFilter {
  /** pattern, block or foundation. */
  kind?: string;
  group?: string;
  status?: string;
  /** Only the patterns validated on no product yet. */
  notValidated?: boolean;
}

/** The list as the maintainer reads it in a terminal: the domains of Foundation, then the patterns by group, one line each. */
export const renderList = (entries: ListEntry[], filter: ListFilter = {}): string => {
  const shown = entries.filter(
    (one) =>
      (!filter.kind || one.kind === filter.kind) &&
      (!filter.group || one.group === filter.group) &&
      (!filter.status || one.status === filter.status) &&
      (!filter.notValidated || one.validatedOn.length === 0),
  );
  if (!shown.length) return 'No pattern matches.\n';
  const out: string[] = [];
  const sections: [string, ListEntry[]][] = [
    ['Foundation', shown.filter((one) => one.kind === FOUNDATION)],
    ...Object.entries(PATTERN_GROUPS).map(
      ([group, title]) =>
        [title, shown.filter((one) => one.kind !== FOUNDATION && one.group === group)] as [
          string,
          ListEntry[],
        ],
    ),
  ];
  for (const [title, inGroup] of sections) {
    if (!inGroup.length) continue;
    out.push(title);
    const width = Math.max(...inGroup.map((one) => one.id.length));
    for (const one of inGroup)
      out.push(
        `  ${one.id.padEnd(width)}  ${one.status.padEnd(9)}  ${one.title}${
          one.validatedOn.length ? ` (validated on ${one.validatedOn.join(', ')})` : ''
        }`,
      );
    out.push('');
  }
  const decided = shown.filter((one) => one.status === 'decided').length;
  const domains = shown.filter((one) => one.kind === FOUNDATION).length;
  out.push(
    `${shown.length - domains} pattern(s) and ${domains} domain(s) of Foundation, ${decided} decided.`,
  );
  return `${out.join('\n')}\n`;
};

/*
  The need and the place of a component (epic #1579): its usage files `4. When to use.md` and
  `5. Placement context.md`, read as data. The format is written in projects/stencil/SPEC.md,
  "Per-component usage docs", "`4. When to use.md` and `5. Placement context.md`", decided on the
  pilot #1580; this module reads it, it does not decide it. Three readers share it: the stencil
  build, which ships the files beside the component (scripts/component-docs.ts) and checks them
  (scripts/check-usage-docs.ts); the MCP server, which answers find_component and get_component
  from them, through the export `./lint` of magma.

  What counts as an answer of a `Not for` line (SPEC.md): the inline code after the first `: ` of
  the line that is a component of the build, a pattern of docs/agents/patterns/ by its id, or
  `gap`, when Magma has none. Any other inline code of the line (`href`, `type="radio"`) is not an
  answer. The components and the patterns are passed in, read from the installed data by the
  caller: this module keeps no list of them.
*/
import { DESIGN_LANGUAGE, parseRuleRef, useOf, type Pattern } from './patterns.js';

/** The headings of `4. When to use.md`, both required, in this order. */
export const WHEN_TO_USE_HEADINGS = ['Use it for', 'Not for'] as const;

/** The headings of `5. Placement context.md`, each optional, in this order. */
export const PLACEMENT_HEADINGS = [
  'Where it goes',
  'Not here',
  'Around it',
  'Inside it',
  'Narrow screens',
] as const;

/**
 * The section the build appends to the shipped placement.md, from the cases of the patterns that
 * use the component (placesOfComponent): never written by hand, since the patterns hold it.
 */
export const IN_THE_PATTERNS = 'In the patterns';

/** The answer of a `Not for` line when Magma has none: the gap path of the skill `ui`. */
export const GAP_ANSWER = 'gap';

/** The level of the headings of a usage file: Stencil nests them under its own `### 4. ...`. */
const HEADING_LEVEL = 4;

/** One item of a list of a usage file. */
export interface UsageLine {
  /** 1-based line in the file. */
  line: number;
  /** The text of the item, without its bullet. */
  text: string;
  /** For a `Not for` line, the text before its first `: `; for any other line, the whole text. */
  need: string;
  /** For a `Not for` line, the inline code after its first `: `; for any other line, all of it. */
  codes: string[];
}

/** What is wrong in the shape of a usage file, at its 1-based line. */
export interface UsageProblem {
  line: number;
  message: string;
}

export interface WhenToUse {
  useFor: UsageLine[];
  notFor: UsageLine[];
  problems: UsageProblem[];
}

export interface PlacementSection {
  heading: (typeof PLACEMENT_HEADINGS)[number];
  /** 1-based line of the heading. */
  line: number;
  lines: UsageLine[];
}

export interface Placement {
  /** The sections the file has, in its order. */
  sections: PlacementSection[];
  problems: UsageProblem[];
}

/** The inline code spans of a line of Markdown, trimmed, in their order. */
export const inlineCodes = (text: string): string[] =>
  [...text.matchAll(/`([^`]+)`/g)].map((match) => match[1]!.trim());

interface RawSection {
  heading: string;
  line: number;
  items: { line: number; text: string }[];
}

/**
 * The sections of a usage file made of `####` headings, each followed by a list of one line per
 * item: what the two files share. A heading outside `allowed`, repeated or out of the order of
 * `allowed`, text before the first heading and any line that is not a list item of its own (a
 * paragraph, a nested or continued item, a code block) are problems; a blank line is not. The
 * items under a heading that is refused are left out, its problem said once.
 */
const readSections = (md: string, allowed: readonly string[], file: string) => {
  const problems: UsageProblem[] = [];
  const sections: RawSection[] = [];
  const order = allowed.map((one) => `"${one}"`).join(', ');
  let current: RawSection | undefined;
  // under a heading that is refused: its items are left out, the heading says the problem
  let refused = false;
  let lastIndex = -1;
  md.replace(/\r\n/g, '\n')
    .split('\n')
    .forEach((raw, index) => {
      const line = index + 1;
      const text = raw.trimEnd();
      if (text.trim() === '') return;
      const heading = /^(#{1,6})\s+(.*?)\s*#*$/.exec(text);
      if (heading) {
        const hashes = heading[1]!;
        const title = heading[2]!;
        current = undefined;
        refused = true;
        if (title === IN_THE_PATTERNS) {
          problems.push({
            line,
            message: `"${IN_THE_PATTERNS}" is written by the build from the cases of the patterns, not by hand`,
          });
          return;
        }
        const at = allowed.indexOf(title);
        if (at === -1) {
          problems.push({
            line,
            message: `"${title}" is not a heading of ${file}: ${order}`,
          });
          return;
        }
        if (hashes.length !== HEADING_LEVEL)
          problems.push({
            line,
            message: `"${title}" is a heading of level ${HEADING_LEVEL}, ${'#'.repeat(HEADING_LEVEL)}`,
          });
        if (sections.some((one) => one.heading === title)) {
          problems.push({ line, message: `"${title}" comes twice` });
          return;
        }
        if (at < lastIndex)
          problems.push({ line, message: `"${title}" is out of order: ${order}` });
        lastIndex = Math.max(lastIndex, at);
        current = { heading: title, line, items: [] };
        refused = false;
        sections.push(current);
        return;
      }
      const item = /^[-*]\s+(\S.*)$/.exec(text);
      if (current && item) current.items.push({ line, text: item[1]! });
      else if (current || refused) {
        if (!item)
          problems.push({
            line,
            message: `not a list item of its own, one line each: "${text.trim()}"`,
          });
      } else problems.push({ line, message: `text outside the sections: "${text.trim()}"` });
    });
  for (const one of sections)
    if (!one.items.length)
      problems.push({ line: one.line, message: `"${one.heading}" has no item` });
  problems.sort((a, b) => a.line - b.line);
  return { sections, problems };
};

/**
 * `4. When to use.md` read as data: the needs it answers (`Use it for`) and the near needs it does
 * not (`Not for`), each split at its first `: ` into the need and the inline code that may answer
 * it (answersOf tells which does). Both headings are required, in that order.
 */
export const parseWhenToUse = (md: string): WhenToUse => {
  const { sections, problems } = readSections(md, WHEN_TO_USE_HEADINGS, '4. When to use.md');
  for (const heading of WHEN_TO_USE_HEADINGS)
    if (!sections.some((one) => one.heading === heading))
      problems.push({ line: 1, message: `no "${heading}" heading` });
  const itemsOf = (heading: string) => sections.find((one) => one.heading === heading)?.items ?? [];
  const useFor = itemsOf('Use it for').map(({ line, text }) => ({
    line,
    text,
    need: text,
    codes: inlineCodes(text),
  }));
  const notFor = itemsOf('Not for').map(({ line, text }) => {
    const colon = text.indexOf(': ');
    if (colon === -1) {
      problems.push({
        line,
        message: 'no ": " between the need and what answers it',
      });
      return { line, text, need: text, codes: [] };
    }
    return {
      line,
      text,
      need: text.slice(0, colon).trim(),
      codes: inlineCodes(text.slice(colon + 2)),
    };
  });
  problems.sort((a, b) => a.line - b.line);
  return { useFor, notFor, problems };
};

/**
 * `5. Placement context.md` read as data: up to five sections, in the order of
 * PLACEMENT_HEADINGS, each a list. A hand-written "In the patterns" is a problem: the build writes
 * it into the shipped file.
 */
export const parsePlacement = (md: string): Placement => {
  const { sections, problems } = readSections(md, PLACEMENT_HEADINGS, '5. Placement context.md');
  return {
    sections: sections.map(({ heading, line, items }) => ({
      heading: heading as PlacementSection['heading'],
      line,
      lines: items.map((item) => ({ ...item, need: item.text, codes: inlineCodes(item.text) })),
    })),
    problems,
  };
};

/** An answer of a `Not for` line: a component, a pattern by its id, or the gap. */
export interface UsageAnswer {
  kind: 'component' | 'pattern' | 'gap';
  id: string;
}

/**
 * The answers among the inline code of a line (UsageLine.codes): a component the release has, a
 * pattern it ships by its id, or `gap` (SPEC.md). Each once, in the order of the line; the rest of
 * the code (`href`, `type="radio"`) is no answer.
 */
export const answersOf = (
  line: Pick<UsageLine, 'codes'>,
  known: { tags: ReadonlySet<string>; patterns: ReadonlySet<string> },
): UsageAnswer[] => {
  const found: UsageAnswer[] = [];
  for (const code of line.codes) {
    const kind =
      code === GAP_ANSWER
        ? 'gap'
        : known.tags.has(code)
          ? 'component'
          : known.patterns.has(code)
            ? 'pattern'
            : undefined;
    if (kind && !found.some((one) => one.id === code)) found.push({ kind, id: code });
  }
  return found;
};

/**
 * The prefixes of the icon slugs (`mdi/home`, `mgg/...`), the icon sets of svg-icons as
 * mds-icon and check.usage-docs read them: inline code of the same form that is no citation.
 */
const ICON_SETS = new Set(['mi', 'mdi', 'mgg']);

/**
 * The rules a line cites by id, `pattern/id` in inline code (`actions/order`, `widths/dialog`), as
 * SPEC.md writes a rule of the design language: the short form of `{ id, from }`, parseRuleRef of
 * the patterns core. An icon slug of the same form is no citation.
 */
export const citationsOf = (line: Pick<UsageLine, 'codes'>): { from: string; id: string }[] =>
  line.codes.flatMap((code) => {
    const ref = parseRuleRef(code);
    return ref && !ICON_SETS.has(ref.from) ? [ref] : [];
  });

/** What a citation names: a rule of the pattern, a case or a region of it, with its text. */
export interface RuleCitation {
  from: string;
  id: string;
  kind: 'rule' | 'case' | 'region';
  /** The rule, the `where` of the case, the `what` of the region. */
  text: string;
}

/**
 * The rule, the case or the region `id` of the pattern `from`: a rule of its own in always-true
 * (never one it cites from another, which its own pattern names), a case, or the region of a
 * building block. None when the pattern or the id does not exist.
 */
export const resolveCitation = (
  patterns: Pattern[],
  from: string,
  id: string,
): RuleCitation | undefined => {
  const pattern = patterns.find((one) => one.id === from);
  if (!pattern) return undefined;
  const rule = pattern['always-true']?.find((one) => one.id === id && !one.from);
  if (rule) return { from, id, kind: 'rule', text: rule.rule ?? '' };
  const found = pattern.cases?.find((one) => one.id === id);
  if (found) return { from, id, kind: 'case', text: found.where };
  const region = pattern.regions?.find((one) => one.id === id);
  if (region) return { from, id, kind: 'region', text: region.what };
  return undefined;
};

/** A place a pattern gives a component: one case of it, or one region of a building block. */
export interface PatternPlace {
  pattern: string;
  /** The id of the case, or of the region. */
  id: string;
  /** What the component does there, the `role` of each entry of the case that writes it. */
  roles: string[];
  /** The `where` of the case, or the `what` of the region. */
  where: string;
}

const tagOfUse = (text: string): string | undefined =>
  /^mds-[a-z0-9-]+(?=\s|$)/.exec(text.trim())?.[0];

/**
 * The places the patterns give a component, which the build appends to its shipped placement.md
 * as "In the patterns" (SPEC.md): every case of a pattern whose `use` writes the tag, and every
 * region of a building block whose `use` does, by pattern id, then in the order of the file. The
 * domains of the design language are left out: their relations are rules, which a usage file cites
 * by id and get_component gives with rulesOfComponent; so are the candidates, which have no case.
 */
export const placesOfComponent = (patterns: Pattern[], tag: string): PatternPlace[] =>
  patterns
    .filter((one) => one.kind !== DESIGN_LANGUAGE && one.status !== 'candidate')
    .sort((a, b) => a.id.localeCompare(b.id))
    .flatMap((pattern) => [
      ...(pattern.cases ?? []).flatMap((one) => {
        const items = (one.use ?? []).filter((item) => tagOfUse(useOf(item)) === tag);
        if (!items.length) return [];
        const roles = items.flatMap((item) => (typeof item === 'string' ? [] : [item.role]));
        return [{ pattern: pattern.id, id: one.id, roles: [...new Set(roles)], where: one.where }];
      }),
      ...(pattern.regions ?? []).flatMap((one) =>
        (one.use ?? []).some((text) => tagOfUse(text) === tag)
          ? [{ pattern: pattern.id, id: one.id, roles: [], where: one.what }]
          : [],
      ),
    ]);

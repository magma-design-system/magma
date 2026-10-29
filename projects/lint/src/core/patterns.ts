/*
  The patterns Magma ships for agents (#1174, phase 5 of #1083): the solution to a task that
  spans components, written as data an agent can query. Their sources are
  docs/agents/patterns/<id>.md in the monorepo; the build ships them as agents/patterns/<id>.md
  in the entry packages, where the MCP server reads them (get_pattern). A product layer has the
  same shape, lives in the product's own repository (magma/patterns/<id>.md) and may add and
  narrow, never contradict an "Always true" rule.

  The format is written in docs/PATTERNS.md, "The format"; the decisions behind it are on
  #1174. This module holds what every reader shares: parsing a file, the checks that need no
  other data (the format, the coverage of the cases, the links, the layers), the answer for a
  situation, and the sections of the body generated from the frontmatter. What needs the
  installed data (the components, the lint rules) takes it as an argument.
*/
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import type { ComponentInfo } from './data.js';

/** Where a pattern stands: a known need with no definition yet, being written, every case decided. */
export const PATTERN_STATUSES = ['candidate', 'draft', 'decided'] as const;
/** A pattern is a flow of components over time; a building block, a structure of the page (later). */
export const PATTERN_KINDS = ['pattern', 'block'] as const;
/**
 * The groups of the patterns, as the docs site names them (plan/DIRECTION.md of
 * magma-design-system/docs, "Patterns section"; Feedback became Messages and states on
 * 2026-10-27).
 */
export const PATTERN_GROUPS: Record<string, string> = {
  navigation: 'Navigation',
  data: 'Data',
  input: 'Input',
  'messages-and-states': 'Messages and states',
  ai: 'AI',
};
/** The layer of the patterns Magma ships; a product layer names its product instead. */
export const MAGMA_LAYER = 'magma';

/**
 * The one variable that a case leaves out to mean a single value instead of any: a case that
 * does not say `decision` holds when the person has no decision to make (#1174, "How a pattern
 * is defined"). Every other variable left out means any of its values.
 */
export const NONE_WHEN_LEFT_OUT = 'decision';

/** The keys of each kind of entry that are not variables: no variable may take their names. */
const ENTRY_KEYS = {
  case: ['id', 'where', 'use', 'see', 'magma-gap'],
  gap: ['note'],
  'not-applicable': ['why'],
} as const;
const RESERVED = new Set<string>(Object.values(ENTRY_KEYS).flat());

const PATTERN_KEYS = new Set([
  'id',
  'aliases',
  'kind',
  'title',
  'group',
  'layer',
  'status',
  'need',
  'principle',
  'keywords',
  'not-for',
  'assumptions',
  'high-stakes',
  'components',
  'related',
  'validated-on',
  'variables',
  'cases',
  'gaps',
  'not-applicable',
  'always-true',
  'open-choices',
  'situations',
]);
const LAYER_KEYS = new Set(['id', 'extends', 'layer', 'narrows', 'situations']);
const RULE_KEYS = new Set(['id', 'rule', 'checked-by', 'lint', 'lint-planned', 'note', 'from']);
const CHOICE_KEYS = new Set(['id', 'default', 'may']);
const SITUATION_KEYS = new Set(['situation', 'case', 'use', 'note']);

export type Status = (typeof PATTERN_STATUSES)[number];
export type Kind = (typeof PATTERN_KINDS)[number];

export interface Variable {
  values: string[];
  /** What the variable asks about the situation. */
  means: string;
}

/** A case, a gap or a not-applicable entry: values of the variables, plus its own keys. */
export type Entry = Record<string, unknown>;

export interface Case extends Entry {
  id: string;
  where: string;
  /** `tag attribute=value ...`, each checked against the components of the release. */
  use?: string[];
  /** A case of the same pattern, or another pattern, that says more. */
  see?: string;
  /** What Magma lacks for this case. */
  'magma-gap'?: string;
}

export interface Rule {
  id: string;
  rule?: string;
  'checked-by'?: 'review' | 'lint';
  /** The lint rule that checks it, `magma/<name>`. */
  lint?: string;
  /** The lint rule that will check it, not written yet. */
  'lint-planned'?: string;
  note?: string;
  /** The pattern the rule belongs to, when this one cites it. */
  from?: string;
}

export interface Choice {
  id: string;
  default: string | number | boolean;
  may: string;
}

export interface Situation {
  situation: string;
  case?: string | string[];
  /** Another pattern answers it. */
  use?: string;
  note?: string;
}

export interface Pattern {
  id: string;
  aliases?: string[];
  kind: Kind;
  title: string;
  group: string;
  layer: string;
  status: Status;
  need: string;
  principle?: string;
  keywords?: string[];
  'not-for'?: { need: string; use: string }[];
  assumptions?: string[];
  'high-stakes'?: boolean;
  components?: string[];
  related?: string[];
  'validated-on'?: string[];
  variables?: Record<string, Variable>;
  cases?: Case[];
  gaps?: Entry[];
  'not-applicable'?: Entry[];
  'always-true'?: Rule[];
  'open-choices'?: Choice[];
  situations?: Situation[];
}

/** A product layer of a Magma pattern: it narrows the open choices and adds its situations. */
export interface Layer {
  id: string;
  /** `magma:<id>`. */
  extends: string;
  layer: string;
  narrows?: Record<string, unknown>;
  situations?: Situation[];
}

export interface PatternFile<T = Pattern> {
  file: string;
  data: T;
  body: string;
}

/* ---- reading ------------------------------------------------------------------------ */

/** The frontmatter and the body of a Markdown file; throws when it has no frontmatter. */
export const splitFrontmatter = (text: string): { front: string; body: string } => {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text.replace(/\r\n/g, '\n'));
  if (!match) throw new Error('no frontmatter between two --- lines at the top');
  return { front: match[1]!, body: match[2]! };
};

/** A pattern or a layer file, parsed. Throws on a file whose frontmatter is not YAML. */
export const parsePatternFile = <T = Pattern>(text: string, file = ''): PatternFile<T> => {
  const { front, body } = splitFrontmatter(text);
  const data: unknown = parse(front);
  if (!data || typeof data !== 'object' || Array.isArray(data))
    throw new Error(`${file}: the frontmatter is not a mapping`);
  return { file, data: data as T, body };
};

/** Every `<id>.md` of a folder, parsed, by file name; none when the folder does not exist. */
export const readPatternDir = <T = Pattern>(dir: string): PatternFile<T>[] =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((name) => name.endsWith('.md'))
        .sort()
        .map((name) => {
          const file = path.join(dir, name);
          return parsePatternFile<T>(readFileSync(file, 'utf8'), file);
        })
    : [];

export const isLayer = (data: object): data is Layer => 'extends' in data;

/* ---- the cases ---------------------------------------------------------------------- */

const variableNames = (pattern: Pattern) => Object.keys(pattern.variables ?? {});

/** Does an entry hold for a combination: a variable it gives, any of its values; one it leaves out, any value (none for `decision`). */
export const entryMatches = (entry: Entry, combo: Record<string, string>, names: string[]) =>
  names.every((name) =>
    name in entry
      ? [entry[name]].flat().includes(combo[name])
      : name === NONE_WHEN_LEFT_OUT
        ? combo[name] === 'none'
        : true,
  );

/** Every combination of the values of the variables, the given ones fixed. */
export const combinations = (
  variables: Record<string, Variable>,
  fixed: Record<string, string> = {},
): Record<string, string>[] => {
  let combos: Record<string, string>[] = [{}];
  for (const [name, { values }] of Object.entries(variables))
    combos = combos.flatMap((combo) =>
      (name in fixed ? [fixed[name]!] : values).map((value) => ({ ...combo, [name]: value })),
    );
  return combos;
};

export type EntryKind = 'case' | 'gap' | 'not-applicable';
export interface Hit {
  kind: EntryKind;
  entry: Entry;
}

const entriesOf = (pattern: Pattern): Hit[] => [
  ...(pattern.cases ?? []).map((entry) => ({ kind: 'case' as const, entry })),
  ...(pattern.gaps ?? []).map((entry) => ({ kind: 'gap' as const, entry })),
  ...(pattern['not-applicable'] ?? []).map((entry) => ({ kind: 'not-applicable' as const, entry })),
];

export interface Coverage {
  total: number;
  /** Combinations no case, gap or not-applicable entry holds for. */
  none: Record<string, string>[];
  /** Combinations two cases hold for: gaps and not-applicable entries may overlap. */
  conflicts: { combo: Record<string, string>; cases: string[] }[];
}

/** The check of #1174: every combination in exactly one case, or in a gap or a not-applicable entry. */
export const coverage = (pattern: Pattern): Coverage => {
  const names = variableNames(pattern);
  const entries = entriesOf(pattern);
  const combos = names.length ? combinations(pattern.variables!) : [];
  const result: Coverage = { total: combos.length, none: [], conflicts: [] };
  for (const combo of combos) {
    const hits = entries.filter(({ entry }) => entryMatches(entry, combo, names));
    if (!hits.length) result.none.push(combo);
    const cases = hits.filter((hit) => hit.kind === 'case');
    if (cases.length > 1)
      result.conflicts.push({ combo, cases: cases.map(({ entry }) => String(entry.id)) });
  }
  return result;
};

/** The coverage as the check reports it: the combinations with no entry and the ones two cases hold for, five of each at most. */
export const coverageErrors = ({ total, none, conflicts }: Coverage): string[] => {
  const pairs = (combo: Record<string, string>) =>
    Object.entries(combo)
      .map(([name, value]) => `${name}=${value}`)
      .join(' ');
  const errors: string[] = [];
  if (none.length)
    errors.push(
      `${none.length} of ${total} combinations have no case, gap or not-applicable entry, such as:\n${none
        .slice(0, 5)
        .map((combo) => `    ${pairs(combo)}`)
        .join('\n')}`,
    );
  for (const { combo, cases } of conflicts.slice(0, 5))
    errors.push(`two cases on one combination, ${cases.join(' and ')}: ${pairs(combo)}`);
  return errors;
};

export interface Answer {
  /** The entries that may answer, given what is known: one when the situation is decided. */
  hits: Hit[];
  /** The variables still to know to tell the hits apart. */
  missing: string[];
}

/**
 * The case for a situation: the values the agent knows, the others open (`decision` left out
 * means none, as in a case). Throws on a variable or a value the pattern does not have.
 */
export const answer = (pattern: Pattern, known: Record<string, string>): Answer => {
  const variables = pattern.variables ?? {};
  const names = Object.keys(variables);
  for (const [name, value] of Object.entries(known)) {
    if (!(name in variables))
      throw new Error(
        `${pattern.id} has no variable ${name}: its variables are ${names.join(', ')}.`,
      );
    if (!variables[name]!.values.includes(value))
      throw new Error(
        `${name} of ${pattern.id} is one of ${variables[name]!.values.join(', ')}, not ${value}.`,
      );
  }
  const fixed =
    NONE_WHEN_LEFT_OUT in variables && !(NONE_WHEN_LEFT_OUT in known)
      ? { ...known, [NONE_WHEN_LEFT_OUT]: 'none' }
      : known;
  const entries = entriesOf(pattern);
  const combos = combinations(variables, fixed);
  // what answers a combination: its cases; with none, its first gap; else its first
  // not-applicable entry (two reasons for the same "not applicable" make no difference)
  const found = combos.map((combo) => {
    const matching = entries.flatMap((hit, index) =>
      entryMatches(hit.entry, combo, names) ? [index] : [],
    );
    const cases = matching.filter((index) => entries[index]!.kind === 'case');
    if (cases.length) return cases;
    const gap = matching.find((index) => entries[index]!.kind === 'gap');
    return gap !== undefined ? [gap] : matching.slice(0, 1);
  });
  // a variable is still missing when, the others equal, two of its values lead to different entries
  const missing = names.filter((name) => {
    if (name in fixed) return false;
    const byRest = new Map<string, Set<string>>();
    combos.forEach((combo, index) => {
      const rest = names
        .filter((one) => one !== name)
        .map((one) => combo[one])
        .join('|');
      byRest.set(rest, (byRest.get(rest) ?? new Set()).add(found[index]!.join(',')));
    });
    return [...byRest.values()].some((keys) => keys.size > 1);
  });
  const hits = [...new Set(found.flat())].sort((a, b) => a - b).map((index) => entries[index]!);
  return { hits, missing };
};

/* ---- the format --------------------------------------------------------------------- */

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const isString = (value: unknown): value is string => typeof value === 'string' && value !== '';
const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);

/** A `use` of a case: a tag and its attributes, `mds-toast variant=error dismissible`. */
export interface Use {
  tag: string;
  attributes: { name: string; value?: string }[];
}

export const parseUse = (use: string): Use | undefined => {
  const [tag, ...rest] = use.trim().split(/\s+/);
  if (!tag || !/^mds-[a-z0-9-]+$/.test(tag)) return undefined;
  const attributes = [];
  for (const part of rest) {
    const match = /^([a-z][a-z0-9-]*)(?:=(\S+))?$/.exec(part);
    if (!match) return undefined;
    attributes.push(
      match[2] === undefined ? { name: match[1]! } : { name: match[1]!, value: match[2] },
    );
  }
  return { tag, attributes };
};

/** What is wrong in the format of a Magma pattern or a product's own one: complete, typed, its entries on its own variables. */
export const formatErrors = ({ file, data }: PatternFile<Pattern>): string[] => {
  const errors: string[] = [];
  const say = (message: string) => errors.push(message);
  for (const key of Object.keys(data)) if (!PATTERN_KEYS.has(key)) say(`unknown field ${key}`);

  for (const key of ['id', 'title', 'group', 'layer', 'status', 'need', 'kind'] as const)
    if (!isString(data[key])) say(`${key} is required, as text`);
  if (isString(data.id) && !ID.test(data.id)) say(`id ${data.id} is not kebab-case`);
  if (file && isString(data.id) && path.basename(file) !== `${data.id}.md`)
    say(`the file of ${data.id} is ${data.id}.md`);
  if (isString(data.kind) && !(PATTERN_KINDS as readonly string[]).includes(data.kind))
    say(`kind is one of ${PATTERN_KINDS.join(', ')}`);
  if (isString(data.status) && !(PATTERN_STATUSES as readonly string[]).includes(data.status))
    say(`status is one of ${PATTERN_STATUSES.join(', ')}`);
  if (isString(data.group) && !(data.group in PATTERN_GROUPS))
    say(`group is one of ${Object.keys(PATTERN_GROUPS).join(', ')}`);
  if (data.aliases !== undefined && !isStringList(data.aliases)) say('aliases is a list of ids');
  for (const key of ['keywords', 'assumptions', 'components', 'related', 'validated-on'] as const)
    if (data[key] !== undefined && !Array.isArray(data[key])) say(`${key} is a list`);
  if (data['high-stakes'] !== undefined && typeof data['high-stakes'] !== 'boolean')
    say('high-stakes is true or false');
  for (const [index, one] of (data['not-for'] ?? []).entries())
    if (!isString(one?.need) || !isString(one?.use))
      say(`not-for ${index + 1} has a need and the pattern to use`);

  if (data.status === 'candidate') return errors;

  // a draft or a decided pattern answers its need
  for (const key of ['principle'] as const)
    if (!isString(data[key])) say(`${key} is required, as text`);
  for (const key of ['keywords', 'cases', 'always-true', 'situations', 'validated-on'] as const)
    if (!Array.isArray(data[key])) say(`${key} is required, as a list`);

  const variables = data.variables;
  if (!variables || typeof variables !== 'object' || !Object.keys(variables).length) {
    say('variables is required: what decides the case');
    return errors;
  }
  for (const [name, variable] of Object.entries(variables)) {
    if (RESERVED.has(name)) say(`no variable may be named ${name}: it is a key of the entries`);
    if (!ID.test(name)) say(`variable ${name} is not kebab-case`);
    if (!variable || !isStringList(variable.values) || !variable.values.length)
      say(`variable ${name} has its values, a list of text (quote yes, no and numbers)`);
    else if (new Set(variable.values).size !== variable.values.length)
      say(`variable ${name} repeats a value`);
    if (!isString(variable?.means)) say(`variable ${name} says what it means`);
    for (const key of Object.keys(variable ?? {}))
      if (key !== 'values' && key !== 'means') say(`variable ${name} has an unknown field ${key}`);
  }
  if (NONE_WHEN_LEFT_OUT in variables && !variables[NONE_WHEN_LEFT_OUT]?.values?.includes('none'))
    say(`variable ${NONE_WHEN_LEFT_OUT} has the value none: a case that leaves it out means none`);

  const entry = (kind: EntryKind, one: Entry, label: string) => {
    for (const [key, value] of Object.entries(one)) {
      if ((ENTRY_KEYS[kind] as readonly string[]).includes(key)) continue;
      const variable = variables[key];
      if (!variable) {
        say(`${label}: ${key} is neither a variable nor a field of a ${kind}`);
        continue;
      }
      const values = [value].flat();
      for (const each of values)
        if (typeof each !== 'string' || !variable.values?.includes(each))
          say(`${label}: ${key} is one of ${variable.values?.join(', ')}, not ${String(each)}`);
    }
  };
  const caseIds = new Set<string>();
  for (const [index, one] of (data.cases ?? []).entries()) {
    const label = `case ${isString(one?.id) ? one.id : index + 1}`;
    if (!isString(one?.id) || !ID.test(one.id)) say(`${label}: id is required, kebab-case`);
    else if (caseIds.has(one.id)) say(`${label}: the id is used twice`);
    else caseIds.add(one.id);
    if (!isString(one?.where)) say(`${label}: where is required`);
    if (one?.use !== undefined) {
      if (!isStringList(one.use)) say(`${label}: use is a list of "tag attribute=value"`);
      else
        for (const use of one.use)
          if (!parseUse(use)) say(`${label}: use "${use}" is not "mds-tag attribute=value ..."`);
    }
    for (const key of ['see', 'magma-gap'] as const)
      if (one?.[key] !== undefined && !isString(one[key])) say(`${label}: ${key} is text`);
    entry('case', one, label);
  }
  for (const [index, one] of (data.gaps ?? []).entries()) {
    if (!isString(one?.note)) say(`gap ${index + 1}: note is required: the question left open`);
    entry('gap', one, `gap ${index + 1}`);
  }
  for (const [index, one] of (data['not-applicable'] ?? []).entries()) {
    if (!isString(one?.why)) say(`not-applicable ${index + 1}: why is required`);
    entry('not-applicable', one, `not-applicable ${index + 1}`);
  }
  if (data.status === 'decided' && data.gaps?.length)
    say('a decided pattern has no gaps: decide them, or set the status to draft');

  const ruleIds = new Set<string>();
  for (const [index, rule] of (data['always-true'] ?? []).entries()) {
    const label = `always-true ${isString(rule?.id) ? rule.id : index + 1}`;
    if (!isString(rule?.id) || !ID.test(rule.id)) say(`${label}: id is required, kebab-case`);
    else if (ruleIds.has(rule.id)) say(`${label}: the id is used twice`);
    else ruleIds.add(rule.id);
    for (const key of Object.keys(rule ?? {}))
      if (!RULE_KEYS.has(key)) say(`${label}: unknown field ${key}`);
    if (rule?.from !== undefined) {
      if (Object.keys(rule).some((key) => key !== 'id' && key !== 'from'))
        say(`${label}: a rule cited from another pattern has only its id and from`);
      continue;
    }
    if (!isString(rule?.rule)) say(`${label}: rule is required`);
    if (rule?.['checked-by'] === 'lint') {
      if (!isString(rule.lint)) say(`${label}: checked by lint names the rule in lint`);
    } else if (rule?.['checked-by'] === 'review') {
      if (rule.lint !== undefined)
        say(`${label}: checked by review names no lint (lint-planned for one to write)`);
    } else say(`${label}: checked-by is review or lint`);
    for (const key of ['lint', 'lint-planned'] as const)
      if (rule?.[key] !== undefined && !/^magma\/[a-z0-9-]+$/.test(String(rule[key])))
        say(`${label}: ${key} is magma/<rule>`);
  }
  for (const [index, choice] of (data['open-choices'] ?? []).entries()) {
    const label = `open-choices ${isString(choice?.id) ? choice.id : index + 1}`;
    if (!isString(choice?.id) || !ID.test(choice.id)) say(`${label}: id is required, kebab-case`);
    else if (ruleIds.has(choice.id)) say(`${label}: the id is used twice`);
    else ruleIds.add(choice.id);
    for (const key of Object.keys(choice ?? {}))
      if (!CHOICE_KEYS.has(key)) say(`${label}: unknown field ${key}`);
    if (choice?.default === undefined || choice.default === null)
      say(`${label}: default is required`);
    if (!isString(choice?.may)) say(`${label}: may is required: what a product may choose`);
  }
  situationErrors(data.situations ?? [], 'situation', say);
  return errors;
};

const situationErrors = (
  situations: Situation[],
  label: string,
  say: (message: string) => void,
) => {
  for (const [index, one] of situations.entries()) {
    const at = `${label} ${index + 1}`;
    for (const key of Object.keys(one ?? {}))
      if (!SITUATION_KEYS.has(key)) say(`${at}: unknown field ${key}`);
    if (!isString(one?.situation)) say(`${at}: situation is required`);
    if ((one?.case === undefined) === (one?.use === undefined))
      say(`${at}: a situation has a case, or the pattern to use instead`);
    if (one?.case !== undefined && !isString(one.case) && !isStringList(one.case))
      say(`${at}: case is a case id or a list of them`);
  }
};

/* ---- the data of the release -------------------------------------------------------- */

/** Global attributes a `use` may set on any component. */
const GLOBAL_ATTRIBUTE = /^(slot|role|id|title|lang|dir|hidden|tabindex|aria-[a-z]+|data-[a-z-]+)$/;

/** Every component and attribute a pattern names exists in the release, with a value it takes. */
export const componentErrors = (
  pattern: Pattern,
  components: Map<string, ComponentInfo>,
): string[] => {
  const errors: string[] = [];
  const listed = new Set(pattern.components ?? []);
  for (const tag of listed)
    if (!components.has(tag)) errors.push(`components: ${tag} is not a component of this release`);
  for (const one of pattern.cases ?? [])
    for (const text of one.use ?? []) {
      const use = parseUse(text);
      if (!use) continue;
      const component = components.get(use.tag);
      if (!component) {
        errors.push(`case ${one.id}: ${use.tag} is not a component of this release`);
        continue;
      }
      if (!listed.has(use.tag))
        errors.push(`case ${one.id}: ${use.tag} is missing from components`);
      for (const { name, value } of use.attributes) {
        if (GLOBAL_ATTRIBUTE.test(name)) continue;
        const prop = component.props.get(name);
        if (!prop) {
          errors.push(`case ${one.id}: ${use.tag} has no attribute ${name}`);
          continue;
        }
        if (prop.deprecation !== undefined)
          errors.push(`case ${one.id}: ${name} of ${use.tag} is deprecated: ${prop.deprecation}`);
        if (value === undefined) continue;
        if (prop.boolean && !prop.values?.length)
          errors.push(`case ${one.id}: ${name} of ${use.tag} is a boolean: write it bare`);
        else if (prop.values && !prop.values.includes(value))
          errors.push(
            `case ${one.id}: ${name} of ${use.tag} is one of ${prop.values.join(', ')}, not ${value}`,
          );
      }
    }
  return errors;
};

/** Every rule checked by lint names a rule the lint has; a planned one, a rule it does not have yet. */
export const lintErrors = (pattern: Pattern, lintRules: Set<string>): string[] => {
  const errors: string[] = [];
  for (const rule of pattern['always-true'] ?? []) {
    if (rule.lint && !lintRules.has(rule.lint))
      errors.push(`always-true ${rule.id}: the lint has no rule ${rule.lint}`);
    if (rule['lint-planned'] && lintRules.has(rule['lint-planned']))
      errors.push(
        `always-true ${rule.id}: ${rule['lint-planned']} exists now: checked-by lint, lint ${rule['lint-planned']}`,
      );
  }
  return errors;
};

/* ---- the links ---------------------------------------------------------------------- */

/** The patterns by id, and the ids a rename left behind. */
export const indexPatterns = (patterns: Pattern[]) => {
  const byId = new Map<string, Pattern>();
  const aliases = new Map<string, string>();
  for (const pattern of patterns) {
    byId.set(pattern.id, pattern);
    for (const alias of pattern.aliases ?? []) aliases.set(alias, pattern.id);
  }
  return { byId, aliases };
};

/** Every id a pattern cites names a pattern, a case or a rule that exists, never an old id. */
export const linkErrors = (patterns: Pattern[]): Map<string, string[]> => {
  const { byId, aliases } = indexPatterns(patterns);
  const found = new Map<string, string[]>();
  const ids = new Map<string, number>();
  for (const id of [...patterns.map((one) => one.id), ...aliases.keys()])
    ids.set(id, (ids.get(id) ?? 0) + 1);

  for (const pattern of patterns) {
    const errors: string[] = [];
    const say = (message: string) => errors.push(message);
    if ((ids.get(pattern.id) ?? 0) > 1)
      say(`the id ${pattern.id} is used twice, as an id or an alias`);
    const toPattern = (where: string, id: string) => {
      if (byId.has(id)) return;
      if (aliases.has(id)) say(`${where}: ${id} was renamed ${aliases.get(id)}`);
      else say(`${where}: no pattern ${id}`);
    };
    const caseIds = new Set((pattern.cases ?? []).map((one) => one.id));
    for (const id of pattern.related ?? []) toPattern('related', id);
    for (const one of pattern['not-for'] ?? []) toPattern('not-for', one.use);
    for (const one of pattern.cases ?? []) {
      if (!one.see) continue;
      const isCase = caseIds.has(one.see);
      const isPattern = byId.has(one.see) || aliases.has(one.see);
      if (isCase && isPattern) say(`case ${one.id}: see ${one.see} is both a case and a pattern`);
      else if (!isCase) toPattern(`case ${one.id}: see`, one.see);
    }
    for (const one of pattern.situations ?? []) {
      for (const id of [one.case ?? []].flat())
        if (!caseIds.has(id)) say(`situation "${one.situation}": no case ${id}`);
      if (one.use) toPattern(`situation "${one.situation}"`, one.use);
    }
    for (const rule of pattern['always-true'] ?? []) {
      if (!rule.from) continue;
      toPattern(`always-true ${rule.id}: from`, rule.from);
      const cited = byId.get(rule.from)?.['always-true']?.find((one) => one.id === rule.id);
      if (byId.has(rule.from) && (!cited || cited.from))
        say(`always-true ${rule.id}: ${rule.from} has no rule ${rule.id} of its own`);
    }
    if (errors.length) found.set(pattern.id, errors);
  }
  return found;
};

/* ---- the layers --------------------------------------------------------------------- */

/** `magma:message-placement` -> `message-placement`. */
export const extendedId = (layer: Layer) => /^magma:([a-z0-9-]+)$/.exec(layer.extends ?? '')?.[1];

/** What a product layer may not do: name a pattern Magma lacks, narrow what is not an open choice, above all an "Always true" rule. */
export const layerErrors = ({ data }: PatternFile<Layer>, patterns: Pattern[]): string[] => {
  const errors: string[] = [];
  const say = (message: string) => errors.push(message);
  for (const key of Object.keys(data))
    if (!LAYER_KEYS.has(key)) say(`unknown field ${key}: a layer narrows and adds situations`);
  if (!isString(data.layer) || data.layer === MAGMA_LAYER) say('layer is the name of the product');
  const id = extendedId(data);
  if (!id) {
    say('extends is magma:<id>');
    return errors;
  }
  const { byId, aliases } = indexPatterns(patterns);
  const base = byId.get(id);
  if (!base) {
    say(aliases.has(id) ? `${id} was renamed ${aliases.get(id)}` : `Magma has no pattern ${id}`);
    return errors;
  }
  if (base.status === 'candidate') say(`${id} is a candidate: there is nothing to narrow yet`);
  if (data.id !== id) say(`the id of the layer is the id it extends, ${id}`);
  const rules = new Set((base['always-true'] ?? []).map((one) => one.id));
  const choices = new Set((base['open-choices'] ?? []).map((one) => one.id));
  for (const key of Object.keys(data.narrows ?? {})) {
    if (rules.has(key))
      say(`narrows ${key}: an "Always true" rule holds in every product, a layer cannot change it`);
    else if (!choices.has(key))
      say(`narrows ${key}: ${id} has no open choice ${key} (${[...choices].join(', ') || 'none'})`);
  }
  const caseIds = new Set((base.cases ?? []).map((one) => one.id));
  situationErrors(data.situations ?? [], 'situation', say);
  for (const one of data.situations ?? []) {
    for (const each of [one.case ?? []].flat())
      if (!caseIds.has(each)) say(`situation "${one.situation}": ${id} has no case ${each}`);
    if (one.use && !byId.has(one.use)) say(`situation "${one.situation}": no pattern ${one.use}`);
  }
  return errors;
};

export interface Resolved extends Pattern {
  /** The layers applied, Magma first. */
  layers: string[];
  'open-choices'?: (Choice & { value?: unknown; 'narrowed-by'?: string })[];
  situations?: (Situation & { layer?: string })[];
}

/** A Magma pattern with a product layer applied: its open choices narrowed, its situations added. */
export const resolveLayer = (base: Pattern, layer?: Layer): Resolved => {
  if (!layer) return { ...base, layers: [base.layer] };
  const narrows = layer.narrows ?? {};
  return {
    ...base,
    layers: [base.layer, layer.layer],
    'open-choices': (base['open-choices'] ?? []).map((choice) =>
      choice.id in narrows
        ? { ...choice, value: narrows[choice.id], 'narrowed-by': layer.layer }
        : choice,
    ),
    situations: [
      ...(base.situations ?? []),
      ...(layer.situations ?? []).map((one) => ({ ...one, layer: layer.layer })),
    ],
  };
};

/* ---- a product's folder ------------------------------------------------------------- */

/**
 * The files of a product's folder (magma/patterns/), its layers and its own patterns, read one
 * by one: a file that does not parse is kept with why, so one broken file leaves the others
 * readable.
 */
export const readProjectDir = (
  dir: string,
): { files: PatternFile<Layer | Pattern>[]; unreadable: Map<string, string> } => {
  const files: PatternFile<Layer | Pattern>[] = [];
  const unreadable = new Map<string, string>();
  if (!existsSync(dir)) return { files, unreadable };
  for (const name of readdirSync(dir)
    .filter((one) => one.endsWith('.md'))
    .sort()) {
    const file = path.join(dir, name);
    try {
      files.push(parsePatternFile<Layer | Pattern>(readFileSync(file, 'utf8'), file));
    } catch (error) {
      // the first line of the message: the YAML parser adds the lines around the error
      const [why] = (error as Error).message.replace(`${file}: `, '').split('\n');
      unreadable.set(file, `not read: ${why!.replace(/:$/, '')}`);
    }
  }
  return { files, unreadable };
};

/**
 * What is wrong in a product's folder, by file. A layer: what layerErrors says, and one layer
 * per pattern (the first file by name is the one applied). A pattern of the product's own: the
 * format, the cases and the components as check.patterns holds Magma's, never an id Magma has,
 * its links against Magma's patterns and the product's; not its lint rules (a product may name
 * rules of its own, which Magma cannot see) nor its body (the generator of the sections does not
 * ship).
 */
export const projectErrors = (
  files: PatternFile<Layer | Pattern>[],
  patterns: Pattern[],
  components?: Map<string, ComponentInfo>,
): Map<string, string[]> => {
  const found = new Map<string, string[]>();
  const add = (file: string, errors: string[]) => {
    if (errors.length) found.set(file, [...(found.get(file) ?? []), ...errors]);
  };
  const { byId, aliases } = indexPatterns(patterns);
  const extended = new Map<string, string>();
  const own: PatternFile[] = [];
  for (const file of files) {
    if (isLayer(file.data)) {
      const layer = file as PatternFile<Layer>;
      const errors = layerErrors(layer, patterns);
      const id = extendedId(layer.data);
      const first = id && extended.get(id);
      if (first) errors.push(`${path.basename(first)} extends ${id} too: one layer per pattern`);
      else if (id) extended.set(id, file.file);
      add(file.file, errors);
      continue;
    }
    const pattern = file as PatternFile;
    const { data } = pattern;
    const errors = formatErrors(pattern);
    const magmaId = byId.has(data.id) ? data.id : aliases.get(data.id);
    if (magmaId)
      errors.push(`Magma has a pattern ${data.id}: extend it (extends: magma:${magmaId})`);
    if (data.layer === MAGMA_LAYER) errors.push('layer is the name of the product');
    if (!errors.length) {
      own.push(pattern);
      if (data.status !== 'candidate') {
        errors.push(...coverageErrors(coverage(data)));
        if (components) errors.push(...componentErrors(data, components));
      }
    }
    add(file.file, errors);
  }
  const links = linkErrors([...patterns, ...own.map((one) => one.data)]);
  for (const one of own) add(one.file, links.get(one.data.id) ?? []);
  return found;
};

/* ---- the list ----------------------------------------------------------------------- */

export interface ListEntry {
  id: string;
  title: string;
  group: string;
  kind: string;
  status: string;
  layer: string;
  need: string;
  validatedOn: string[];
}

/** One line per pattern, by group in the order of PATTERN_GROUPS, then by id. */
export const listPatterns = (patterns: Pattern[]): ListEntry[] => {
  const order = Object.keys(PATTERN_GROUPS);
  return [...patterns]
    .sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group) || a.id.localeCompare(b.id))
    .map((one) => ({
      id: one.id,
      title: one.title,
      group: one.group,
      kind: one.kind,
      status: one.status,
      layer: one.layer,
      need: String(one.need ?? '')
        .replace(/\s+/g, ' ')
        .trim(),
      validatedOn: one['validated-on'] ?? [],
    }));
};

/* ---- the body ----------------------------------------------------------------------- */

/** The sections of the body, in order. The generated ones are written from the frontmatter. */
export const SECTION_ORDER = [
  'When to use it',
  'What decides it',
  'Cases',
  'Parts',
  'Behaviour over time',
  'Always true',
  'Open choices',
  'Situations',
  'Accessibility',
  'Content',
  'Magma gaps',
  'Decisions',
] as const;
export const GENERATED_SECTIONS = ['Cases', 'Always true', 'Open choices', 'Situations'] as const;
/** The sections a draft or a decided pattern must have besides the generated ones. */
export const REQUIRED_SECTIONS = ['When to use it', 'What decides it', 'Decisions'] as const;

export const GENERATED_NOTE =
  '<!-- Generated from the frontmatter: edit it there, then run nx run stencil:generate.pattern -- --sync. -->';

const cell = (text: unknown) => String(text).replace(/\s+/g, ' ').trim().replace(/\|/g, '\\|');
const code = (text: string) => `\`${text}\``;
const table = (head: string[], rows: string[][]) =>
  [
    `| ${head.join(' | ')} |`,
    `| ${head.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n');

/** `about: field; outcome: failure` - the values an entry gives, in the order of the variables. */
const whenOf = (pattern: Pattern, entry: Entry) =>
  variableNames(pattern)
    .filter((name) => name in entry)
    .map((name) => `${name}: ${[entry[name]].flat().join(' or ')}`)
    .join('; ') || 'any';

const ruleOf = (rule: Rule, patterns: Map<string, Pattern>): Rule =>
  rule.from
    ? {
        ...(patterns.get(rule.from)?.['always-true']?.find((one) => one.id === rule.id) ?? rule),
        from: rule.from,
      }
    : rule;

/** The text of each generated section, from the frontmatter. */
export const renderSections = (
  pattern: Pattern,
  patterns: Pattern[] = [pattern],
): Record<(typeof GENERATED_SECTIONS)[number], string | undefined> => {
  const { byId } = indexPatterns(patterns);
  const variables = pattern.variables ?? {};
  const cases = [
    table(
      ['Variable', 'Values', 'Means'],
      Object.entries(variables).map(([name, variable]) => [
        code(name),
        variable.values.map(code).join(', '),
        cell(variable.means),
      ]),
    ),
    `A case that leaves a variable out holds for any of its values${NONE_WHEN_LEFT_OUT in variables ? `, except \`${NONE_WHEN_LEFT_OUT}\`, which then means \`none\`` : ''}.`,
    table(
      ['Case', 'When', 'Where', 'Use'],
      (pattern.cases ?? []).map((one) => [
        code(one.id),
        cell(whenOf(pattern, one)),
        cell(
          [
            one.where,
            one.see ? `see \`${one.see}\`` : '',
            one['magma-gap'] ? `Magma gap: ${one['magma-gap']}` : '',
          ]
            .filter(Boolean)
            .join('; '),
        ),
        (one.use ?? []).map(code).join(', '),
      ]),
    ),
  ];
  if (pattern.gaps?.length)
    cases.push(
      'Still open:',
      table(
        ['When', 'Question'],
        pattern.gaps.map((one) => [cell(whenOf(pattern, one)), cell(one.note)]),
      ),
    );
  if (pattern['not-applicable']?.length)
    cases.push(
      'Not applicable:',
      table(
        ['When', 'Why'],
        pattern['not-applicable'].map((one) => [cell(whenOf(pattern, one)), cell(one.why)]),
      ),
    );
  if (!pattern.gaps?.length)
    cases.push('No gaps: every combination has a case or is not applicable.');

  const rules = (pattern['always-true'] ?? []).map((one) => ruleOf(one, byId));
  const checkedBy = (rule: Rule) =>
    [
      rule['checked-by'] === 'lint' ? `lint \`${rule.lint}\`` : rule['checked-by'],
      rule['lint-planned'] ? `lint \`${rule['lint-planned']}\` to write` : '',
      rule.note ?? '',
    ]
      .filter(Boolean)
      .join('; ');
  const choices = pattern['open-choices'] ?? [];
  return {
    Cases: cases.join('\n\n'),
    'Always true': [
      'These hold in every product: a product layer cannot change them.',
      table(
        ['Id', 'Rule', 'Checked by'],
        rules.map((rule) => [
          code(rule.id),
          cell(`${rule.rule ?? ''}${rule.from ? ` (from \`${rule.from}\`)` : ''}`),
          cell(checkedBy(rule)),
        ]),
      ),
    ].join('\n\n'),
    'Open choices': choices.length
      ? [
          'The default decides these; a product layer may narrow them.',
          table(
            ['Id', 'Default', 'A product may'],
            choices.map((one) => [code(one.id), cell(one.default), cell(one.may)]),
          ),
        ].join('\n\n')
      : undefined,
    Situations: [
      "Situations every application has, each with its case: they give the examples, the texts and the keywords. The situations of a product's own domain go in its layer.",
      table(
        ['Situation', 'Case'],
        (pattern.situations ?? []).map((one) => [
          cell(one.situation),
          cell(
            [
              one.use ? `not here: \`${one.use}\`` : [one.case ?? []].flat().map(code).join(', '),
              one.note ?? '',
            ]
              .filter(Boolean)
              .join(': '),
          ),
        ]),
      ),
    ].join('\n\n'),
  };
};

interface Section {
  heading: string;
  text: string;
}

/** The body as its head (the title and the principle) and its `##` sections. */
export const splitBody = (body: string): { head: string; sections: Section[] } => {
  const lines = body.split('\n');
  const sections: Section[] = [];
  const head: string[] = [];
  let fence = false;
  for (const line of lines) {
    if (/^(```|~~~)/.test(line)) fence = !fence;
    const match = !fence && /^## (.+?)\s*$/.exec(line);
    if (match) sections.push({ heading: match[1]!, text: '' });
    else if (sections.length) sections[sections.length - 1]!.text += `${line}\n`;
    else head.push(line);
  }
  return { head: head.join('\n'), sections };
};

/** The body with its head and its generated sections written from the frontmatter, the others as they are. */
export const syncBody = (
  pattern: Pattern,
  body: string,
  patterns: Pattern[] = [pattern],
): string => {
  if (pattern.status === 'candidate') return body;
  const { head, sections } = splitBody(body);
  const rendered = renderSections(pattern, patterns);
  const out = sections.filter(
    (one) =>
      !(GENERATED_SECTIONS as readonly string[]).includes(one.heading) ||
      rendered[one.heading as (typeof GENERATED_SECTIONS)[number]] !== undefined,
  );
  for (const heading of GENERATED_SECTIONS) {
    const text = rendered[heading];
    if (text === undefined) continue;
    const full = `\n${GENERATED_NOTE}\n\n${text}\n\n`;
    const existing = out.find((one) => one.heading === heading);
    if (existing) {
      existing.text = full;
      continue;
    }
    // in the order of SECTION_ORDER, before the first section that comes after it
    const rank = (name: string) => {
      const index = (SECTION_ORDER as readonly string[]).indexOf(name);
      return index < 0 ? SECTION_ORDER.length : index;
    };
    const at = out.findIndex((one) => rank(one.heading) > rank(heading));
    out.splice(at < 0 ? out.length : at, 0, { heading, text: full });
  }
  const title = `# ${pattern.title}\n\n**${String(pattern.principle ?? '')
    .replace(/\s+/g, ' ')
    .trim()}**\n\n`;
  const rest = head.replace(/^\s*#\s.*\n+(\*\*[\s\S]*?\*\*\n*)?/, '');
  // a blank line between the frontmatter and the title
  return (
    '\n' +
    title +
    (rest.trim() ? `${rest.trim()}\n\n` : '') +
    out
      .map((one) => `## ${one.heading}\n${one.text.replace(/\n*$/, '\n\n')}`)
      .join('')
      .replace(/\n+$/, '\n')
  );
};

/** What is wrong in the body: a section missing, out of order, or a generated one out of date. */
export const bodyErrors = (
  pattern: Pattern,
  body: string,
  patterns: Pattern[] = [pattern],
): string[] => {
  if (pattern.status === 'candidate') return [];
  const errors: string[] = [];
  const { sections } = splitBody(body);
  const headings = sections.map((one) => one.heading);
  for (const heading of REQUIRED_SECTIONS)
    if (!headings.includes(heading)) errors.push(`the body has no section ${heading}`);
  for (const heading of headings)
    if (!(SECTION_ORDER as readonly string[]).includes(heading))
      errors.push(`section ${heading} is not one of the template: ${SECTION_ORDER.join(', ')}`);
  const known = headings.filter((one) => (SECTION_ORDER as readonly string[]).includes(one));
  const sorted = [...known].sort(
    (a, b) =>
      (SECTION_ORDER as readonly string[]).indexOf(a) -
      (SECTION_ORDER as readonly string[]).indexOf(b),
  );
  if (known.join() !== sorted.join())
    errors.push(`the sections are in the order ${SECTION_ORDER.join(', ')}`);
  if (syncBody(pattern, body, patterns) !== body)
    errors.push(
      'the title, the principle or a generated section (Cases, Always true, Open choices, Situations) is out of date: nx run stencil:generate.pattern -- --sync',
    );
  return errors;
};

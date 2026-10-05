/**
 * Category L: raw palette utilities -> semantic roles, decided by value.
 *
 * Runs on one class list (an attribute value, a string literal inside `clsx()`,
 * an `@apply`) after the category J renames, so a seed rename is measured under
 * its v2 name. Tokens are grouped by utility prefix + variants (without `dark`):
 * `hover:bg-x dark:hover:bg-y` is one group, the light class and its dark
 * override. Pairs split across two string literals are out of reach by
 * construction and stay as they are.
 *
 * The decision, per group with one raw light class:
 *  - candidates are the roles of the rule's channel and of the colour's hue,
 *    ranked by OKLab deltaE against the class's light value (both modes with
 *    `keepDarkOverrides`);
 *  - <= `exact` / <= `near` is a match, written when `--accept-semantic` allows
 *    it, otherwise reported as a suggestion;
 *  - two roles that the light value cannot tell apart but that paint different
 *    darks, and the seed used as a background (canvas, card or overlay is a
 *    question of context), are reported with their candidates;
 *  - a written match drops the group's raw `dark:` overrides: the role flips by
 *    itself, which is what the override was emulating.
 * A dark override with no class of its own utility at all is reported, and
 * dropped by `--accept-semantic` - only when the list is the whole class value:
 * in a `clsx()` argument its light class may be in the next argument.
 */
import { deltaE } from '../../semantic/color.js';
import { semanticTable } from '../../semantic/semantic.generated.js';
import { type Rgb, type SemanticTable } from '../../semantic/table.js';
import {
  type ClassSemanticReportRule,
  type ClassSemanticRule,
  type Manifest,
  type SemanticThresholds,
} from '../../manifest/schema.js';
import { ruleId } from '../../manifest/registry.js';
import { type Alternative, type FindingKind } from '../../report/types.js';

/** How far category L may write. */
export interface SemanticOptions {
  /** `none`: report only (default). `exact` / `near`: write matches up to that tier. */
  accept: 'none' | 'exact' | 'near';
  /** Match on light AND dark, keeping the decision honest for deliberate dark overrides. */
  keepDarkOverrides: boolean;
}

export const DEFAULT_SEMANTIC_OPTIONS: SemanticOptions = {
  accept: 'none',
  keepDarkOverrides: false,
};

/** A finding without its location; the surface stamps surface/file/line. */
export interface ClassFinding {
  kind: FindingKind;
  ruleId: string;
  message: string;
  before?: string;
  after?: string;
  token?: string;
  reason?: string;
  alternatives?: Alternative[];
}

export interface SemanticRules {
  table: SemanticTable;
  thresholds: SemanticThresholds;
  /** Utility prefix -> the channel rule painting it. */
  byPrefix: Map<string, { rule: ClassSemanticRule; id: string }>;
  reports: Map<ClassSemanticReportRule['reason'], { prefixes: Set<string>; id: string }>;
  /** `^(prefix)-(colour)$`, longest prefix first so `border-t-` wins over `border-`. */
  utilityRe: RegExp;
  /** Cheap probe for a chunk of source. */
  probe: RegExp;
}

const GLOBAL_TAG = 'global';
const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const semanticRulesOf = (
  manifest: Manifest,
  table: SemanticTable = semanticTable,
): SemanticRules | null => {
  const config = manifest.global.semanticClasses;
  if (!config || config.rules.length === 0) return null;
  const byPrefix = new Map<string, { rule: ClassSemanticRule; id: string }>();
  const reports = new Map<
    ClassSemanticReportRule['reason'],
    { prefixes: Set<string>; id: string }
  >();
  const prefixes = new Set<string>();
  const roots = new Set<string>();
  for (const rule of config.rules) {
    const id = ruleId(GLOBAL_TAG, rule);
    for (const p of rule.prefixes) prefixes.add(p);
    if (rule.kind === 'classSemantic') {
      for (const p of rule.prefixes) byPrefix.set(p, { rule, id });
      for (const family of Object.keys(rule.families)) roots.add(family);
    } else {
      reports.set(rule.reason, { prefixes: new Set(rule.prefixes), id });
      if (rule.reason === 'removed')
        for (const name of Object.keys(table.removed))
          roots.add(name.split('-').slice(0, 2).join('-'));
    }
  }
  const sorted = [...prefixes].sort((a, b) => b.length - a.length).map(escapeRe);
  const alt = sorted.join('|');
  return {
    table,
    thresholds: config.thresholds,
    byPrefix,
    reports,
    utilityRe: new RegExp(`^(${alt})-(.+)$`),
    probe: new RegExp(`(?<![\\w-])(?:${alt})-(?:${[...roots].map(escapeRe).join('|')})(?![a-z])`),
  };
};

/** A class token cut into the pieces category L reads and rewrites. */
export interface SemanticToken {
  /** Index in the whitespace-split parts array. */
  index: number;
  raw: string;
  prefix: string;
  bang: string;
  trailingBang: string;
  modifier: string;
  dark: boolean;
  /** Utility prefix + the non-dark variants: the grouping key. */
  key: string;
  utility: string;
  color: string;
}

/** Split `md:hover:` into its variants, ignoring colons inside arbitrary variants. */
const variantsOf = (prefix: string): string[] => {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < prefix.length; i++) {
    const ch = prefix[i];
    if (ch === '[') depth += 1;
    else if (ch === ']') depth = Math.max(0, depth - 1);
    else if (ch === ':' && depth === 0) {
      out.push(prefix.slice(start, i));
      start = i + 1;
    }
  }
  return out;
};

export const toSemanticToken = (
  rules: SemanticRules,
  index: number,
  raw: string,
  split: { prefix: string; bang: string; base: string; modifier: string; trailingBang: string },
): SemanticToken | null => {
  const m = rules.utilityRe.exec(split.base);
  if (!m) return null;
  const variants = variantsOf(split.prefix);
  const dark = variants.includes('dark');
  const others = variants.filter((v) => v !== 'dark').sort();
  return {
    index,
    raw,
    prefix: split.prefix,
    bang: split.bang,
    trailingBang: split.trailingBang,
    modifier: split.modifier,
    dark,
    key: `${m[1]}|${others.join(':')}`,
    utility: m[1]!,
    color: m[2]!,
  };
};

const fmt = (n: number): string => n.toFixed(1);
const round = (n: number): number => Math.round(n * 10) / 10;
/**
 * The ramp steps a removed colour may be pointed at; the generated role scales
 * (`surface-neutral-sunken`, `text-info-muted`) are inputs of the semantic
 * layer, not colours to hand-pick.
 */
const RAMP_STEP = /^(?:tone|status|variant|label|brand)-[a-z-]+-(?:\d\d|seed)$/;
const rgbText = (c: Rgb): string => `rgb(${c.join(' ')})`;

interface Candidate {
  role: string;
  light: number;
  dark: number;
  /** The figure the tiers are judged on: light, or the worse mode with keepDarkOverrides. */
  score: number;
  roleDark: Rgb;
}

const familyOf = (rule: ClassSemanticRule, color: string): string | undefined =>
  Object.keys(rule.families).find((f) => color === f || color.startsWith(`${f}-`));

const rank = (
  rules: SemanticRules,
  channel: string,
  hue: string | null,
  light: Rgb,
  dark: Rgb,
  bothModes: boolean,
): Candidate[] =>
  Object.entries(rules.table.roles)
    .filter(([, r]) => r.channel === channel && (hue === null || r.hue === hue))
    .map(([role, r]) => {
      const l = deltaE(light, r.light);
      const d = deltaE(dark, r.dark);
      return { role, light: l, dark: d, score: bothModes ? Math.max(l, d) : l, roleDark: r.dark };
    })
    .sort((a, b) => a.score - b.score);

/** The class `token` would become with `color` in place of its colour. */
const recolor = (token: SemanticToken, color: string): string =>
  `${token.prefix}${token.bang}${token.utility}-${color}${token.modifier}${token.trailingBang}`;

/** The best roles within the cutoff, as ready-to-paste classes. */
const alternativesOf = (
  token: SemanticToken,
  candidates: Candidate[],
  cutoff: number,
  max = 3,
): Alternative[] =>
  candidates
    .filter((c) => c.score <= cutoff)
    .slice(0, max)
    .map((c) => ({ value: recolor(token, c.role), light: round(c.light), dark: round(c.dark) }));

const listAlternatives = (alternatives: Alternative[], cutoff: number): string =>
  alternatives.length === 0
    ? `no semantic role within dE ${cutoff}`
    : `candidates: ${alternatives
        .map((a) => `\`${a.value}\` (dE light ${fmt(a.light)}, dark ${fmt(a.dark ?? 0)})`)
        .join(', ')}`;

export interface SemanticOutcome {
  /** Token index -> replacement text. */
  replace: Map<number, string>;
  /** Token indexes to delete. */
  remove: Set<number>;
}

/**
 * Decide category L for the tokens of one class list. Returns the edits; the
 * caller applies them to its parts array.
 */
export const migrateSemanticTokens = (
  rules: SemanticRules,
  tokens: SemanticToken[],
  options: SemanticOptions,
  enabled: (id: string) => boolean,
  emit: (finding: ClassFinding) => void,
  /** The list is one fragment of the class value (a `clsx()` argument, an `[ngClass]` key). */
  partial = false,
): SemanticOutcome => {
  const outcome: SemanticOutcome = { replace: new Map(), remove: new Set() };
  const { table, thresholds } = rules;
  const acceptRank = { none: -1, exact: 0, near: 1 }[options.accept];
  const groups = new Map<string, SemanticToken[]>();
  for (const t of tokens) groups.set(t.key, [...(groups.get(t.key) ?? []), t]);

  // L3 reports that need no grouping: removed colours and unknown steps.
  const removed = rules.reports.get('removed');
  const unknown = rules.reports.get('unknownStep');
  const handled = new Set<number>();
  for (const t of tokens) {
    const v1 = table.removed[t.color];
    if (v1 && removed && removed.prefixes.has(t.utility) && enabled(removed.id)) {
      handled.add(t.index);
      const channel = rules.byPrefix.get(t.utility)?.rule.channel;
      const nearest = Object.entries(table.primitives)
        .filter(([name]) => RAMP_STEP.test(name))
        .map(([name, [light]]) => ({ name, d: deltaE(v1[0], light) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      const role = channel ? rank(rules, channel, null, v1[0], v1[1], false)[0] : undefined;
      const roleOk = role && role.score <= thresholds.cutoff;
      emit({
        kind: 'warn',
        ruleId: removed.id,
        message: `\`${t.raw}\`: v2 removed \`${t.color}\` (v1 ${rgbText(v1[0])}), so the class paints nothing; nearest v2 colours ${nearest
          .map((p) => `\`${t.utility}-${p.name}\` (dE ${fmt(p.d)})`)
          .join(', ')}${
          roleOk ? `; nearest role \`${t.utility}-${role.role}\` (dE ${fmt(role.score)})` : ''
        }. If your app defines this colour itself, ignore this`,
        token: t.raw,
        reason: 'removed in v2',
        alternatives: [
          ...(roleOk ? [{ value: recolor(t, role.role), light: round(role.light) }] : []),
          ...nearest.map((p) => ({ value: recolor(t, p.name), light: round(p.d) })),
        ],
      });
      continue;
    }
    const entry = rules.byPrefix.get(t.utility);
    const family = entry && familyOf(entry.rule, t.color);
    if (
      family &&
      !(t.color in table.primitives) &&
      unknown &&
      unknown.prefixes.has(t.utility) &&
      enabled(unknown.id)
    ) {
      handled.add(t.index);
      emit({
        kind: 'warn',
        ruleId: unknown.id,
        message: `\`${t.raw}\`: \`${t.color}\` is not a step of \`${family}\` in v1 or v2, so the class has never painted anything; pick a step or a semantic role`,
        token: t.raw,
        reason: 'step does not exist',
        alternatives: [],
      });
    }
  }

  for (const group of groups.values()) {
    const entry = rules.byPrefix.get(group[0]!.utility);
    if (!entry || !enabled(entry.id)) continue;
    const { rule, id } = entry;
    const raw = (t: SemanticToken): boolean =>
      !handled.has(t.index) && t.color in table.primitives && familyOf(rule, t.color) !== undefined;
    const bases = group.filter((t) => !t.dark);
    const darks = group.filter((t) => t.dark && raw(t));
    const rawBases = bases.filter(raw);
    if (rawBases.length === 0) {
      // A dark override with no light class of its own utility at all: v2
      // roles flip by themselves, so the override is most likely emulating
      // that. With another light class (`bg-white dark:bg-...`) it is a real
      // choice and is left alone.
      if (bases.length > 0 || darks.length === 0) continue;
      if (partial) {
        emit({
          kind: 'dynamic',
          ruleId: id,
          message: `dark-only override \`${darks.map((d) => d.raw).join(' ')}\` in one fragment of a class expression: its light class may sit in another fragment, so it is left for you (v2 colours flip by themselves)`,
          token: darks.map((d) => d.raw).join(' '),
          reason: 'dark-only override in a fragment',
          alternatives: [],
        });
        continue;
      }
      const drop = acceptRank >= 0;
      for (const d of darks) if (drop) outcome.remove.add(d.index);
      emit({
        kind: drop ? 'change' : 'flag',
        ruleId: id,
        message: drop
          ? 'drop a dark-only override: v2 colours flip by themselves (check the dark rendering)'
          : `dark-only override \`${darks.map((d) => d.raw).join(' ')}\`: v2 colours flip by themselves; \`--accept-semantic\` drops it`,
        ...(drop
          ? { before: darks.map((d) => d.raw).join(' '), after: '' }
          : { token: darks.map((d) => d.raw).join(' '), reason: 'dark-only override' }),
      });
      continue;
    }
    if (rawBases.length > 1) {
      emit({
        kind: 'dynamic',
        ruleId: id,
        message: `\`${rawBases.map((t) => t.raw).join(' ')}\` set the same utility twice; migrate to a semantic role by hand`,
        token: rawBases.map((t) => t.raw).join(' '),
        reason: 'same utility set twice',
        alternatives: [],
      });
      continue;
    }
    const base = rawBases[0]!;
    const hue = rule.families[familyOf(rule, base.color)!]!;
    const [light, baseDark] = table.primitives[base.color]!;
    const override = darks.length === 1 ? darks[0] : undefined;
    const effectiveDark = override ? table.primitives[override.color]![1] : baseDark;
    const candidates = rank(
      rules,
      rule.channel,
      hue,
      light,
      effectiveDark,
      options.keepDarkOverrides,
    );
    const best = candidates[0];
    const original = [base, ...darks].map((t) => t.raw).join(' ');
    const alternatives = alternativesOf(base, candidates, thresholds.cutoff);
    const others = listAlternatives(alternatives, thresholds.cutoff);
    const decide = (reason: string) => ({ token: original, reason, alternatives });
    if (!best) continue;

    if (rule.channel === 'background' && base.color.endsWith('-seed')) {
      emit({
        kind: 'dynamic',
        ruleId: id,
        message: `\`${original}\`: the seed as a background is a surface whose role is contextual (page = \`surface-default\`, card = \`surface-raised\`, popover = \`surface-overlay\`); ${others}`,
        ...decide('seed as a background'),
      });
      continue;
    }
    if (
      darks.length > 1 ||
      (options.keepDarkOverrides && override && override.modifier !== base.modifier)
    ) {
      emit({
        kind: 'dynamic',
        ruleId: id,
        message: `\`${original}\`: more than one dark value for one utility; ${others}`,
        ...decide('more than one dark value'),
      });
      continue;
    }
    const tier = best.score <= thresholds.exact ? 0 : best.score <= thresholds.near ? 1 : -1;
    if (tier < 0) {
      emit({
        kind: 'dynamic',
        ruleId: id,
        message: `\`${original}\`: no role within dE ${thresholds.near}; ${others}`,
        ...decide('no close role'),
      });
      continue;
    }
    const runnerUp = candidates[1];
    if (
      !options.keepDarkOverrides &&
      runnerUp &&
      runnerUp.score <= thresholds.near &&
      deltaE(best.roleDark, runnerUp.roleDark) > thresholds.near
    ) {
      emit({
        kind: 'dynamic',
        ruleId: id,
        message: `\`${original}\`: the light value cannot tell these roles apart and they differ in dark; ${others}`,
        ...decide('roles differ in dark'),
      });
      continue;
    }

    const tierName = tier === 0 ? 'exact' : 'near';
    const after = `${base.prefix}${base.bang}${base.utility}-${best.role}${base.modifier}${base.trailingBang}`;
    const darkNote =
      best.dark > thresholds.near
        ? `; in dark the role is dE ${fmt(best.dark)} from what the class painted${override ? ' with its override' : ''}`
        : '';
    if (tier > acceptRank) {
      emit({
        kind: 'flag',
        ruleId: id,
        message: `suggested semantic role (${tierName}, dE ${fmt(best.score)}): \`${original}\` -> \`${after}\`${darkNote}; write it with --accept-semantic=${tierName}`,
        ...decide(`suggested (${tierName})`),
      });
      continue;
    }
    outcome.replace.set(base.index, after);
    for (const d of darks) outcome.remove.add(d.index);
    emit({
      kind: 'change',
      ruleId: id,
      message: `semantic role by value (${tierName}, dE ${fmt(best.score)})${darks.length ? ', dark override dropped' : ''}${darkNote}`,
      before: original,
      after,
    });
  }
  return outcome;
};

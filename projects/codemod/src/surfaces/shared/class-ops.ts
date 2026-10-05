/**
 * Utility-class rewriting shared by the HTML / React / Angular / CSS surfaces
 * (category J). The manifest lists BARE utility names; markup carries them
 * under Tailwind variant prefixes (`hover:`, `md:`, arbitrary variants like
 * `[&>li]:`) and important markers (leading `!` in v1's Tailwind 3, trailing
 * `!` in Tailwind 4), so tokens are matched on the bare segment and only that
 * segment is rewritten. The lookup is a single pass per token: the rename map
 * contains chains (`rounded-xl → rounded-md` while `rounded-md → rounded-2xs`),
 * and one lookup per token guarantees a rename never cascades.
 *
 * Category L (raw palette -> semantic roles, `semantic-ops.ts`) runs on the same
 * class list after the renames, because it has to see the whole list at once:
 * a light class and its `dark:` override are decided together.
 */
import {
  type ClassRenameRule,
  type ClassReportRule,
  type Manifest,
  type VariantRenameRule,
} from '../../manifest/schema.js';
import { ruleId } from '../../manifest/registry.js';
import {
  type ClassFinding,
  type SemanticOptions,
  type SemanticRules,
  type SemanticToken,
  DEFAULT_SEMANTIC_OPTIONS,
  migrateSemanticTokens,
  semanticRulesOf,
  toSemanticToken,
} from './semantic-ops.js';

export interface ClassRenameEntry {
  rule: ClassRenameRule;
  id: string;
}
export interface ClassReportEntry {
  rule: ClassReportRule;
  id: string;
}

export interface VariantRenameEntry {
  rule: VariantRenameRule;
  id: string;
}

export interface ClassRules {
  renames: Map<string, ClassRenameEntry>;
  /** Category M, keyed by the v1 variant name. */
  variants: Map<string, VariantRenameEntry>;
  reports: Map<string, ClassReportEntry>;
  /** Category L, when the manifest declares it. */
  semantic: SemanticRules | null;
  /** Cheap probe: does this chunk of source mention any migrated class at all? */
  candidateRe: RegExp | null;
}

/** Tag used for the manifest-global class rules, which no component owns. */
const GLOBAL_TAG = 'global';

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const cache = new WeakMap<Manifest, ClassRules>();

export const classRulesOf = (manifest: Manifest): ClassRules => {
  const cached = cache.get(manifest);
  if (cached) return cached;
  const renames = new Map<string, ClassRenameEntry>();
  const reports = new Map<string, ClassReportEntry>();
  for (const rule of manifest.global.classes ?? []) {
    if (rule.kind === 'classRename') renames.set(rule.from, { rule, id: ruleId(GLOBAL_TAG, rule) });
    else reports.set(rule.name, { rule, id: ruleId(GLOBAL_TAG, rule) });
  }
  const variants = new Map<string, VariantRenameEntry>();
  for (const rule of manifest.global.variants ?? [])
    variants.set(rule.from, { rule, id: ruleId(GLOBAL_TAG, rule) });
  const names = [...renames.keys(), ...reports.keys()];
  const semantic = semanticRulesOf(manifest);
  // Word-ish boundaries so a short name like `gap` never matches inside
  // `gap-4` or prose; `-` counts as a word character in utility names (a
  // `/NN` opacity modifier is neither, so it passes).
  const probes = [
    ...(names.length > 0 ? [`(?<![\\w-])(?:${names.map(escapeRe).join('|')})(?![\\w-])`] : []),
    ...(semantic ? [semantic.probe.source] : []),
    // a variant segment: at the start of a token or after another variant
    ...(variants.size > 0
      ? [`(?<![\\w-])(?:${[...variants.keys()].map(escapeRe).join('|')}):`]
      : []),
  ];
  const rules: ClassRules = {
    renames,
    variants,
    reports,
    semantic,
    candidateRe: probes.length > 0 ? new RegExp(probes.join('|')) : null,
  };
  cache.set(manifest, rules);
  return rules;
};

export const hasClassRules = (rules: ClassRules): boolean =>
  rules.renames.size > 0 ||
  rules.reports.size > 0 ||
  rules.variants.size > 0 ||
  rules.semantic !== null;

/**
 * Rename the variant segments of a token prefix (`mobile:hover:` ->
 * `max-tablet:hover:`). Segments are split on top-level colons, so an
 * arbitrary variant (`[&:hover]:`) is never looked into.
 */
const renameVariants = (
  prefix: string,
  rules: ClassRules,
  enabled: (id: string) => boolean,
): { prefix: string; used: VariantRenameEntry[] } => {
  if (rules.variants.size === 0 || prefix === '') return { prefix, used: [] };
  const used: VariantRenameEntry[] = [];
  let depth = 0;
  let start = 0;
  let out = '';
  for (let i = 0; i < prefix.length; i++) {
    const ch = prefix[i];
    if (ch === '[') depth += 1;
    else if (ch === ']') depth = Math.max(0, depth - 1);
    else if (ch === ':' && depth === 0) {
      const segment = prefix.slice(start, i);
      const entry = rules.variants.get(segment);
      if (entry && enabled(entry.id)) {
        used.push(entry);
        out += `${entry.rule.to}:`;
      } else out += `${segment}:`;
      start = i + 1;
    }
  }
  return { prefix: out, used };
};

interface SplitToken {
  /** Variant prefix including its trailing colon(s): `hover:`, `md:[&>li]:`. */
  prefix: string;
  /** Leading important marker (Tailwind 3). */
  bang: string;
  /** The bare utility name the manifest rules are keyed on. */
  base: string;
  /** Opacity modifier including its slash: `/80`, `/[0.3]`, `/(--alpha)`; or ''. */
  modifier: string;
  /** Trailing important marker (Tailwind 4). */
  trailingBang: string;
}

/**
 * Split one class token into variant prefix, important markers and the bare
 * utility. The prefix ends at the last `:` outside square brackets, so
 * arbitrary variants (`[&>li]:`, `[@media(hover)]:`) never leak into the base.
 */
export const splitClassToken = (token: string): SplitToken => {
  let depth = 0;
  let cut = -1;
  for (let i = 0; i < token.length; i++) {
    const ch = token[i];
    if (ch === '[') depth += 1;
    else if (ch === ']') depth = Math.max(0, depth - 1);
    else if (ch === ':' && depth === 0) cut = i;
  }
  let rest = token.slice(cut + 1);
  let bang = '';
  let trailingBang = '';
  if (rest.startsWith('!')) {
    bang = '!';
    rest = rest.slice(1);
  }
  if (rest.endsWith('!')) {
    trailingBang = '!';
    rest = rest.slice(0, -1);
  }
  // `bg-tone-neutral/80`: the modifier is not part of the utility name. Only a
  // trailing number or bracketed value counts, and never inside an arbitrary
  // value (`bg-[url(a/b)]`).
  let modifier = '';
  const mod = /\/(?:\d+|\[[^\]]*\]|\([^)]*\))$/.exec(rest);
  if (mod && !rest.slice(0, mod.index).includes('[')) {
    modifier = mod[0];
    rest = rest.slice(0, mod.index);
  }
  return { prefix: token.slice(0, cut + 1), bang, base: rest, modifier, trailingBang };
};

export interface ClassListResult {
  value: string;
  changed: boolean;
}

/** Category L wiring for one surface: the CLI options and where its findings go. */
export interface SemanticHooks {
  options?: SemanticOptions;
  emit: (finding: ClassFinding) => void;
  /** The list is one fragment of a class expression, not the whole value. */
  partial?: boolean;
}

/**
 * Rewrite a whitespace-separated class list. Whitespace (including newlines in
 * multi-line `class` attributes) is preserved verbatim; each non-whitespace
 * token is looked up once by its bare utility name. `onRename` / `onReport`
 * fire once per occurrence with the full token as written. With `semantic`,
 * category L then runs on the renamed list; a token it deletes takes the
 * whitespace before it along.
 */
export const rewriteClassList = (
  value: string,
  rules: ClassRules,
  enabled: (id: string) => boolean,
  onRename: (entry: ClassRenameEntry, before: string, after: string) => void,
  onReport: (entry: ClassReportEntry, token: string) => void,
  semantic?: SemanticHooks,
): ClassListResult => {
  if (!rules.candidateRe || !rules.candidateRe.test(value)) return { value, changed: false };
  let changed = false;
  const parts = value.split(/(\s+)/);
  const tokens: SemanticToken[] = [];
  for (let i = 0; i < parts.length; i++) {
    const token = parts[i]!;
    if (token === '' || /\s/.test(token)) continue;
    const split = splitClassToken(token);
    // M: the variant segments first, so the class rules below see the
    // v2 prefix and a rename keeps it.
    const variant = renameVariants(split.prefix, rules, enabled);
    if (variant.used.length > 0) {
      split.prefix = variant.prefix;
      const after = `${split.prefix}${split.bang}${split.base}${split.modifier}${split.trailingBang}`;
      parts[i] = after;
      changed = true;
      for (const entry of variant.used)
        semantic?.emit({
          kind: 'change',
          ruleId: entry.id,
          message: `rename responsive variant (v1 \`${entry.rule.from}:\` was ${entry.rule.media})`,
          before: token,
          after,
        });
    }
    const current = parts[i]!;
    const { prefix, bang, base, modifier, trailingBang } = split;
    // A fraction (`mx-2/12`) is a whole utility name, not a base + opacity
    // modifier: it is looked up as written first.
    const whole = modifier ? rules.renames.get(`${base}${modifier}`) : undefined;
    const rename = whole && enabled(whole.id) ? whole : rules.renames.get(base);
    if (rename && enabled(rename.id)) {
      const kept = rename === whole ? '' : modifier;
      const after = `${prefix}${bang}${rename.rule.to}${kept}${trailingBang}`;
      parts[i] = after;
      changed = true;
      onRename(rename, current, after);
      if (rules.semantic) {
        const t = toSemanticToken(rules.semantic, i, after, {
          ...split,
          base: rename.rule.to,
          modifier: kept,
        });
        if (t) tokens.push(t);
      }
      continue;
    }
    const report = rules.reports.get(base);
    if (report && enabled(report.id)) onReport(report, current);
    if (rules.semantic) {
      const t = toSemanticToken(rules.semantic, i, current, split);
      if (t) tokens.push(t);
    }
  }
  if (semantic && rules.semantic && tokens.length > 0) {
    const { replace, remove } = migrateSemanticTokens(
      rules.semantic,
      tokens,
      semantic.options ?? DEFAULT_SEMANTIC_OPTIONS,
      enabled,
      semantic.emit,
      semantic.partial,
    );
    for (const [i, text] of replace) parts[i] = text;
    if (replace.size > 0 || remove.size > 0) changed = true;
    if (remove.size > 0) {
      // Rebuild around the deleted tokens: each kept token keeps the
      // whitespace that preceded it, the list keeps its outer whitespace.
      const lead = parts[0] === '' && /^\s+$/.test(parts[1] ?? '') ? parts[1]! : '';
      const last = parts[parts.length - 1] === '' ? parts[parts.length - 2] : '';
      const trail = last && /^\s+$/.test(last) ? last : '';
      const kept: string[] = [];
      let gap = '';
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i]!;
        if (p === '') continue;
        if (/^\s+$/.test(p)) {
          gap = p;
          continue;
        }
        if (!remove.has(i)) kept.push(kept.length === 0 ? p : `${gap}${p}`);
        gap = '';
      }
      return { value: kept.length === 0 ? '' : `${lead}${kept.join('')}${trail}`, changed };
    }
  }
  return { value: changed ? parts.join('') : value, changed };
};

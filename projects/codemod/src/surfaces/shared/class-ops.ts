/**
 * Utility-class rewriting shared by the HTML / React / Angular / CSS surfaces
 * (category J). The manifest lists BARE utility names; markup carries them
 * under Tailwind variant prefixes (`hover:`, `md:`, arbitrary variants like
 * `[&>li]:`) and important markers (leading `!` in v1's Tailwind 3, trailing
 * `!` in Tailwind 4), so tokens are matched on the bare segment and only that
 * segment is rewritten. The lookup is a single pass per token: the rename map
 * contains chains (`rounded-xl → rounded-md` while `rounded-md → rounded-2xs`),
 * and one lookup per token guarantees a rename never cascades.
 */
import {
  type ClassRenameRule,
  type ClassReportRule,
  type Manifest,
} from '../../manifest/schema.js';
import { ruleId } from '../../manifest/registry.js';

export interface ClassRenameEntry {
  rule: ClassRenameRule;
  id: string;
}
export interface ClassReportEntry {
  rule: ClassReportRule;
  id: string;
}

export interface ClassRules {
  renames: Map<string, ClassRenameEntry>;
  reports: Map<string, ClassReportEntry>;
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
  const names = [...renames.keys(), ...reports.keys()];
  // Word-ish boundaries so a short name like `gap` never matches inside
  // `gap-4` or prose; `-` counts as a word character in utility names.
  const rules: ClassRules = {
    renames,
    reports,
    candidateRe:
      names.length > 0
        ? new RegExp(`(?<![\\w-])(?:${names.map(escapeRe).join('|')})(?![\\w-])`)
        : null,
  };
  cache.set(manifest, rules);
  return rules;
};

export const hasClassRules = (rules: ClassRules): boolean =>
  rules.renames.size > 0 || rules.reports.size > 0;

interface SplitToken {
  /** Variant prefix including its trailing colon(s): `hover:`, `md:[&>li]:`. */
  prefix: string;
  /** Leading important marker (Tailwind 3). */
  bang: string;
  /** The bare utility name the manifest rules are keyed on. */
  base: string;
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
  return { prefix: token.slice(0, cut + 1), bang, base: rest, trailingBang };
};

export interface ClassListResult {
  value: string;
  changed: boolean;
}

/**
 * Rewrite a whitespace-separated class list. Whitespace (including newlines in
 * multi-line `class` attributes) is preserved verbatim; each non-whitespace
 * token is looked up once by its bare utility name. `onRename` / `onReport`
 * fire once per occurrence with the full token as written.
 */
export const rewriteClassList = (
  value: string,
  rules: ClassRules,
  enabled: (id: string) => boolean,
  onRename: (entry: ClassRenameEntry, before: string, after: string) => void,
  onReport: (entry: ClassReportEntry, token: string) => void,
): ClassListResult => {
  if (!rules.candidateRe || !rules.candidateRe.test(value)) return { value, changed: false };
  let changed = false;
  const parts = value.split(/(\s+)/);
  for (let i = 0; i < parts.length; i++) {
    const token = parts[i]!;
    if (token === '' || /\s/.test(token)) continue;
    const { prefix, bang, base, trailingBang } = splitClassToken(token);
    const rename = rules.renames.get(base);
    if (rename && enabled(rename.id)) {
      const after = `${prefix}${bang}${rename.rule.to}${trailingBang}`;
      parts[i] = after;
      changed = true;
      onRename(rename, token, after);
      continue;
    }
    const report = rules.reports.get(base);
    if (report && enabled(report.id)) onReport(report, token);
  }
  return { value: changed ? parts.join('') : value, changed };
};

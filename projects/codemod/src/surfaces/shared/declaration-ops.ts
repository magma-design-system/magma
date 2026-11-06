/**
 * One CSS declaration, wherever it is written: a stylesheet (`css.ts`), an
 * inline `style` (HTML, Angular), a React style object. The same rules apply
 * everywhere a property and its value are written:
 *
 *  - category G: a renamed custom property, at its definition (`--x: ...`) and
 *    in its `var(--x)` references; a removed one is reported (G2);
 *  - category G3: a neutral tone used as a background is reported;
 *  - category N (v2 -> v3): the reads of a listed colour through `rgb()` and
 *    the channel definitions of a listed colour (`color-ops.ts`), after the
 *    renames, so a renamed `-rgb` property is converted under its v3 name.
 */
import {
  type CssVarRemoveRule,
  type CssVarRenameRule,
  type CssVarSurfaceReportRule,
  type Manifest,
} from '../../manifest/schema.js';
import { ruleId } from '../../manifest/registry.js';
import { type ClassFinding } from './semantic-ops.js';
import {
  type ColorRules,
  colorRulesOf,
  convertColorDefinition,
  rewriteColorReads,
} from './color-ops.js';

export interface CssVarEntry {
  rule: CssVarRenameRule;
  id: string;
}
interface CssVarRemovalEntry {
  rule: CssVarRemoveRule;
  id: string;
}
interface SurfaceReportEntry {
  rule: CssVarSurfaceReportRule;
  id: string;
}

export interface DeclarationRules {
  cssVars: Map<string, CssVarEntry>;
  removedVars: Map<string, CssVarRemovalEntry>;
  surfaceReports: Map<string, SurfaceReportEntry>;
  colors: ColorRules | null;
}

/**
 * Tag used for the manifest-global CSS-var rules (the `--tone-*-seed` rename and
 * the surface-candidate reports), which no component owns. They surface in
 * `--only` / `--skip` as `global/cssVarRename/...` and
 * `global/cssVarSurfaceReport/...`.
 */
const GLOBAL_TAG = 'global';

const cache = new WeakMap<Manifest, DeclarationRules>();

export const declarationRulesOf = (manifest: Manifest): DeclarationRules => {
  const cached = cache.get(manifest);
  if (cached) return cached;
  const cssVars = new Map<string, CssVarEntry>();
  const removedVars = new Map<string, CssVarRemovalEntry>();
  const surfaceReports = new Map<string, SurfaceReportEntry>();
  for (const component of Object.values(manifest.components)) {
    for (const rule of component.rules) {
      if (rule.kind === 'cssVarRename')
        cssVars.set(rule.from, { rule, id: ruleId(component.tag, rule) });
      else if (rule.kind === 'cssVarRemove')
        removedVars.set(rule.name, { rule, id: ruleId(component.tag, rule) });
    }
  }
  // Manifest-global CSS-var migrations (not owned by any component): the seed
  // rename (rewritten) and the surface-candidate reports (reported only).
  for (const rule of manifest.global.cssVars ?? []) {
    if (rule.kind === 'cssVarRename')
      cssVars.set(rule.from, { rule, id: ruleId(GLOBAL_TAG, rule) });
    else surfaceReports.set(rule.from, { rule, id: ruleId(GLOBAL_TAG, rule) });
  }
  const rules = { cssVars, removedVars, surfaceReports, colors: colorRulesOf(manifest) };
  cache.set(manifest, rules);
  return rules;
};

export const hasDeclarationRules = (rules: DeclarationRules): boolean =>
  rules.cssVars.size > 0 ||
  rules.removedVars.size > 0 ||
  rules.surfaceReports.size > 0 ||
  rules.colors !== null;

/**
 * A neutral tone used as a *background* is a surface candidate (spec 12): the
 * `background` / `background-color` property, or a custom property whose name
 * carries `background` (component `--mds-*-background*` tokens).
 */
const isBackgroundContext = (prop: string): boolean =>
  prop === 'background' ||
  prop === 'background-color' ||
  (prop.startsWith('--') && prop.includes('background'));

const VAR_TOKEN_RE = /--[\w-]+/g;

/** Where a declaration finding goes: the surface adds its own surface, file and line. */
export type DeclarationEmit = (finding: ClassFinding) => void;

export interface DeclarationResult {
  prop: string;
  value: string;
  changed: boolean;
}

/** Warn (once per occurrence) when a removed custom property is defined or referenced. */
const warnRemoved = (
  name: string,
  rules: DeclarationRules,
  enabled: (id: string) => boolean,
  emit: DeclarationEmit,
): void => {
  const entry = rules.removedVars.get(name);
  if (!entry || !enabled(entry.id)) return;
  emit({ kind: 'warn', ruleId: entry.id, message: entry.rule.message });
};

/**
 * The property of a declaration: a custom-property definition site
 * (`--mds-banner-color: #fff;`) is renamed, or reported when it was removed.
 * `prop` is the CSS spelling (kebab-case, a custom property with its `--`).
 */
export const migrateProperty = (
  prop: string,
  rules: DeclarationRules,
  enabled: (id: string) => boolean,
  emit: DeclarationEmit,
): string => {
  if (!prop.startsWith('--')) return prop;
  const name = prop.slice(2);
  warnRemoved(name, rules, enabled, emit);
  const entry = rules.cssVars.get(name);
  if (!entry || !enabled(entry.id)) return prop;
  const next = `--${entry.rule.to}`;
  emit({
    kind: 'change',
    ruleId: entry.id,
    message: `rename custom property`,
    before: prop,
    after: next,
  });
  if (entry.rule.valueFormatChanged) {
    emit({
      kind: 'flag',
      ruleId: entry.id,
      message: `value format changed (${entry.rule.note ?? 'e.g. hex -> "R G B" channels'}): convert the value of \`${next}\` by hand`,
    });
  } else if (entry.rule.note) {
    emit({ kind: 'flag', ruleId: entry.id, message: entry.rule.note });
  }
  return next;
};

/**
 * The value of a declaration whose property is already migrated (`prop` is its
 * new spelling); `value` is without `!important` when the surface keeps it
 * apart (postcss), with it otherwise.
 */
export const migrateValue = (
  prop: string,
  value: string,
  rules: DeclarationRules,
  enabled: (id: string) => boolean,
  emit: DeclarationEmit,
): string => {
  let nextValue = value;

  // `var(--x)` references inside any value. A surface candidate used as a
  // background is REPORTED, not rewritten (the exact role is contextual); this
  // takes precedence over the seed rename so a background is never
  // seed-renamed. Everything else follows the plain rename.
  if (nextValue && nextValue.includes('--')) {
    for (const token of nextValue.match(VAR_TOKEN_RE) ?? [])
      warnRemoved(token.slice(2), rules, enabled, emit);
    const backgroundContext = isBackgroundContext(prop);
    nextValue = nextValue.replace(VAR_TOKEN_RE, (token) => {
      const name = token.slice(2);
      const report = backgroundContext ? rules.surfaceReports.get(name) : undefined;
      if (report && enabled(report.id)) {
        emit({
          kind: 'warn',
          ruleId: report.id,
          message: `\`${token}\` is used as a background here; migrate it by hand to a semantic surface role (\`--magma-surface-*\`: default / raised / overlay / sunken / muted)${report.rule.note ? ` (${report.rule.note})` : ''}`,
        });
        return token;
      }
      const entry = rules.cssVars.get(name);
      if (entry && enabled(entry.id)) {
        emit({
          kind: 'change',
          ruleId: entry.id,
          message: `rename custom property reference`,
          before: token,
          after: `--${entry.rule.to}`,
        });
        return `--${entry.rule.to}`;
      }
      return token;
    });
  }

  // N: the reads of a listed colour, then, on a listed colour's own
  // definition, its channels.
  const colors = rules.colors;
  if (colors && enabled(colors.id)) {
    nextValue = rewriteColorReads(nextValue, colors, emit).value;
    const name = prop.startsWith('--') ? prop.slice(2) : null;
    if (name !== null && colors.names.has(name))
      nextValue = convertColorDefinition(name, nextValue, colors, emit).value;
  }
  return nextValue;
};

/**
 * A listed colour defined with a value the surface cannot read (an expression
 * of the script): reported, since it may hold channels.
 */
export const reportUnreadColorValue = (
  prop: string,
  expression: string,
  rules: DeclarationRules,
  enabled: (id: string) => boolean,
  emit: DeclarationEmit,
): void => {
  const colors = rules.colors;
  if (!colors || !enabled(colors.id) || !prop.startsWith('--')) return;
  if (!colors.names.has(prop.slice(2))) return;
  emit({
    kind: 'dynamic',
    ruleId: colors.id,
    message: `\`${prop}\` takes a colour in Magma 3, not channels: check what \`${expression}\` holds (channels \`r g b\` become \`rgb(r g b)\`)`,
  });
};

/** Migrate one declaration: {@link migrateProperty}, then {@link migrateValue} under the new name. */
export const migrateDeclaration = (
  prop: string,
  value: string,
  rules: DeclarationRules,
  enabled: (id: string) => boolean,
  emit: DeclarationEmit,
): DeclarationResult => {
  const nextProp = migrateProperty(prop, rules, enabled, emit);
  const nextValue = migrateValue(nextProp, value, rules, enabled, emit);
  return {
    prop: nextProp,
    value: nextValue,
    changed: nextProp !== prop || nextValue !== value,
  };
};

/** Split at the top-level occurrences of `sep` (outside parentheses and quotes): [start, end) ranges. */
const splitTopLevel = (text: string, sep: string): Array<[number, number]> => {
  const ranges: Array<[number, number]> = [];
  let depth = 0;
  let quote = '';
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = '';
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    else if (ch === sep && depth === 0) {
      ranges.push([start, i]);
      start = i + 1;
    }
  }
  ranges.push([start, text.length]);
  return ranges;
};

/**
 * A declaration list, as an inline `style` writes it
 * (`color: rgb(var(--x)); --y: 0 0 0`): every declaration through
 * {@link migrateDeclaration}, with the spacing, the separators and anything
 * that is not a declaration kept as written.
 */
export const migrateStyleText = (
  text: string,
  rules: DeclarationRules,
  enabled: (id: string) => boolean,
  emit: DeclarationEmit,
): { value: string; changed: boolean } => {
  let out = '';
  let cursor = 0;
  let changed = false;
  for (const [start, end] of splitTopLevel(text, ';')) {
    const segment = text.slice(start, end);
    const colon = splitTopLevel(segment, ':')[0]![1];
    if (colon >= segment.length) continue;
    const propRaw = segment.slice(0, colon);
    const valueRaw = segment.slice(colon + 1);
    const prop = propRaw.trim();
    const value = valueRaw.trim();
    if (prop === '' || value === '') continue;
    const result = migrateDeclaration(prop, value, rules, enabled, emit);
    if (!result.changed) continue;
    const propAt = start + propRaw.indexOf(prop);
    const valueAt = start + colon + 1 + valueRaw.indexOf(value);
    out +=
      text.slice(cursor, propAt) +
      result.prop +
      text.slice(propAt + prop.length, valueAt) +
      result.value;
    cursor = valueAt + value.length;
    changed = true;
  }
  return changed ? { value: out + text.slice(cursor), changed } : { value: text, changed };
};

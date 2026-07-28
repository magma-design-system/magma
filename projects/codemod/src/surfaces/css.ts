/**
 * CSS / SCSS surface (category G — CSS custom properties, and category H —
 * shadow parts in `::part()` selectors). Uses postcss (+ postcss-scss) and
 * mutates the AST in place so formatting is preserved.
 *
 * Custom-property *definitions* are renamed and, when the value format changed
 * (e.g. hex → `R G B` channels for `-rgb` variables), flagged for manual
 * conversion. `var(--x)` *references* are renamed everywhere they appear.
 * Definitions/references of properties removed in v2 with no replacement
 * (G2, `cssVarRemove`) are reported, not rewritten.
 */
import postcss from 'postcss';
import postcssScss from 'postcss-scss';
import {
  type CssVarRemoveRule,
  type CssVarRenameRule,
  type CssVarSurfaceReportRule,
  type Manifest,
  type PartRenameRule,
} from '../manifest/schema.js';
import { ruleId } from '../manifest/registry.js';
import { type Finding } from '../report/types.js';
import { ruleEnabled, type TransformContext, type TransformResult } from './shared/transform.js';

interface CssVarEntry {
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
interface PartEntry {
  rule: PartRenameRule;
  id: string;
}

/**
 * Tag used for the manifest-global CSS-var rules (the `--tone-*-seed` rename and
 * the surface-candidate reports), which no component owns. They surface in
 * `--only` / `--skip` as `global/cssVarRename/...` and
 * `global/cssVarSurfaceReport/...`.
 */
const GLOBAL_TAG = 'global';

/**
 * A neutral tone used as a *background* is a surface candidate (spec 12): the
 * `background` / `background-color` property, or a custom property whose name
 * carries `background` (component `--mds-*-background*` tokens).
 */
const isBackgroundContext = (prop: string): boolean =>
  prop === 'background' ||
  prop === 'background-color' ||
  (prop.startsWith('--') && prop.includes('background'));

const collectRules = (manifest: Manifest) => {
  const cssVars = new Map<string, CssVarEntry>();
  const removedVars = new Map<string, CssVarRemovalEntry>();
  const surfaceReports = new Map<string, SurfaceReportEntry>();
  const parts = new Map<string, PartEntry>();
  for (const component of Object.values(manifest.components)) {
    for (const rule of component.rules) {
      if (rule.kind === 'cssVarRename')
        cssVars.set(rule.from, { rule, id: ruleId(component.tag, rule) });
      else if (rule.kind === 'cssVarRemove')
        removedVars.set(rule.name, { rule, id: ruleId(component.tag, rule) });
      else if (rule.kind === 'partRename')
        parts.set(rule.from, { rule, id: ruleId(component.tag, rule) });
    }
  }
  // Manifest-global CSS-var migrations (not owned by any component): the seed
  // rename (rewritten) and the surface-candidate reports (reported only).
  for (const rule of manifest.global.cssVars ?? []) {
    if (rule.kind === 'cssVarRename')
      cssVars.set(rule.from, { rule, id: ruleId(GLOBAL_TAG, rule) });
    else surfaceReports.set(rule.from, { rule, id: ruleId(GLOBAL_TAG, rule) });
  }
  return { cssVars, removedVars, surfaceReports, parts };
};

const PART_RE = /::part\(\s*([\w-]+)\s*\)/g;
const VAR_TOKEN_RE = /--[\w-]+/g;

export const transformCss = (
  source: string,
  manifest: Manifest,
  ctx: TransformContext,
  options: { scss?: boolean } = {},
): TransformResult => {
  const { cssVars, removedVars, surfaceReports, parts } = collectRules(manifest);
  const findings: Finding[] = [];
  let changed = false;

  /** Warn (once per occurrence) when a removed custom property is defined or referenced. */
  const warnRemoved = (name: string, line: number | undefined): void => {
    const entry = removedVars.get(name);
    if (!entry || !ruleEnabled(ctx, entry.id)) return;
    findings.push({
      kind: 'warn',
      surface: 'css',
      file: ctx.file,
      line,
      ruleId: entry.id,
      message: entry.rule.message,
    });
  };

  const root = options.scss
    ? postcssScss.parse(source, { from: ctx.file })
    : postcss.parse(source, { from: ctx.file });

  const finding = (
    entry: CssVarEntry | PartEntry,
    line: number | undefined,
    extra: { message: string; before?: string; after?: string },
  ): Finding => ({
    kind: 'change',
    surface: 'css',
    file: ctx.file,
    line,
    ruleId: entry.id,
    ...extra,
  });

  root.walkDecls((decl) => {
    const line = decl.source?.start?.line;

    // Custom-property definition site: `--mds-banner-color: #fff;`.
    if (decl.prop.startsWith('--')) {
      const name = decl.prop.slice(2);
      warnRemoved(name, line);
      const entry = cssVars.get(name);
      if (entry && ruleEnabled(ctx, entry.id)) {
        const before = decl.prop;
        decl.prop = `--${entry.rule.to}`;
        changed = true;
        findings.push(
          finding(entry, line, { message: `rename custom property`, before, after: decl.prop }),
        );
        if (entry.rule.valueFormatChanged) {
          findings.push({
            kind: 'flag',
            surface: 'css',
            file: ctx.file,
            line,
            ruleId: entry.id,
            message: `value format changed (${entry.rule.note ?? 'e.g. hex → "R G B" channels'}): convert the value of \`${decl.prop}\` by hand`,
          });
        } else if (entry.rule.note) {
          findings.push({
            kind: 'flag',
            surface: 'css',
            file: ctx.file,
            line,
            ruleId: entry.id,
            message: entry.rule.note,
          });
        }
      }
    }

    // `var(--x)` references inside any value. A surface candidate used as a
    // background is REPORTED, not rewritten (the exact role is contextual); this
    // takes precedence over the seed rename so a background is never
    // seed-renamed. Everything else follows the plain rename.
    if (decl.value && decl.value.includes('--')) {
      for (const token of decl.value.match(VAR_TOKEN_RE) ?? []) warnRemoved(token.slice(2), line);
      const backgroundContext = isBackgroundContext(decl.prop);
      const newValue = decl.value.replace(VAR_TOKEN_RE, (token) => {
        const name = token.slice(2);
        const report = backgroundContext ? surfaceReports.get(name) : undefined;
        if (report && ruleEnabled(ctx, report.id)) {
          findings.push({
            kind: 'warn',
            surface: 'css',
            file: ctx.file,
            line,
            ruleId: report.id,
            message: `\`${token}\` is used as a background here; migrate it by hand to a semantic surface role (\`--magma-surface-*\`: default / raised / overlay / sunken / muted)${report.rule.note ? ` (${report.rule.note})` : ''}`,
          });
          return token;
        }
        const entry = cssVars.get(name);
        if (entry && ruleEnabled(ctx, entry.id)) {
          changed = true;
          findings.push(
            finding(entry, line, {
              message: `rename custom property reference`,
              before: token,
              after: `--${entry.rule.to}`,
            }),
          );
          return `--${entry.rule.to}`;
        }
        return token;
      });
      if (newValue !== decl.value) decl.value = newValue;
    }
  });

  root.walkRules((rule) => {
    if (!rule.selector.includes('::part(')) return;
    const line = rule.source?.start?.line;
    const newSelector = rule.selector.replace(PART_RE, (match, partName: string) => {
      const entry = parts.get(partName);
      if (entry && ruleEnabled(ctx, entry.id)) {
        changed = true;
        findings.push(
          finding(entry, line, {
            message: `rename shadow part`,
            before: `::part(${partName})`,
            after: `::part(${entry.rule.to})`,
          }),
        );
        return `::part(${entry.rule.to})`;
      }
      return match;
    });
    if (newSelector !== rule.selector) rule.selector = newSelector;
  });

  if (!changed) return { output: source, changed: false, findings };

  const output = options.scss ? root.toString(postcssScss) : root.toString();
  return { output, changed: true, findings };
};

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
interface PartEntry {
  rule: PartRenameRule;
  id: string;
}

const collectRules = (manifest: Manifest) => {
  const cssVars = new Map<string, CssVarEntry>();
  const removedVars = new Map<string, CssVarRemovalEntry>();
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
  return { cssVars, removedVars, parts };
};

const PART_RE = /::part\(\s*([\w-]+)\s*\)/g;
const VAR_TOKEN_RE = /--[\w-]+/g;

export const transformCss = (
  source: string,
  manifest: Manifest,
  ctx: TransformContext,
  options: { scss?: boolean } = {},
): TransformResult => {
  const { cssVars, removedVars, parts } = collectRules(manifest);
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

    // Custom-property definition site: `--mds-banner-color: #fff;`
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
            message: `value format changed (e.g. hex → "R G B" channels): convert the value of \`${decl.prop}\` by hand`,
          });
        }
      }
    }

    // `var(--x)` references inside any value.
    if (decl.value && decl.value.includes('--')) {
      for (const token of decl.value.match(VAR_TOKEN_RE) ?? []) warnRemoved(token.slice(2), line);
      const newValue = decl.value.replace(VAR_TOKEN_RE, (token) => {
        const entry = cssVars.get(token.slice(2));
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

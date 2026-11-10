/**
 * Angular template surface. Uses `@angular/compiler`'s `parseTemplate` (which
 * preserves case and gives precise source spans for static attributes
 * `name="x"`, property bindings `[name]="expr"`, event bindings `(name)="…"`
 * and interpolations `{{ x }}`) and emits offset edits on the original source.
 *
 * Static attributes use the v2 dash-case attribute name; property bindings use
 * the camelCase prop. Dynamic enum values and element/mixed slot content are
 * reported under `dynamic` instead of being rewritten.
 */
import {
  parseTemplate,
  TmplAstBoundText,
  TmplAstElement,
  TmplAstTemplate,
  TmplAstText,
  type TmplAstBoundAttribute,
  type TmplAstNode,
  type TmplAstTextAttribute,
} from '@angular/compiler';
import {
  type BooleanInvertRule,
  type EnsureAttrRule,
  type EnumRemapRule,
  type Manifest,
  type PropRenameRule,
  type PropRemoveRule,
  type SlotRule,
  type SlotToAttrRule,
  type TagRenameRule,
} from '../manifest/schema.js';
import { getByTag, ruleId, rulesForComponent } from '../manifest/registry.js';
import {
  classRulesOf,
  hasClassRules,
  mentionsClassRule,
  rewriteClassList,
  type SemanticHooks,
  type ClassRenameEntry,
  type ClassReportEntry,
} from './shared/class-ops.js';
import { invertBoolean, numberKind, numberRenameFlag, remapEnum } from './shared/attribute-ops.js';
import { readsColorToken, rewriteColorReads } from './shared/color-ops.js';
import {
  declarationRulesOf,
  hasDeclarationRules,
  migrateProperty,
  migrateStyleText,
  migrateValue,
  reportUnreadColorValue,
} from './shared/declaration-ops.js';
import { type ClassFinding } from './shared/semantic-ops.js';
import { bareTrue, dynamic, stringLiteral, type AttrValue } from './shared/value-model.js';
import { applyEdits, type Edit } from './shared/edits.js';
import { type Finding } from '../report/types.js';
import { ruleEnabled, type TransformContext, type TransformResult } from './shared/transform.js';

interface Span {
  start: { offset: number; line?: number };
  end: { offset: number };
}

/** The 1-based line of a span: the Angular compiler counts its lines from 0. */
const lineOf = (span: Span): number | undefined =>
  span.start.line === undefined ? undefined : span.start.line + 1;

const collapseWhitespace = (s: string): string => s.replace(/\s+/g, ' ').trim();
/** A quoted string literal of a binding expression: quote, body. */
const LITERAL_RE = /(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
const LITERAL_WHOLE_RE = /^(['"`])((?:\\.|(?!\1)[^\\])*)\1$/;
/** The CSS spelling of a style key: `backgroundColor` -> `background-color`. */
const cssName = (key: string): string =>
  key.startsWith('--') ? key : key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const escapeAttr = (s: string): string => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

export const transformAngular = (
  source: string,
  manifest: Manifest,
  ctx: TransformContext,
): TransformResult => {
  let parsed;
  try {
    parsed = parseTemplate(source, ctx.file, { preserveWhitespaces: true });
  } catch {
    return { output: source, changed: false, findings: [] };
  }

  const edits: Edit[] = [];
  const findings: Finding[] = [];
  const classRules = classRulesOf(manifest);
  const declarations = declarationRulesOf(manifest);

  /** An attribute that reads a Magma colour through rgb(), with the rewrite to make. */
  const reportAttributeColor = (name: string, value: string, atLine?: number): void => {
    const colors = declarations.colors!;
    const rewrite = rewriteColorReads(value, colors, () => undefined);
    findings.push({
      kind: 'dynamic',
      surface: 'angular',
      file: ctx.file,
      line: atLine,
      ruleId: colors.id,
      message: `\`${name}\` reads a Magma colour through \`rgb()\`, and Magma 3 makes the token a colour: rewrite it by hand`,
      ...(rewrite.changed ? { before: value, after: rewrite.value } : {}),
    });
  };

  const text = (span: Span): string => source.slice(span.start.offset, span.end.offset);
  const removeSpanEdit = (span: Span): Edit => {
    const start =
      span.start.offset > 0 && source[span.start.offset - 1] === ' '
        ? span.start.offset - 1
        : span.start.offset;
    return { start, end: span.end.offset, text: '' };
  };

  const visit = (node: TmplAstNode): void => {
    if (node instanceof TmplAstElement) {
      processElement(node);
      for (const child of node.children) visit(child);
    } else if (node instanceof TmplAstTemplate) {
      for (const child of node.children) visit(child);
    }
  };

  const processElement = (el: TmplAstElement): void => {
    const tag = el.name;
    const statics = el.attributes as TmplAstTextAttribute[];
    const inputs = el.inputs as TmplAstBoundAttribute[];
    const line = lineOf(el.startSourceSpan as Span);

    const findStatic = (name: string): TmplAstTextAttribute | undefined =>
      statics.find((a) => a.name === name);
    const findInput = (name: string): TmplAstBoundAttribute | undefined =>
      inputs.find((a) => a.name === name);

    // Global: remove slot="default".
    if (manifest.global.removeDefaultSlot && ruleEnabled(ctx, 'global/removeDefaultSlot')) {
      const slot = findStatic('slot');
      if (slot && slot.value === 'default') {
        edits.push(removeSpanEdit(slot.sourceSpan as Span));
        findings.push({
          kind: 'change',
          surface: 'angular',
          file: ctx.file,
          line,
          ruleId: 'global/removeDefaultSlot',
          message: 'remove slot="default"',
        });
      }
    }

    // Global: utility-class migrations (J) on any element — the static `class`
    // attribute, `[class.x]` bindings (bare class in the key) and the string
    // literals inside `[ngClass]` / `[class]` / `[attr.class]` expressions.
    if (hasClassRules(classRules)) {
      const enabled = (id: string): boolean => ruleEnabled(ctx, id);
      const emitRename = (
        atLine: number | undefined,
        entry: ClassRenameEntry,
        before: string,
        after: string,
      ): void => {
        findings.push({
          kind: 'change',
          surface: 'angular',
          file: ctx.file,
          line: atLine,
          ruleId: entry.id,
          message: 'rename utility class',
          before,
          after,
        });
        if (entry.rule.note) {
          findings.push({
            kind: 'flag',
            surface: 'angular',
            file: ctx.file,
            line: atLine,
            ruleId: entry.id,
            message: entry.rule.note,
          });
        }
      };
      const emitReport = (
        atLine: number | undefined,
        entry: ClassReportEntry,
        token: string,
      ): void => {
        findings.push({
          kind: 'warn',
          surface: 'angular',
          file: ctx.file,
          line: atLine,
          ruleId: entry.id,
          message: `\`${token}\`: ${entry.rule.message}`,
        });
      };

      const semanticHooks = (atLine: number | undefined, partial = false): SemanticHooks => ({
        options: ctx.semantic,
        emit: (f) => findings.push({ ...f, surface: 'angular', file: ctx.file, line: atLine }),
        partial,
      });

      const classAttr = findStatic('class');
      if (classAttr?.valueSpan) {
        const span = classAttr.valueSpan as Span;
        const atLine = lineOf(classAttr.sourceSpan as Span);
        const result = rewriteClassList(
          text(span),
          classRules,
          enabled,
          (entry, before, after) => emitRename(atLine, entry, before, after),
          (entry, token) => emitReport(atLine, entry, token),
          semanticHooks(atLine),
        );
        if (result.changed)
          edits.push({ start: span.start.offset, end: span.end.offset, text: result.value });
      }

      for (const input of inputs) {
        const keySpan = input.keySpan as Span | undefined;
        if (!keySpan) continue;
        const key = text(keySpan);
        const atLine = lineOf(input.sourceSpan as Span);
        if (key.startsWith('class.')) {
          const token = key.slice('class.'.length);
          const rename = classRules.renames.get(token);
          if (rename && enabled(rename.id)) {
            edits.push({
              start: keySpan.start.offset,
              end: keySpan.end.offset,
              text: `class.${rename.rule.to}`,
            });
            emitRename(atLine, rename, key, `class.${rename.rule.to}`);
            continue;
          }
          const report = classRules.reports.get(token);
          if (report && enabled(report.id)) emitReport(atLine, report, token);
          continue;
        }
        if (key !== 'ngClass' && key !== 'class' && key !== 'attr.class') continue;
        const span = input.valueSpan as Span | undefined;
        if (!span) continue;
        const raw = text(span);
        if (!mentionsClassRule(classRules, raw)) continue;
        let exprChanged = false;
        const newRaw = raw.replace(
          /(['"`])((?:\\.|(?!\1)[^\\])*)\1/g,
          (match, quote: string, body: string) => {
            const result = rewriteClassList(
              body,
              classRules,
              enabled,
              (entry, before, after) => {
                exprChanged = true;
                emitRename(atLine, entry, before, after);
              },
              (entry, token) => emitReport(atLine, entry, token),
              semanticHooks(atLine, true),
            );
            if (result.changed) exprChanged = true;
            return result.changed ? `${quote}${result.value}${quote}` : match;
          },
        );
        if (exprChanged)
          edits.push({ start: span.start.offset, end: span.end.offset, text: newRaw });
      }
    }

    // Global: the declarations of an inline style on any element (G, N): the
    // static `style`, `[style.x]` / `[style.x.unit]` / `[style.--x]` bindings,
    // and the string literals of `[ngStyle]` / `[style]` / `[attr.style]`.
    if (hasDeclarationRules(declarations)) {
      const enabled = (id: string): boolean => ruleEnabled(ctx, id);
      const emitAt =
        (atLine: number | undefined) =>
        (f: ClassFinding): void => {
          findings.push({ ...f, surface: 'angular', file: ctx.file, line: atLine });
        };
      const quiet = (): void => undefined;

      const styleAttr = findStatic('style');
      if (styleAttr?.valueSpan) {
        const span = styleAttr.valueSpan as Span;
        const atLine = lineOf(styleAttr.sourceSpan as Span);
        const result = migrateStyleText(text(span), declarations, enabled, emitAt(atLine));
        if (result.changed)
          edits.push({ start: span.start.offset, end: span.end.offset, text: result.value });
      }

      for (const input of inputs) {
        const keySpan = input.keySpan as Span | undefined;
        const span = input.valueSpan as Span | undefined;
        if (!keySpan || !span) continue;
        const key = text(keySpan);
        const atLine = lineOf(input.sourceSpan as Span);
        const raw = text(span);
        if (key.startsWith('style.')) {
          // `style.--x`, `style.background-color`, `style.backgroundColor`, `style.width.px`
          const name = key.slice('style.'.length);
          const written = name.startsWith('--') ? name : cssName(name.replace(/\.[a-z%]+$/i, ''));
          const prop = migrateProperty(written, declarations, enabled, emitAt(atLine));
          if (prop !== written)
            edits.push({
              start: keySpan.start.offset,
              end: keySpan.end.offset,
              text: `style.${prop}`,
            });
          let literals = 0;
          const next = raw.replace(LITERAL_RE, (match, quote: string, body: string) => {
            literals++;
            const value = migrateValue(prop, body, declarations, enabled, emitAt(atLine));
            return value !== body ? `${quote}${value}${quote}` : match;
          });
          if (literals === 0)
            reportUnreadColorValue(prop, raw, declarations, enabled, emitAt(atLine));
          if (next !== raw)
            edits.push({ start: span.start.offset, end: span.end.offset, text: next });
          continue;
        }
        if (key !== 'ngStyle' && key !== 'style' && key !== 'attr.style') continue;
        const whole = LITERAL_WHOLE_RE.exec(raw.trim());
        if (whole && key !== 'ngStyle') {
          // `[style]="'color: ...; --x: ...'"`: a declaration list
          const result = migrateStyleText(whole[2]!, declarations, enabled, emitAt(atLine));
          if (result.changed) {
            const at = span.start.offset + raw.indexOf(whole[0]) + 1;
            edits.push({ start: at, end: at + whole[2]!.length, text: result.value });
          }
          continue;
        }
        // a style object: a quoted key followed by `:` is a property, a literal
        // after `key:` is its value, any other literal is read for its colours
        const next = raw.replace(LITERAL_RE, (match, quote: string, body: string, at: number) => {
          // a key sits after `{` or `,` (not the first branch of a ternary, also followed by `:`)
          if (/^\s*:/.test(raw.slice(at + match.length)) && /(^|[{,])\s*$/.test(raw.slice(0, at))) {
            if (!body.startsWith('--')) return match;
            const prop = migrateProperty(body, declarations, enabled, emitAt(atLine));
            return prop !== body ? `${quote}${prop}${quote}` : match;
          }
          const keyBefore = /(?:(['"])([^'"]+)\1|([\w$-]+))\s*:\s*$/.exec(raw.slice(0, at));
          const written = keyBefore ? (keyBefore[2] ?? keyBefore[3])! : '';
          const plain = written.startsWith('--')
            ? written
            : cssName(written.replace(/\.[a-z%]+$/i, ''));
          const prop = migrateProperty(plain, declarations, enabled, quiet);
          const value = migrateValue(prop, body, declarations, enabled, emitAt(atLine));
          return value !== body ? `${quote}${value}${quote}` : match;
        });
        if (next !== raw)
          edits.push({ start: span.start.offset, end: span.end.offset, text: next });
      }
    }

    // N: another attribute (`fill`, `stop-color`, a component input) that reads a
    // Magma colour through rgb() is reported: the codemod does not know what it takes.
    const colors = declarations.colors;
    if (colors && ruleEnabled(ctx, colors.id)) {
      for (const attr of statics) {
        if (attr.name === 'class' || attr.name === 'style' || !attr.valueSpan) continue;
        if (!readsColorToken(colors, attr.value)) continue;
        reportAttributeColor(attr.name, attr.value, lineOf(attr.sourceSpan as Span));
      }
    }

    const component = getByTag(manifest, tag);
    if (!component) return;

    for (const rule of rulesForComponent(manifest, component)) {
      const id = ruleId(tag, rule);
      if (!ruleEnabled(ctx, id)) continue;
      switch (rule.kind) {
        case 'booleanInvert':
          applyBooleanInvert(rule, id);
          break;
        case 'propRename':
          applyPropRename(rule, id);
          break;
        case 'propRemove':
          applyPropRemove(rule, id);
          break;
        case 'enumRemap':
          applyEnumRemap(rule, id);
          break;
        case 'slotToAttr':
          applySlotToAttr(rule, id);
          break;
        case 'ensureAttr':
          applyEnsureAttr(rule, id);
          break;
        case 'slotRemove':
          applySlotRemove(rule, id);
          break;
        case 'tagRename':
          applyTagRename(rule, id);
          break;
        default:
          break;
      }
    }

    /**
     * Rename the start tag and the end tag. The end span is only an end tag when
     * the source there reads `</tag`: a self-closing element reports its start
     * span again.
     */
    function applyTagRename(rule: TagRenameRule, id: string): void {
      const nameEdit = (at: number): Edit => ({ start: at, end: at + tag.length, text: rule.to });
      const startSpan = el.startSourceSpan as Span;
      edits.push(nameEdit(startSpan.start.offset + 1));
      const endSpan = el.endSourceSpan as Span | null;
      if (endSpan && source.startsWith(`</${tag}`, endSpan.start.offset))
        edits.push(nameEdit(endSpan.start.offset + 2));
      findings.push({
        kind: 'change',
        surface: 'angular',
        file: ctx.file,
        line,
        ruleId: id,
        component: tag,
        message: `rename <${tag}> to <${rule.to}>`,
        before: tag,
        after: rule.to,
      });
    }

    function applyEnsureAttr(rule: EnsureAttrRule, id: string): void {
      const startSpan = el.startSourceSpan as Span;
      if (rule.unless.some((p) => findStatic(p.attr) || findInput(p.prop))) return;
      const insertAt = startSpan.end.offset - 1;
      const after =
        rule.value === undefined ? rule.attr.attr : `${rule.attr.attr}="${escapeAttr(rule.value)}"`;
      // reportOnly: the new default stays, the report names the attribute that keeps the old one
      if (!rule.reportOnly) edits.push({ start: insertAt, end: insertAt, text: ` ${after}` });
      findings.push({
        kind: rule.reportOnly ? 'flag' : 'change',
        surface: 'angular',
        file: ctx.file,
        line,
        ruleId: id,
        component: tag,
        message: rule.reason,
        after,
      });
    }

    function applySlotRemove(rule: SlotRule, id: string): void {
      for (const child of el.children) {
        if (!(child instanceof TmplAstElement)) continue;
        const slot = (child.attributes as TmplAstTextAttribute[]).find(
          (a) => a.name === 'slot' && a.value === rule.from,
        );
        if (!slot) continue;
        findings.push({
          kind: 'warn',
          surface: 'angular',
          file: ctx.file,
          line: lineOf(child.startSourceSpan as Span),
          ruleId: id,
          component: tag,
          message: `the \`${rule.from}\` slot of ${tag} was removed in v2; migrate the slotted content manually`,
        });
      }
    }

    function replaceStaticBoolean(
      rule: BooleanInvertRule,
      attr: TmplAstTextAttribute,
      id: string,
    ): void {
      const value: AttrValue = attr.valueSpan ? stringLiteral(attr.value) : bareTrue();
      const outcome = invertBoolean(value, rule.newDefault);
      const span = attr.sourceSpan as Span;
      if (outcome.action === 'omit') edits.push(removeSpanEdit(span));
      else if (outcome.action === 'shorthandTrue')
        edits.push({ start: span.start.offset, end: span.end.offset, text: rule.to.attr });
      else if (outcome.action === 'explicitFalse')
        edits.push({
          start: span.start.offset,
          end: span.end.offset,
          text: `${rule.to.attr}="false"`,
        });
      findings.push({
        kind: 'change',
        surface: 'angular',
        file: ctx.file,
        line,
        ruleId: id,
        component: tag,
        message: `invert ${rule.from.prop} → ${rule.to.prop}`,
        before: text(span),
      });
    }

    function replaceInputBoolean(
      rule: BooleanInvertRule,
      input: TmplAstBoundAttribute,
      id: string,
    ): void {
      const expr = input.valueSpan ? text(input.valueSpan as Span) : '';
      const outcome = invertBoolean(dynamic(expr), rule.newDefault);
      const span = input.sourceSpan as Span;
      let after = '';
      if (outcome.action === 'omit') edits.push(removeSpanEdit(span));
      else if (outcome.action === 'shorthandTrue') {
        after = rule.to.attr;
        edits.push({ start: span.start.offset, end: span.end.offset, text: after });
      } else if (outcome.action === 'explicitFalse') {
        after = `${rule.to.attr}="false"`;
        edits.push({ start: span.start.offset, end: span.end.offset, text: after });
      } else {
        after = `[${rule.to.prop}]="${outcome.expr}"`;
        edits.push({ start: span.start.offset, end: span.end.offset, text: after });
      }
      findings.push({
        kind: 'change',
        surface: 'angular',
        file: ctx.file,
        line,
        ruleId: id,
        component: tag,
        message: `invert ${rule.from.prop} → ${rule.to.prop}`,
        before: text(span),
        after,
      });
    }

    function applyBooleanInvert(rule: BooleanInvertRule, id: string): void {
      const s = findStatic(rule.from.attr);
      if (s) replaceStaticBoolean(rule, s, id);
      const i = findInput(rule.from.prop);
      if (i) replaceInputBoolean(rule, i, id);
    }

    function applyPropRename(rule: PropRenameRule, id: string): void {
      const s = findStatic(rule.from.attr);
      const number = (value: AttrValue) => (rule.when === 'number' ? numberKind(value) : 'number');
      if (s && number(s.valueSpan ? stringLiteral(s.value) : bareTrue()) === 'number') {
        const span = s.sourceSpan as Span;
        const text2 = s.valueSpan ? `${rule.to.attr}="${s.value}"` : rule.to.attr;
        edits.push({ start: span.start.offset, end: span.end.offset, text: text2 });
        findings.push({
          kind: 'change',
          surface: 'angular',
          file: ctx.file,
          line,
          ruleId: id,
          component: tag,
          message: `rename ${rule.from.prop} → ${rule.to.prop}`,
        });
      }
      const i = findInput(rule.from.prop);
      const bound = i?.valueSpan ? number(dynamic(text(i.valueSpan as Span))) : 'other';
      if (i && bound === 'unknown') {
        findings.push({
          kind: 'flag',
          surface: 'angular',
          file: ctx.file,
          line,
          ruleId: id,
          component: tag,
          message: numberRenameFlag(rule),
        });
      }
      if (i && i.valueSpan && bound === 'number') {
        const span = i.sourceSpan as Span;
        edits.push({
          start: span.start.offset,
          end: span.end.offset,
          text: `[${rule.to.prop}]="${text(i.valueSpan as Span)}"`,
        });
        findings.push({
          kind: 'change',
          surface: 'angular',
          file: ctx.file,
          line,
          ruleId: id,
          component: tag,
          message: `rename [${rule.from.prop}] → [${rule.to.prop}]`,
        });
      }
    }

    function applyPropRemove(rule: PropRemoveRule, id: string): void {
      const s = findStatic(rule.prop.attr);
      const i = findInput(rule.prop.prop);
      const span = (s?.sourceSpan ?? i?.sourceSpan) as Span | undefined;
      if (!span) return;
      edits.push(removeSpanEdit(span));
      findings.push({
        kind: 'warn',
        surface: 'angular',
        file: ctx.file,
        line,
        ruleId: id,
        component: tag,
        message: rule.message,
      });
    }

    function applyEnumRemap(rule: EnumRemapRule, id: string): void {
      const v2set = rule.v2set ? component!.v2EnumSets?.[rule.v2set] : undefined;
      const s = findStatic(rule.prop.attr);
      if (s) {
        const outcome = remapEnum(
          s.valueSpan ? stringLiteral(s.value) : bareTrue(),
          rule.map,
          v2set,
          rule.why,
        );
        if (outcome.action === 'rename') {
          edits.push({
            start: (s.sourceSpan as Span).start.offset,
            end: (s.sourceSpan as Span).end.offset,
            text: `${rule.prop.attr}="${outcome.value}"`,
          });
          findings.push({
            kind: 'change',
            surface: 'angular',
            file: ctx.file,
            line,
            ruleId: id,
            component: tag,
            message: `remap ${rule.prop.prop}`,
            after: outcome.value,
          });
        } else if (outcome.action === 'flag') {
          findings.push({
            kind: 'flag',
            surface: 'angular',
            file: ctx.file,
            line,
            ruleId: id,
            component: tag,
            message: `${rule.prop.prop}="${s.value}": ${outcome.reason}`,
          });
        }
      }
      const i = findInput(rule.prop.prop);
      if (i)
        findings.push({
          kind: 'dynamic',
          surface: 'angular',
          file: ctx.file,
          line,
          ruleId: id,
          component: tag,
          message: `[${rule.prop.prop}] is dynamic; remap the enum value by hand`,
        });
    }

    function applySlotToAttr(rule: SlotToAttrRule, id: string): void {
      if (rule.slot !== 'default') return;
      if (findStatic(rule.to.attr) || findInput(rule.to.prop)) return;
      const startSpan = el.startSourceSpan as Span;
      const endSpan = el.endSourceSpan as Span | null;
      if (!endSpan) return;

      const elementChildren = el.children.filter(
        (c) => c instanceof TmplAstElement || c instanceof TmplAstTemplate,
      );
      const textChildren = el.children.filter(
        (c): c is InstanceType<typeof TmplAstText> => c instanceof TmplAstText,
      );
      const boundChildren = el.children.filter(
        (c): c is InstanceType<typeof TmplAstBoundText> => c instanceof TmplAstBoundText,
      );
      const staticText = collapseWhitespace(textChildren.map((c) => c.value).join(''));

      const flag = (message: string): void => {
        findings.push({
          kind: 'dynamic',
          surface: 'angular',
          file: ctx.file,
          line,
          ruleId: id,
          component: tag,
          message,
        });
      };

      let attrText: string | undefined;
      let before = '';
      if (elementChildren.length > 0) {
        flag(`<${tag}> content contains elements; move the text into \`${rule.to.attr}\` manually`);
        return;
      } else if (boundChildren.length === 0 && staticText !== '') {
        attrText = `${rule.to.attr}="${escapeAttr(staticText)}"`;
        before = staticText;
      } else if (boundChildren.length === 1 && staticText === '') {
        const raw = text(boundChildren[0]!.sourceSpan as Span).trim();
        const single = raw.startsWith('{{') && raw.endsWith('}}') && raw.indexOf('{{', 2) === -1;
        if (!single) {
          flag(`<${tag}> has complex interpolation; move it into \`${rule.to.attr}\` manually`);
          return;
        }
        attrText = `[${rule.to.prop}]="${raw.slice(2, -2).trim()}"`;
        before = raw;
      } else if (boundChildren.length === 0 && staticText === '') {
        return;
      } else {
        flag(`<${tag}> has mixed content; move it into \`${rule.to.attr}\` manually`);
        return;
      }

      const insertAt = startSpan.end.offset - 1;
      edits.push({ start: insertAt, end: insertAt, text: ` ${attrText}` });
      edits.push({ start: startSpan.end.offset, end: endSpan.start.offset, text: '' });
      findings.push({
        kind: 'change',
        surface: 'angular',
        file: ctx.file,
        line,
        ruleId: id,
        component: tag,
        message: `lift content into \`${rule.to.attr ?? rule.to.prop}\``,
        before,
        after: attrText,
      });
    }
  };

  for (const node of parsed.nodes) visit(node);

  if (edits.length === 0) return { output: source, changed: false, findings };
  return { output: applyEdits(source, edits), changed: true, findings };
};

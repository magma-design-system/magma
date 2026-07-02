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
} from '../manifest/schema.js';
import { getByTag, ruleId, rulesForComponent } from '../manifest/registry.js';
import { invertBoolean, remapEnum } from './shared/attribute-ops.js';
import { bareTrue, dynamic, stringLiteral, type AttrValue } from './shared/value-model.js';
import { applyEdits, type Edit } from './shared/edits.js';
import { type Finding } from '../report/types.js';
import { ruleEnabled, type TransformContext, type TransformResult } from './shared/transform.js';

interface Span {
  start: { offset: number; line?: number };
  end: { offset: number };
}

const collapseWhitespace = (s: string): string => s.replace(/\s+/g, ' ').trim();
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
    const line = (el.startSourceSpan as Span).start.line;

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
        default:
          break;
      }
    }

    function applyEnsureAttr(rule: EnsureAttrRule, id: string): void {
      const startSpan = el.startSourceSpan as Span;
      if (rule.unless.some((p) => findStatic(p.attr) || findInput(p.prop))) return;
      const insertAt = startSpan.end.offset - 1;
      const after =
        rule.value === undefined ? rule.attr.attr : `${rule.attr.attr}="${escapeAttr(rule.value)}"`;
      edits.push({ start: insertAt, end: insertAt, text: ` ${after}` });
      findings.push({
        kind: 'change',
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
          line: (child.startSourceSpan as Span).start.line,
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
      if (s) {
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
      if (i && i.valueSpan) {
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

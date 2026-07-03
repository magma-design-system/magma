/**
 * HTML surface. Parses with parse5 (location info on) and applies offset-based
 * edits to the original source so formatting and quoting are preserved.
 *
 * Handles, for `mds-*` elements: boolean inversion (B), prop rename (D), prop
 * removal (C, inline comment), enum remap (A/E), the preferred slot→attr
 * lift (F2, e.g. `mds-button` text → `label`), and removed named slots (F,
 * children using them are reported). The global `slot="default"` removal (F)
 * applies to any element.
 */
import { parseFragment } from 'parse5';
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
import { bareTrue, stringLiteral, type AttrValue } from './shared/value-model.js';
import { applyEdits, lineIndentAt, type Edit } from './shared/edits.js';
import { type Finding } from '../report/types.js';
import { ruleEnabled, type TransformContext, type TransformResult } from './shared/transform.js';

// --- Minimal structural view of the parse5 tree (avoids coupling to parse5's exported types). ---
interface P5Loc {
  startOffset: number;
  endOffset: number;
  startLine?: number;
  startTag?: { startOffset: number; endOffset: number };
  endTag?: { startOffset: number; endOffset: number };
  attrs?: Record<string, { startOffset: number; endOffset: number; startLine?: number }>;
}
interface P5Attr {
  name: string;
  value: string;
}
interface P5Node {
  nodeName: string;
  tagName?: string;
  value?: string;
  attrs?: P5Attr[];
  childNodes?: P5Node[];
  content?: P5Node;
  sourceCodeLocation?: P5Loc | null;
}

const isElement = (node: P5Node): boolean => Array.isArray(node.attrs);

const escapeHtmlAttr = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const collapseWhitespace = (s: string): string => s.replace(/\s+/g, ' ').trim();

/** The raw attribute name as written in source (preserves casing/quote style). */
interface RawAttr {
  name: string;
  hasValue: boolean;
  quote: string;
}
const parseRawAttr = (raw: string): RawAttr => {
  const eq = raw.indexOf('=');
  if (eq === -1) return { name: raw.trim(), hasValue: false, quote: '"' };
  const rest = raw.slice(eq + 1).trim();
  const quote = rest[0] === "'" || rest[0] === '"' ? rest[0] : '"';
  return { name: raw.slice(0, eq).trim(), hasValue: true, quote };
};

export const transformHtml = (
  source: string,
  manifest: Manifest,
  ctx: TransformContext,
): TransformResult => {
  const fragment = parseFragment(source, { sourceCodeLocationInfo: true }) as unknown as P5Node;
  const edits: Edit[] = [];
  const findings: Finding[] = [];

  const pushFinding = (f: Finding): void => {
    findings.push(f);
  };

  /** Remove an attribute (and one leading space) by its source location. */
  const removeAttrEdit = (loc: { startOffset: number; endOffset: number }): Edit => {
    const start =
      loc.startOffset > 0 && source[loc.startOffset - 1] === ' '
        ? loc.startOffset - 1
        : loc.startOffset;
    return { start, end: loc.endOffset, text: '' };
  };

  const visit = (node: P5Node): void => {
    if (isElement(node)) processElement(node);
    for (const child of node.childNodes ?? []) visit(child);
    if (node.content) visit(node.content); // <template>
  };

  const processElement = (node: P5Node): void => {
    const tag = node.tagName ?? '';
    const loc = node.sourceCodeLocation;
    const attrLocs = loc?.attrs ?? {};
    const attrs = node.attrs ?? [];
    const hasAttr = (name: string): boolean => attrs.some((a) => a.name === name);
    const getAttr = (name: string): P5Attr | undefined => attrs.find((a) => a.name === name);

    // Global: remove `slot="default"` on any element.
    if (manifest.global.removeDefaultSlot) {
      const slot = getAttr('slot');
      if (slot && slot.value === 'default' && ruleEnabled(ctx, 'global/removeDefaultSlot')) {
        const l = attrLocs['slot'];
        if (l) {
          edits.push(removeAttrEdit(l));
          pushFinding({
            kind: 'change',
            surface: 'html',
            file: ctx.file,
            line: l.startLine,
            ruleId: 'global/removeDefaultSlot',
            message: 'remove slot="default"',
            before: 'slot="default"',
            after: '',
          });
        }
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
        // slotRename/cssVarRename/cssVarRemove/partRename/eventRename: not applicable to plain HTML attributes.
        default:
          break;
      }
    }

    function attrValueOf(attr: P5Attr, hasValueRaw: boolean): AttrValue {
      return hasValueRaw ? stringLiteral(attr.value) : bareTrue();
    }

    function applyBooleanInvert(rule: BooleanInvertRule, id: string): void {
      const attr = getAttr(rule.from.attr);
      const l = attrLocs[rule.from.attr];
      if (!attr || !l) return;
      const raw = source.slice(l.startOffset, l.endOffset);
      const parsed = parseRawAttr(raw);
      const outcome = invertBoolean(attrValueOf(attr, parsed.hasValue), rule.newDefault);
      let after = '';
      if (outcome.action === 'omit') {
        edits.push(removeAttrEdit(l));
      } else if (outcome.action === 'shorthandTrue') {
        after = rule.to.attr;
        edits.push({ start: l.startOffset, end: l.endOffset, text: after });
      } else if (outcome.action === 'explicitFalse') {
        after = `${rule.to.attr}="false"`;
        edits.push({ start: l.startOffset, end: l.endOffset, text: after });
      }
      pushFinding({
        kind: 'change',
        surface: 'html',
        file: ctx.file,
        line: l.startLine,
        ruleId: id,
        component: tag,
        message: `invert ${rule.from.prop} → ${rule.to.prop}`,
        before: raw,
        after,
      });
    }

    function applyPropRename(rule: PropRenameRule, id: string): void {
      const l = attrLocs[rule.from.attr];
      if (!l) return;
      const raw = source.slice(l.startOffset, l.endOffset);
      const parsed = parseRawAttr(raw);
      edits.push({
        start: l.startOffset,
        end: l.startOffset + parsed.name.length,
        text: rule.to.attr,
      });
      pushFinding({
        kind: 'change',
        surface: 'html',
        file: ctx.file,
        line: l.startLine,
        ruleId: id,
        component: tag,
        message: `rename ${rule.from.prop} → ${rule.to.prop}`,
        before: parsed.name,
        after: rule.to.attr,
      });
    }

    function applyPropRemove(rule: PropRemoveRule, id: string): void {
      const l = attrLocs[rule.prop.attr];
      if (!l) return;
      edits.push(removeAttrEdit(l));
      if (rule.strategy === 'comment' && loc) {
        const indent = lineIndentAt(source, loc.startOffset);
        edits.push({
          start: loc.startOffset,
          end: loc.startOffset,
          text: `<!-- TODO magma v2: ${rule.message} -->\n${indent}`,
        });
      }
      pushFinding({
        kind: 'warn',
        surface: 'html',
        file: ctx.file,
        line: l.startLine,
        ruleId: id,
        component: tag,
        message: rule.message,
      });
    }

    function applyEnumRemap(rule: EnumRemapRule, id: string): void {
      const attr = getAttr(rule.prop.attr);
      const l = attrLocs[rule.prop.attr];
      if (!attr || !l) return;
      const raw = source.slice(l.startOffset, l.endOffset);
      const parsed = parseRawAttr(raw);
      const v2set = rule.v2set ? component!.v2EnumSets?.[rule.v2set] : undefined;
      const outcome = remapEnum(attrValueOf(attr, parsed.hasValue), rule.map, v2set);
      if (outcome.action === 'rename') {
        const q = parsed.quote;
        edits.push({
          start: l.startOffset,
          end: l.endOffset,
          text: `${rule.prop.attr}=${q}${outcome.value}${q}`,
        });
        pushFinding({
          kind: 'change',
          surface: 'html',
          file: ctx.file,
          line: l.startLine,
          ruleId: id,
          component: tag,
          message: `remap ${rule.prop.prop}`,
          before: attr.value,
          after: outcome.value,
        });
      } else if (outcome.action === 'flag') {
        pushFinding({
          kind: 'flag',
          surface: 'html',
          file: ctx.file,
          line: l.startLine,
          ruleId: id,
          component: tag,
          message: `${rule.prop.prop}="${attr.value}": ${outcome.reason}`,
        });
      }
    }

    function applyEnsureAttr(rule: EnsureAttrRule, id: string): void {
      if (!loc?.startTag) return;
      if (rule.unless.some((p) => hasAttr(p.attr))) return;
      const insertAt = loc.startTag.endOffset - 1;
      const after =
        rule.value === undefined
          ? rule.attr.attr
          : `${rule.attr.attr}="${escapeHtmlAttr(rule.value)}"`;
      edits.push({ start: insertAt, end: insertAt, text: ` ${after}` });
      pushFinding({
        kind: 'change',
        surface: 'html',
        file: ctx.file,
        line: loc.startLine,
        ruleId: id,
        component: tag,
        message: rule.reason,
        after,
      });
    }

    function applySlotRemove(rule: SlotRule, id: string): void {
      for (const child of node.childNodes ?? []) {
        if (!isElement(child)) continue;
        const slot = (child.attrs ?? []).find((a) => a.name === 'slot' && a.value === rule.from);
        if (!slot) continue;
        pushFinding({
          kind: 'warn',
          surface: 'html',
          file: ctx.file,
          line: child.sourceCodeLocation?.startLine,
          ruleId: id,
          component: tag,
          message: `the \`${rule.from}\` slot of ${tag} was removed in v2; migrate the slotted content manually`,
        });
      }
    }

    function applySlotToAttr(rule: SlotToAttrRule, id: string): void {
      if (rule.slot !== 'default') return; // only default-slot text supported for now
      if (hasAttr(rule.to.attr)) return; // explicit attribute wins
      if (!loc?.startTag || !loc.endTag) return;

      const children = node.childNodes ?? [];
      const elementChildren = children.filter((c) => isElement(c) || c.content !== undefined);
      const line = loc.startLine;

      if (elementChildren.length > 0) {
        pushFinding({
          kind: 'dynamic',
          surface: 'html',
          file: ctx.file,
          line,
          ruleId: id,
          component: tag,
          message: `${tag} content contains markup; move the text into \`${rule.to.attr}\` manually`,
        });
        return;
      }

      const text = collapseWhitespace(
        children
          .filter((c) => c.nodeName === '#text')
          .map((c) => c.value ?? '')
          .join(''),
      );
      if (text === '') return;

      // Insert the attribute just before the start tag's closing `>` and clear the content.
      const insertAt = loc.startTag.endOffset - 1;
      edits.push({
        start: insertAt,
        end: insertAt,
        text: ` ${rule.to.attr}="${escapeHtmlAttr(text)}"`,
      });
      edits.push({ start: loc.startTag.endOffset, end: loc.endTag.startOffset, text: '' });
      pushFinding({
        kind: 'change',
        surface: 'html',
        file: ctx.file,
        line,
        ruleId: id,
        component: tag,
        message: `lift slotted text into \`${rule.to.attr}\``,
        before: text,
        after: `${rule.to.attr}="${text}"`,
      });
    }
  };

  visit(fragment);

  if (edits.length === 0) return { output: source, changed: false, findings };
  return { output: applyEdits(source, edits), changed: true, findings };
};

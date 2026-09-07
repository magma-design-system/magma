/**
 * React (JSX/TSX) surface. ts-morph is used purely as a parser to locate JSX
 * elements and read their attribute/children shapes; transformations are
 * emitted as offset edits on the original source (via {@link applyEdits}) so
 * formatting is preserved and node invalidation is a non-issue.
 *
 * Both the PascalCase React components (`<MdsButton>`) and the custom elements
 * used directly as intrinsic JSX tags (`<mds-button>`) are matched; intrinsic
 * elements are matched and emitted with the kebab-case attribute spelling.
 *
 * Unanalyzable usage — spread props (`{...props}`), aliased components, computed
 * names, dynamic children — is reported under the `dynamic` category instead of
 * being rewritten.
 */
import {
  Project,
  SyntaxKind,
  ts,
  type JsxAttribute,
  type JsxExpression,
  type Node,
} from 'ts-morph';
import {
  type BooleanInvertRule,
  type EnsureAttrRule,
  type EnumRemapRule,
  type Manifest,
  type PropId,
  type PropRenameRule,
  type PropRemoveRule,
  type SlotRule,
  type SlotToAttrRule,
} from '../manifest/schema.js';
import { getByReactName, getByTag, ruleId, rulesForComponent } from '../manifest/registry.js';
import { classRulesOf, hasClassRules, rewriteClassList } from './shared/class-ops.js';
import { invertBoolean, remapEnum } from './shared/attribute-ops.js';
import {
  bareTrue,
  boolLiteral,
  dynamic,
  stringLiteral,
  type AttrValue,
} from './shared/value-model.js';
import { applyEdits, type Edit } from './shared/edits.js';
import { type Finding } from '../report/types.js';
import { ruleEnabled, type TransformContext, type TransformResult } from './shared/transform.js';

const jsxStringFor = (text: string): string =>
  /["&<>\n]/.test(text) ? `{${JSON.stringify(text)}}` : `"${text}"`;

const collapseWhitespace = (s: string): string => s.replace(/\s+/g, ' ').trim();

export const transformReact = (
  source: string,
  manifest: Manifest,
  ctx: TransformContext,
): TransformResult => {
  const project = new Project({
    useInMemoryFileSystem: true,
    skipFileDependencyResolution: true,
    compilerOptions: { jsx: ts.JsxEmit.Preserve, allowJs: true },
  });
  const sf = project.createSourceFile('__codemod__.tsx', source, { overwrite: true });

  const edits: Edit[] = [];
  const findings: Finding[] = [];

  const openings = [
    ...sf.getDescendantsOfKind(SyntaxKind.JsxOpeningElement),
    ...sf.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement),
  ];

  for (const opening of openings) {
    const tagName = opening.getTagNameNode().getText();
    // A dash can only appear in a plain intrinsic tag (member expressions
    // contain `.`, namespaced names `:`), so it safely discriminates
    // `<mds-button>` from `<MdsButton>`.
    const isIntrinsic = tagName.includes('-');
    const component = isIntrinsic ? getByTag(manifest, tagName) : getByReactName(manifest, tagName);
    if (!component) continue;
    const tag = component.tag;
    const line = opening.getStartLineNumber();

    // Intrinsic custom elements take the kebab-case attribute spelling (React
    // sets attributes on unknown elements); React components take the prop.
    const nameOf = (p: PropId): string => (isIntrinsic ? p.attr : p.prop);

    const attributes = opening.getAttributes();
    const hasSpread = attributes.some((a) => a.getKind() === SyntaxKind.JsxSpreadAttribute);
    const jsxAttrs = attributes.filter(
      (a): a is JsxAttribute => a.getKind() === SyntaxKind.JsxAttribute,
    );
    const findAttr = (name: string): JsxAttribute | undefined =>
      jsxAttrs.find((a) => a.getNameNode().getText() === name);
    const hasAttr = (name: string): boolean => findAttr(name) !== undefined;

    if (hasSpread) {
      findings.push({
        kind: 'dynamic',
        surface: 'react',
        file: ctx.file,
        line,
        component: tag,
        message: `<${tagName}> uses spread props ({...}); verify v2 props by hand`,
      });
    }

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
      if (hasSpread) return; // a spread may already set the prop; don't risk a duplicate
      if (rule.unless.some((p) => hasAttr(nameOf(p)))) return;
      const nameEnd = opening.getTagNameNode().getEnd();
      const after =
        rule.value === undefined ? nameOf(rule.attr) : `${nameOf(rule.attr)}="${rule.value}"`;
      edits.push({ start: nameEnd, end: nameEnd, text: ` ${after}` });
      findings.push({
        kind: 'change',
        surface: 'react',
        file: ctx.file,
        line,
        ruleId: id,
        component: tag,
        message: rule.reason,
        after,
      });
    }

    function applySlotRemove(rule: SlotRule, id: string): void {
      const element = opening.getParentIfKind(SyntaxKind.JsxElement);
      if (!element) return;
      for (const child of element.getJsxChildren()) {
        let childOpening;
        if (child.getKind() === SyntaxKind.JsxElement)
          childOpening = child.asKindOrThrow(SyntaxKind.JsxElement).getOpeningElement();
        else if (child.getKind() === SyntaxKind.JsxSelfClosingElement)
          childOpening = child.asKindOrThrow(SyntaxKind.JsxSelfClosingElement);
        else continue;
        const slotAttr = childOpening
          .getAttributes()
          .filter((a): a is JsxAttribute => a.getKind() === SyntaxKind.JsxAttribute)
          .find((a) => a.getNameNode().getText() === 'slot');
        const init = slotAttr?.getInitializer();
        if (!init || init.getKind() !== SyntaxKind.StringLiteral) continue;
        if ((init as Node).getText().slice(1, -1) !== rule.from) continue;
        findings.push({
          kind: 'warn',
          surface: 'react',
          file: ctx.file,
          line: child.getStartLineNumber(),
          ruleId: id,
          component: tag,
          message: `the \`${rule.from}\` slot of ${tag} was removed in v2; migrate the slotted content manually`,
        });
      }
    }

    function removeAttrEdit(attr: JsxAttribute): Edit {
      const start = attr.getStart();
      const realStart = start > 0 && source[start - 1] === ' ' ? start - 1 : start;
      return { start: realStart, end: attr.getEnd(), text: '' };
    }

    function valueOf(attr: JsxAttribute): AttrValue {
      const init = attr.getInitializer();
      if (!init) return bareTrue();
      if (init.getKind() === SyntaxKind.StringLiteral)
        return stringLiteral((init as Node).getText().slice(1, -1));
      if (init.getKind() === SyntaxKind.JsxExpression) {
        const expr = (init as JsxExpression).getExpression();
        if (!expr) return dynamic('');
        if (expr.getKind() === SyntaxKind.TrueKeyword) return boolLiteral(true);
        if (expr.getKind() === SyntaxKind.FalseKeyword) return boolLiteral(false);
        return dynamic(expr.getText());
      }
      return dynamic(init.getText());
    }

    function applyBooleanInvert(rule: BooleanInvertRule, id: string): void {
      const attr = findAttr(nameOf(rule.from));
      if (!attr) return;
      const outcome = invertBoolean(valueOf(attr), rule.newDefault);
      let after = '';
      if (outcome.action === 'omit') {
        edits.push(removeAttrEdit(attr));
      } else if (outcome.action === 'shorthandTrue') {
        after = nameOf(rule.to);
        edits.push({ start: attr.getStart(), end: attr.getEnd(), text: after });
      } else if (outcome.action === 'explicitFalse') {
        // Stencil parses the attribute string "false" as false (see resolveBoolean).
        after = isIntrinsic ? `${rule.to.attr}="false"` : `${rule.to.prop}={false}`;
        edits.push({ start: attr.getStart(), end: attr.getEnd(), text: after });
      } else {
        after = `${nameOf(rule.to)}={${outcome.expr}}`;
        edits.push({ start: attr.getStart(), end: attr.getEnd(), text: after });
      }
      findings.push({
        kind: 'change',
        surface: 'react',
        file: ctx.file,
        line,
        ruleId: id,
        component: tag,
        message: `invert ${rule.from.prop} → ${rule.to.prop}`,
        before: attr.getText(),
        after,
      });
    }

    function applyPropRename(rule: PropRenameRule, id: string): void {
      const attr = findAttr(nameOf(rule.from));
      if (!attr) return;
      const nameNode = attr.getNameNode();
      edits.push({ start: nameNode.getStart(), end: nameNode.getEnd(), text: nameOf(rule.to) });
      findings.push({
        kind: 'change',
        surface: 'react',
        file: ctx.file,
        line,
        ruleId: id,
        component: tag,
        message: `rename ${rule.from.prop} → ${rule.to.prop}`,
        before: nameOf(rule.from),
        after: nameOf(rule.to),
      });
    }

    function applyPropRemove(rule: PropRemoveRule, id: string): void {
      const attr = findAttr(nameOf(rule.prop));
      if (!attr) return;
      edits.push(removeAttrEdit(attr));
      findings.push({
        kind: 'warn',
        surface: 'react',
        file: ctx.file,
        line,
        ruleId: id,
        component: tag,
        message: rule.message,
      });
    }

    function applyEnumRemap(rule: EnumRemapRule, id: string): void {
      const attr = findAttr(nameOf(rule.prop));
      if (!attr) return;
      const v2set = rule.v2set ? component!.v2EnumSets?.[rule.v2set] : undefined;
      const outcome = remapEnum(valueOf(attr), rule.map, v2set);
      if (outcome.action === 'rename') {
        edits.push({
          start: attr.getStart(),
          end: attr.getEnd(),
          text: `${nameOf(rule.prop)}="${outcome.value}"`,
        });
        findings.push({
          kind: 'change',
          surface: 'react',
          file: ctx.file,
          line,
          ruleId: id,
          component: tag,
          message: `remap ${rule.prop.prop}`,
          after: outcome.value,
        });
      } else if (outcome.action === 'flag') {
        const kind = valueOf(attr).kind === 'dynamic' ? 'dynamic' : 'flag';
        findings.push({
          kind,
          surface: 'react',
          file: ctx.file,
          line,
          ruleId: id,
          component: tag,
          message: `${rule.prop.prop}: ${outcome.reason}`,
        });
      }
    }

    function applySlotToAttr(rule: SlotToAttrRule, id: string): void {
      if (rule.slot !== 'default') return;
      if (hasAttr(nameOf(rule.to))) return;
      const element = opening.getParentIfKind(SyntaxKind.JsxElement);
      if (!element) return; // self-closing → no children to lift

      const children = element.getJsxChildren();
      const elems = children.filter(
        (c) =>
          c.getKind() === SyntaxKind.JsxElement ||
          c.getKind() === SyntaxKind.JsxSelfClosingElement ||
          c.getKind() === SyntaxKind.JsxFragment,
      );
      const exprs = children.filter(
        (c): c is JsxExpression => c.getKind() === SyntaxKind.JsxExpression,
      );
      const text = collapseWhitespace(
        children
          .filter((c) => c.getKind() === SyntaxKind.JsxText)
          .map((c) => c.getText())
          .join(''),
      );

      const flag = (message: string): void => {
        findings.push({
          kind: 'dynamic',
          surface: 'react',
          file: ctx.file,
          line,
          ruleId: id,
          component: tag,
          message,
        });
      };

      let labelAttr: string | undefined;
      let before = '';
      if (elems.length > 0) {
        flag(
          `<${tagName}> content contains elements; move the text into \`${nameOf(rule.to)}\` manually`,
        );
        return;
      } else if (exprs.length === 0 && text !== '') {
        labelAttr = `${nameOf(rule.to)}=${jsxStringFor(text)}`;
        before = text;
      } else if (exprs.length === 1 && text === '') {
        const expr = exprs[0]!.getExpression();
        if (!expr) return;
        labelAttr = `${nameOf(rule.to)}={${expr.getText()}}`;
        before = `{${expr.getText()}}`;
      } else if (exprs.length === 0 && text === '') {
        return; // empty element
      } else {
        flag(
          `<${tagName}> has mixed text/expression content; move it into \`${nameOf(rule.to)}\` manually`,
        );
        return;
      }

      // Replace `>children</Tag>` with ` label=... />` (one edit; attribute edits sit before this range).
      const start = opening.getEnd() - 1;
      edits.push({ start, end: element.getEnd(), text: ` ${labelAttr} />` });
      findings.push({
        kind: 'change',
        surface: 'react',
        file: ctx.file,
        line,
        ruleId: id,
        component: tag,
        message: `lift content into \`${nameOf(rule.to)}\``,
        before,
        after: labelAttr,
      });
    }
  }

  // Global: utility-class migrations (J) on `className` / `class` of ANY JSX
  // element (the classes are not tied to an mds-* component). String literals
  // and no-substitution templates anywhere in the attribute expression are
  // rewritten (covers clsx()/classnames(), ternaries, `||` fallbacks);
  // substitution templates can split a class across chunks, so they are
  // reported instead.
  const classRules = classRulesOf(manifest);
  if (hasClassRules(classRules)) {
    const rewriteLiteralContent = (node: Node): void => {
      const inner = source.slice(node.getStart() + 1, node.getEnd() - 1);
      const line = node.getStartLineNumber();
      const result = rewriteClassList(
        inner,
        classRules,
        (id) => ruleEnabled(ctx, id),
        (entry, before, after) => {
          findings.push({
            kind: 'change',
            surface: 'react',
            file: ctx.file,
            line,
            ruleId: entry.id,
            message: 'rename utility class',
            before,
            after,
          });
          if (entry.rule.note) {
            findings.push({
              kind: 'flag',
              surface: 'react',
              file: ctx.file,
              line,
              ruleId: entry.id,
              message: entry.rule.note,
            });
          }
        },
        (entry, token) => {
          findings.push({
            kind: 'warn',
            surface: 'react',
            file: ctx.file,
            line,
            ruleId: entry.id,
            message: `\`${token}\`: ${entry.rule.message}`,
          });
        },
      );
      if (result.changed)
        edits.push({ start: node.getStart() + 1, end: node.getEnd() - 1, text: result.value });
    };

    const isPlainLiteral = (node: Node): boolean =>
      node.getKind() === SyntaxKind.StringLiteral ||
      node.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral;

    for (const attr of sf.getDescendantsOfKind(SyntaxKind.JsxAttribute)) {
      const name = attr.getNameNode().getText();
      if (name !== 'className' && name !== 'class') continue;
      const init = attr.getInitializer();
      if (!init) continue;
      if (isPlainLiteral(init)) {
        rewriteLiteralContent(init);
        continue;
      }
      if (init.getKind() !== SyntaxKind.JsxExpression) continue;
      const expr = (init as JsxExpression).getExpression();
      if (!expr) continue;
      const literals = [
        ...(isPlainLiteral(expr) ? [expr as Node] : []),
        ...expr.getDescendantsOfKind(SyntaxKind.StringLiteral),
        ...expr.getDescendantsOfKind(SyntaxKind.NoSubstitutionTemplateLiteral),
      ];
      for (const literal of literals) rewriteLiteralContent(literal);
      const templates = [
        ...(expr.getKind() === SyntaxKind.TemplateExpression ? [expr as Node] : []),
        ...expr.getDescendantsOfKind(SyntaxKind.TemplateExpression),
      ];
      for (const template of templates) {
        if (!classRules.candidateRe?.test(template.getText())) continue;
        findings.push({
          kind: 'dynamic',
          surface: 'react',
          file: ctx.file,
          line: template.getStartLineNumber(),
          message: `template literal in \`${name}\` mentions a migrated utility class; rewrite it manually`,
        });
      }
    }
  }

  if (edits.length === 0) return { output: source, changed: false, findings };
  return { output: applyEdits(source, edits), changed: true, findings };
};

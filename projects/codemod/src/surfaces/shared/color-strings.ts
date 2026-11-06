/**
 * Category N in the script (`.ts`, `.tsx`, `.js`, `.jsx`): a string that reads
 * a listed colour through `rgb()` (a style computed in code, a Tailwind 3
 * config, a `setProperty` call) is reported, never rewritten: the codemod
 * cannot see how the string is used, nor whether it is concatenated. When the
 * rewrite reads the whole literal, the report carries it as before -> after.
 */
import { SyntaxKind, type Node, type SourceFile } from 'ts-morph';
import { type Finding, type Surface } from '../../report/types.js';
import { type ColorRules, readsColorToken, rewriteColorReads } from './color-ops.js';
import { type TransformContext } from './transform.js';

export const reportColorStrings = (
  sf: SourceFile,
  colors: ColorRules,
  /** Start offsets of the literals a class or style rule already read. */
  handled: ReadonlySet<number>,
  ctx: TransformContext,
  findings: Finding[],
  surface: Surface = 'react',
): void => {
  const nodes: Node[] = [
    ...sf.getDescendantsOfKind(SyntaxKind.StringLiteral),
    ...sf.getDescendantsOfKind(SyntaxKind.NoSubstitutionTemplateLiteral),
    ...sf.getDescendantsOfKind(SyntaxKind.TemplateExpression),
  ];
  for (const node of nodes) {
    if (handled.has(node.getStart())) continue;
    const text = node.getText();
    if (!readsColorToken(colors, text)) continue;
    const plain = node.getKind() !== SyntaxKind.TemplateExpression;
    const inner = text.slice(1, -1);
    const rewrite = plain ? rewriteColorReads(inner, colors, () => undefined) : null;
    findings.push({
      kind: 'dynamic',
      surface,
      file: ctx.file,
      line: node.getStartLineNumber(),
      ruleId: colors.id,
      message:
        'a string reads a Magma colour through `rgb()`, and Magma 3 makes the token a colour: rewrite it by hand' +
        (rewrite?.changed ? '' : ' (`rgb(var(--x))` -> `var(--x)`, an alpha with `color-mix()`)'),
      ...(rewrite?.changed ? { before: inner, after: rewrite.value } : {}),
    });
  }
};

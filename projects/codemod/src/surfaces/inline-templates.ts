/**
 * Inline-template surface for `.ts` files. Extracts and rewrites:
 *
 *  - Angular `@Component({ template: `…` })` inline templates → {@link transformAngular}.
 *  - Generic inline HTML in no-substitution template literals that contain
 *    `<mds-…>` tags or migrated utility classes (e.g. `el.innerHTML = `…``)
 *    → {@link transformHtml}.
 *
 *  - Angular `@Component({ styles })` (a string, a template literal or an
 *    array of them) -> {@link transformCss}.
 *  - Any other string that reads a Magma colour through `rgb()` (category N)
 *    is reported with the rewrite to make, never rewritten.
 *
 * Template literals with `${…}` substitutions are reported under `dynamic`
 * (the holes make the markup unsafe to parse) rather than rewritten. Host
 * bindings (`@Component({ host: {…} })`) are intentionally not rewritten:
 * applying `mds-*` rules to a consumer component's own host is almost never
 * correct, so it is left for manual review.
 */
import { Node, Project, SyntaxKind, ts } from 'ts-morph';
import { manifestHasMarkupRules } from '../manifest/registry.js';
import { type Manifest } from '../manifest/schema.js';
import { type Finding } from '../report/types.js';
import { applyEdits, type Edit } from './shared/edits.js';
import { classRulesOf } from './shared/class-ops.js';
import { colorRulesOf } from './shared/color-ops.js';
import { reportColorStrings } from './shared/color-strings.js';
import { declarationRulesOf, hasDeclarationRules } from './shared/declaration-ops.js';
import { transformAngular } from './angular.js';
import { transformCss } from './css.js';
import { transformHtml } from './html.js';
import { ruleEnabled } from './shared/transform.js';
import { type TransformContext, type TransformResult } from './shared/transform.js';

const MDS_TAG_RE = /<mds-[a-z-]/;

type SubTransform = (source: string, manifest: Manifest, ctx: TransformContext) => TransformResult;

export const transformInlineTemplates = (
  source: string,
  manifest: Manifest,
  ctx: TransformContext,
): TransformResult => {
  const project = new Project({
    useInMemoryFileSystem: true,
    skipFileDependencyResolution: true,
    compilerOptions: { jsx: ts.JsxEmit.Preserve, allowJs: true },
  });
  const sf = project.createSourceFile('__codemod__.ts', source, { overwrite: true });

  const edits: Edit[] = [];
  const findings: Finding[] = [];
  const handled = new Set<number>();

  // A literal is worth parsing when it contains mds-* markup OR mentions a
  // migrated utility class (J) — those live on any element, not just mds-*.
  // (an mds-* tag counts when the jump has rules on the markup of an element)
  const classRules = classRulesOf(manifest);
  const markup = manifestHasMarkupRules(manifest);
  const relevant = (chunk: string): boolean =>
    (markup && MDS_TAG_RE.test(chunk)) || (classRules.candidateRe?.test(chunk) ?? false);
  // ... or, for the rules of a declaration (G, N), markup with a `style`
  // attribute or element, or with a colour read in a class
  const colors = colorRulesOf(manifest);
  const declarations = declarationRulesOf(manifest);
  const styled = (chunk: string): boolean =>
    /<[a-z]/i.test(chunk) &&
    ((hasDeclarationRules(declarations) && /<style\b|\sstyle\s*=/i.test(chunk)) ||
      (colors?.probe.test(chunk) ?? false));

  /** Transform the raw inner text of a no-substitution template literal node. */
  const transformLiteral = (node: Node, run: SubTransform): void => {
    handled.add(node.getStart());
    const innerStart = node.getStart() + 1;
    const innerEnd = node.getEnd() - 1;
    const inner = source.slice(innerStart, innerEnd);
    if (!relevant(inner) && !styled(inner)) return;

    const sub = run(inner, manifest, ctx);
    const baseLine = node.getStartLineNumber();
    for (const f of sub.findings) {
      findings.push({ ...f, file: ctx.file, line: f.line ? baseLine + f.line - 1 : baseLine });
    }
    if (sub.changed) edits.push({ start: innerStart, end: innerEnd, text: sub.output });
  };

  /** An inline stylesheet: the CSS surface, its findings moved to the literal's lines. */
  const transformStylesheet = (node: Node): void => {
    handled.add(node.getStart());
    const innerStart = node.getStart() + 1;
    const innerEnd = node.getEnd() - 1;
    const inner = source.slice(innerStart, innerEnd);
    const baseLine = node.getStartLineNumber();
    try {
      const sub = transformCss(inner, manifest, ctx, { scss: true });
      for (const f of sub.findings)
        findings.push({ ...f, file: ctx.file, line: f.line ? baseLine + f.line - 1 : baseLine });
      if (sub.changed) edits.push({ start: innerStart, end: innerEnd, text: sub.output });
    } catch (error) {
      findings.push({
        kind: 'dynamic',
        surface: 'css',
        file: ctx.file,
        line: baseLine,
        message: `cannot parse these inline styles (${(error as Error).message}); migrate them by hand`,
      });
    }
  };

  const flagDynamic = (node: Node, message: string): void => {
    if (!relevant(node.getText())) return;
    handled.add(node.getStart());
    findings.push({
      kind: 'dynamic',
      surface: 'html',
      file: ctx.file,
      line: node.getStartLineNumber(),
      message,
    });
  };

  // 1. Angular @Component({ template: `…` }) inline templates.
  for (const dec of sf.getDescendantsOfKind(SyntaxKind.Decorator)) {
    if (dec.getName() !== 'Component') continue;
    const call = dec.getCallExpression();
    const arg = call?.getArguments()[0];
    if (!arg || !Node.isObjectLiteralExpression(arg)) continue;
    const templateProp = arg.getProperty('template');
    if (!templateProp || !Node.isPropertyAssignment(templateProp)) continue;
    const init = templateProp.getInitializer();
    if (!init) continue;
    if (init.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) {
      transformLiteral(init, transformAngular);
    } else if (init.getKind() === SyntaxKind.TemplateExpression) {
      flagDynamic(init, 'inline Angular template contains ${} interpolation; migrate it manually');
    }
  }

  // 1b. Angular @Component({ styles }): a stylesheet, the CSS surface's.
  for (const dec of sf.getDescendantsOfKind(SyntaxKind.Decorator)) {
    if (dec.getName() !== 'Component') continue;
    const arg = dec.getCallExpression()?.getArguments()[0];
    if (!arg || !Node.isObjectLiteralExpression(arg)) continue;
    const stylesProp = arg.getProperty('styles');
    if (!stylesProp || !Node.isPropertyAssignment(stylesProp)) continue;
    const init = stylesProp.getInitializer();
    if (!init) continue;
    const sheets = Node.isArrayLiteralExpression(init) ? init.getElements() : [init];
    for (const sheet of sheets) {
      if (
        sheet.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral ||
        sheet.getKind() === SyntaxKind.StringLiteral
      )
        transformStylesheet(sheet);
      else if (sheet.getKind() === SyntaxKind.TemplateExpression)
        flagDynamic(
          sheet,
          'inline Angular styles contain ${} interpolation; migrate them manually',
        );
    }
  }

  // 2. Generic inline HTML in no-substitution template literals with <mds-…>.
  // A literal with no markup is not HTML: it is left to the string report.
  for (const lit of sf.getDescendantsOfKind(SyntaxKind.NoSubstitutionTemplateLiteral)) {
    if (handled.has(lit.getStart()) || !/<[a-z]/i.test(lit.getText())) continue;
    transformLiteral(lit, transformHtml);
  }
  for (const te of sf.getDescendantsOfKind(SyntaxKind.TemplateExpression)) {
    if (handled.has(te.getStart())) continue;
    flagDynamic(te, 'inline HTML template contains ${} interpolation; migrate it manually');
  }

  // 3. N: any other string that reads a Magma colour through rgb().
  if (colors && ruleEnabled(ctx, colors.id))
    reportColorStrings(sf, colors, handled, ctx, findings, 'angular');

  if (edits.length === 0) return { output: source, changed: false, findings };
  return { output: applyEdits(source, edits), changed: true, findings };
};

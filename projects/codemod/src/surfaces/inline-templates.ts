/**
 * Inline-template surface for `.ts` files. Extracts and rewrites:
 *
 *  - Angular `@Component({ template: `…` })` inline templates → {@link transformAngular}.
 *  - Generic inline HTML in no-substitution template literals that contain
 *    `<mds-…>` tags (e.g. `el.innerHTML = `…``) → {@link transformHtml}.
 *
 * Template literals with `${…}` substitutions are reported under `dynamic`
 * (the holes make the markup unsafe to parse) rather than rewritten. Host
 * bindings (`@Component({ host: {…} })`) are intentionally not rewritten:
 * applying `mds-*` rules to a consumer component's own host is almost never
 * correct, so it is left for manual review.
 */
import { Node, Project, SyntaxKind, ts } from 'ts-morph';
import { type Manifest } from '../manifest/schema.js';
import { type Finding } from '../report/types.js';
import { applyEdits, type Edit } from './shared/edits.js';
import { transformAngular } from './angular.js';
import { transformHtml } from './html.js';
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

  /** Transform the raw inner text of a no-substitution template literal node. */
  const transformLiteral = (node: Node, run: SubTransform): void => {
    handled.add(node.getStart());
    const innerStart = node.getStart() + 1;
    const innerEnd = node.getEnd() - 1;
    const inner = source.slice(innerStart, innerEnd);
    if (!MDS_TAG_RE.test(inner)) return;

    const sub = run(inner, manifest, ctx);
    const baseLine = node.getStartLineNumber();
    for (const f of sub.findings) {
      findings.push({ ...f, file: ctx.file, line: f.line ? baseLine + f.line - 1 : baseLine });
    }
    if (sub.changed) edits.push({ start: innerStart, end: innerEnd, text: sub.output });
  };

  const flagDynamic = (node: Node, message: string): void => {
    handled.add(node.getStart());
    if (!MDS_TAG_RE.test(node.getText())) return;
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

  // 2. Generic inline HTML in no-substitution template literals with <mds-…>.
  for (const lit of sf.getDescendantsOfKind(SyntaxKind.NoSubstitutionTemplateLiteral)) {
    if (handled.has(lit.getStart())) continue;
    transformLiteral(lit, transformHtml);
  }
  for (const te of sf.getDescendantsOfKind(SyntaxKind.TemplateExpression)) {
    if (handled.has(te.getStart())) continue;
    flagDynamic(te, 'inline HTML template contains ${} interpolation; migrate it manually');
  }

  if (edits.length === 0) return { output: source, changed: false, findings };
  return { output: applyEdits(source, edits), changed: true, findings };
};

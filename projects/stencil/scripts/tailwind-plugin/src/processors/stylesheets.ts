import ts, { SourceFile, StringLiteralLike } from 'typescript';
import { debug } from '../debug/logger';
import { loadTypescriptCodeFromMemory } from '../helpers/tsFiles';
import {
  processSourceTextForTailwindInlineClasses,
  reduceDuplicatedClassesFromFunctionalComponentInjection,
} from '../helpers/tailwindcss';
import { getAllExternalCssDependencies } from '../store/store';
import { PluginConfigurationOptions } from '..';

// Stencil emits the component stylesheet as the first variable statement in the module. The exact
// shape has changed across Stencil versions: older versions assigned the css to a plain string
// literal (`const xCss = "...";`) while newer versions wrap it in a getter returning a template
// literal (`const xCss = () => `...`;`). Rather than match a rigid AST path, descend into the first
// variable statement and grab the first string/template literal we find - that is always the css.
function findCssLiteral(sourceFile: SourceFile): StringLiteralLike | undefined {
  const firstVariableStatement = sourceFile.statements.find(ts.isVariableStatement);
  if (!firstVariableStatement) {
    return undefined;
  }

  let cssNode: StringLiteralLike | undefined;
  const visit = (node: ts.Node) => {
    if (cssNode) {
      return;
    }
    if (ts.isStringLiteralLike(node)) {
      cssNode = node;
      return;
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(firstVariableStatement, visit);

  return cssNode;
}

async function transformStyleStatement(
  opts: PluginConfigurationOptions,
  sourceFile: SourceFile,
  filename: string,
) {
  const cssNode = findCssLiteral(sourceFile);
  if (!cssNode) {
    debug('[Stylesheets]', 'No css literal found in source, skipping:', filename);
    return sourceFile.text;
  }

  // Grab any css that needs to be injected by functional components that this component imported
  const injectedCss = getAllExternalCssDependencies(filename).css;
  const originalCss = cssNode.text;

  const tailwindClasses = await processSourceTextForTailwindInlineClasses(
    opts,
    filename,
    originalCss,
  );
  const reducedClasses = await reduceDuplicatedClassesFromFunctionalComponentInjection(
    opts,
    filename,
    tailwindClasses,
    injectedCss,
  );

  // The css literal has to be swapped for a freshly synthesized node rather than mutating its
  // `.text`: the TypeScript printer re-emits parsed template literals verbatim from the original
  // source and ignores in-place `.text` mutations, which would silently drop the Tailwind output.
  // A synthesized node has no source range, so the printer emits (and escapes) the new text.
  const replacement = ts.isNoSubstitutionTemplateLiteral(cssNode)
    ? ts.factory.createNoSubstitutionTemplateLiteral(reducedClasses)
    : ts.factory.createStringLiteral(reducedClasses);

  const replaceCssLiteral = (context: ts.TransformationContext) => (root: ts.Node) => {
    const visit = (node: ts.Node): ts.Node =>
      node === cssNode ? replacement : ts.visitEachChild(node, visit, context);
    return ts.visitNode(root, visit);
  };

  const result = ts.transform(sourceFile, [replaceCssLiteral]);
  const printer = ts.createPrinter();
  const output = printer.printFile(result.transformed[0] as SourceFile);
  result.dispose();

  return output;
}

// This function processes css that is contained as a string in a typescript file
// This transform is used when stencil passes a typescript encoded css blob rather than
// the raw file
export function transformCssFromTsxFileFormat(opts: PluginConfigurationOptions) {
  return async (sourceText: string, filename: string): Promise<string> => {
    debug('[Stylesheets]', 'Processing css from tsx source file:', filename);

    const sourceFile = loadTypescriptCodeFromMemory(sourceText);
    const transformed = await transformStyleStatement(opts, sourceFile, filename);

    return transformed;
  };
}

// This function processes a pure css file - i.e. a file with the contents of a css file
// This transform is used during HMR where css files are passed around
export function transformCssFileFormat(opts: PluginConfigurationOptions) {
  return async (sourceCss: string, filename: string): Promise<string> => {
    debug('[Stylesheets]', 'Processing css source file:', filename);

    const injectedCss = getAllExternalCssDependencies(filename).css;
    const tailwindClasses = await processSourceTextForTailwindInlineClasses(
      opts,
      filename,
      sourceCss,
    );
    const reducedClasses = await reduceDuplicatedClassesFromFunctionalComponentInjection(
      opts,
      filename,
      tailwindClasses,
      injectedCss,
    );

    return reducedClasses;
  };
}

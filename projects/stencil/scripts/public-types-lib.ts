/**
 * The pure part of check-public-types.ts: the module specifiers of a published `.d.ts` that are
 * path aliases of the stencil tsconfig (`@type/*`, `@dictionary/*`, ...), which no consumer can
 * resolve (#1357).
 *
 * Why they can get there: `transformAliasedImportPaths` (stencil.config.ts) has Stencil rewrite
 * the aliases of the declarations it emits, but its transformer (`rewriteAliasedDTSImportPaths`
 * in @stencil/core 4.45.2) visits import declarations only. A re-export through an alias
 * (`export * from '@dictionary/file-extensions'`) reached dist/types untouched: TS2307 for a
 * consumer with `skipLibCheck: false`, the re-exported names typed `any` for everyone else. A
 * type the declaration emit writes inline (`import("@type/x").Y`) is not rewritten either.
 */
import ts from 'typescript';

export interface AliasPattern {
  /** the key of `paths`, as written in the tsconfig */
  key: string;
  prefix: string;
  /** what follows the `*`; a key without `*` matches only itself, with `wildcard` false */
  suffix: string;
  wildcard: boolean;
}

export interface AliasHit {
  /** 1-based */
  line: number;
  specifier: string;
  alias: string;
}

/**
 * The aliases of a tsconfig `paths` map. Criterion (the TypeScript handbook, "paths"): a key
 * holds at most one `*`, which matches any string. A key is an alias when none of its targets
 * goes through a `node_modules` folder: `react -> ../../node_modules/react` only points the
 * editor at the hoisted copy of a package a consumer installs too, so it is not an alias.
 */
export const aliasPatterns = (paths: Record<string, readonly string[]>): AliasPattern[] =>
  Object.entries(paths)
    .filter(
      ([, targets]) => !targets.some((target) => /(^|[\\/])node_modules([\\/]|$)/.test(target)),
    )
    .map(([key]) => {
      const star = key.indexOf('*');
      return star === -1
        ? { key, prefix: key, suffix: '', wildcard: false }
        : { key, prefix: key.slice(0, star), suffix: key.slice(star + 1), wildcard: true };
    });

/** The alias a module specifier goes through, or undefined for a relative path or a package. */
export const matchAlias = (
  specifier: string,
  patterns: readonly AliasPattern[],
): AliasPattern | undefined =>
  patterns.find(({ prefix, suffix, wildcard }) =>
    wildcard
      ? specifier.length >= prefix.length + suffix.length &&
        specifier.startsWith(prefix) &&
        specifier.endsWith(suffix)
      : specifier === prefix,
  );

/** The string literal that names the module of a node, for every form a `.d.ts` can name one in. */
const moduleName = (node: ts.Node): ts.StringLiteral | undefined => {
  // import ... from 'x'; export ... from 'x'
  if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
    return ts.isStringLiteral(node.moduleSpecifier) ? node.moduleSpecifier : undefined;
  }
  // import("x").Y, written by the declaration emit for a type the source did not import
  if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
    return ts.isStringLiteral(node.argument.literal) ? node.argument.literal : undefined;
  }
  // import x = require('x')
  if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
    const { expression } = node.moduleReference;
    return ts.isStringLiteral(expression) ? expression : undefined;
  }
  // declare module 'x' { ... }: an augmentation of an alias augments nothing a consumer has
  if (ts.isModuleDeclaration(node) && ts.isStringLiteral(node.name)) return node.name;
  return undefined;
};

/** Every module specifier of a declaration file that goes through one of the aliases. */
export const findAliasedSpecifiers = (
  fileName: string,
  text: string,
  patterns: readonly AliasPattern[],
): AliasHit[] => {
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true);
  const hits: AliasHit[] = [];
  const visit = (node: ts.Node): void => {
    const name = moduleName(node);
    const alias = name && matchAlias(name.text, patterns);
    if (name && alias) {
      const { line } = source.getLineAndCharacterOfPosition(name.getStart(source));
      hits.push({ line: line + 1, specifier: name.text, alias: alias.key });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return hits;
};

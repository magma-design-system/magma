/**
 * The pure part of check-public-types.ts: the module specifiers of a published `.d.ts` that are
 * path aliases of the stencil tsconfig (`@type/*`, `@dictionary/*`, ...), which no consumer can
 * resolve (#1357), and the packages it names that a consumer cannot type (#1360, below).
 *
 * Why they can get there: `transformAliasedImportPaths` (stencil.config.ts) has Stencil rewrite
 * the aliases of the declarations it emits, but its transformer (`rewriteAliasedDTSImportPaths`
 * in @stencil/core 4.45.2) visits import declarations only. A re-export through an alias
 * (`export * from '@dictionary/file-extensions'`) reached dist/types untouched: TS2307 for a
 * consumer with `skipLibCheck: false`, the re-exported names typed `any` for everyone else. A
 * type the declaration emit writes inline (`import("@type/x").Y`) is not rewritten either.
 */
import { isBuiltin } from 'node:module';
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

export interface SpecifierHit {
  /** 1-based */
  line: number;
  specifier: string;
}

/** Every module specifier of a declaration file, in each form `moduleName` reads, in order. */
export const findModuleSpecifiers = (fileName: string, text: string): SpecifierHit[] => {
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true);
  const hits: SpecifierHit[] = [];
  const visit = (node: ts.Node): void => {
    const name = moduleName(node);
    if (name) {
      const { line } = source.getLineAndCharacterOfPosition(name.getStart(source));
      hits.push({ line: line + 1, specifier: name.text });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return hits;
};

/** Every module specifier of a declaration file that goes through one of the aliases. */
export const findAliasedSpecifiers = (
  fileName: string,
  text: string,
  patterns: readonly AliasPattern[],
): AliasHit[] =>
  findModuleSpecifiers(fileName, text).flatMap(({ line, specifier }) => {
    const alias = matchAlias(specifier, patterns);
    return alias ? [{ line, specifier, alias: alias.key }] : [];
  });

/*
 * The packages of the published types (#1360). A bare specifier that is not an alias names a
 * package, which the consumer's TypeScript has to find with its declarations, in the folder of
 * magma, among what the install of magma brought. Three things can miss:
 *
 * - the package is not there: npm installs the `dependencies` and `peerDependencies` of a package
 *   for its consumer, never its `devDependencies` (docs.npmjs.com, package.json);
 * - the package has no declarations (luxon): TS7016 with `skipLibCheck: false`, `any` otherwise;
 * - its declarations come from `@types/<name>`, which the consumer has only if magma depends on it
 *   (TypeScript handbook, "Publishing": the `@types` packages a declaration needs go in
 *   `dependencies`). In the monorepo a devDependency `@types/x` resolves all the same, which is
 *   why the package that holds the declarations is read, not only whether there are any.
 *
 * Whether a package has declarations, and in which package, is what TypeScript resolves
 * (`ts.resolveModuleName`, in check-public-types.ts), not a reading of its manifest here.
 */

/**
 * The package a bare specifier names, as Node's PACKAGE_RESOLVE splits it (nodejs.org, "Modules:
 * ECMAScript modules", resolution algorithm): up to the first `/`, or the second for a name that
 * starts with `@`. Undefined for a relative or absolute path and for a `node:` built-in.
 */
export const packageOf = (specifier: string): string | undefined => {
  if (/^(\.|\/|[a-zA-Z]:[\\/])/.test(specifier) || specifier.startsWith('node:')) return undefined;
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
};

/** What TypeScript resolves a bare specifier to, read off its `ResolvedModuleFull`. */
export interface ResolvedTypes {
  /** the extension of the resolved file: `.d.ts` and the other TypeScript ones are declarations */
  extension: string;
  /** `packageId.name`: the package that holds the file, undefined when TypeScript gives none */
  holder?: string;
}

export interface PackageScope {
  /** the name of the package that publishes the types: it resolves itself through its exports */
  self: string;
  /** the names of its `dependencies` and `peerDependencies`: what its consumer installs */
  installed: ReadonlySet<string>;
}

export type PackageProblem =
  'not-installed' | 'unresolved' | 'no-declarations' | 'declarations-not-installed';

/**
 * The reason a consumer cannot type a package a declaration file names, or undefined when it can.
 * `resolved` is what TypeScript found for the specifier from that file; undefined when it found
 * nothing. A resolved file with no package (`holder` undefined) is not one of the cases above:
 * it answers `unresolved` rather than passing.
 */
export const packageProblem = (
  pkg: string,
  resolved: ResolvedTypes | undefined,
  scope: PackageScope,
): PackageProblem | undefined => {
  if (pkg === scope.self) return undefined;
  if (!scope.installed.has(pkg)) return 'not-installed';
  if (!resolved || !resolved.holder) return 'unresolved';
  // .d.ts, .d.mts, .d.cts, and a package that ships its .ts sources; .js, .mjs, .cjs and .json
  // are JavaScript or data, which TypeScript reports as TS7016 (or reads as any)
  if (!/\.(c|m)?tsx?$/.test(resolved.extension)) return 'no-declarations';
  if (resolved.holder !== pkg && !scope.installed.has(resolved.holder)) {
    return 'declarations-not-installed';
  }
  return undefined;
};

/**
 * The reason a consumer cannot type a module a published declaration file names, for a specifier
 * that is not an alias, or undefined when it can (a relative path, an installed package with its
 * declarations, magma itself).
 *
 * A Node built-in (`node:stream`, or `stream`: `isBuiltin` of node:module) is typed by
 * `@types/node`, which the consumer brings only for code that runs in Node: `nodeEntry` says the
 * file is one, and the script sets it for the hydrate app alone, the server-side renderer Stencil
 * builds (stencilJS docs, "Hydrate App"). Anywhere else a built-in is `node-built-in`.
 */
export const specifierProblem = (
  specifier: string,
  file: { nodeEntry: boolean },
  scope: PackageScope,
  resolve: (specifier: string) => ResolvedTypes | undefined,
): PackageProblem | 'node-built-in' | undefined => {
  if (isBuiltin(specifier)) return file.nodeEntry ? undefined : 'node-built-in';
  const pkg = packageOf(specifier);
  return pkg === undefined ? undefined : packageProblem(pkg, resolve(specifier), scope);
};

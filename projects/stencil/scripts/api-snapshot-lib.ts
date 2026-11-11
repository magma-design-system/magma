/**
 * Reduces the docs JSON (dist/documentation.json) and the declarations of the package root
 * (dist/types/index.d.ts) to the public API snapshot that api-snapshot.ts writes to
 * magma.api.txt. Kept free of file-system side effects so scripts/api-snapshot-lib.spec.ts
 * can test it directly: the declarations come in through a read function.
 *
 * One sorted line per public member, each naming its component, so a git diff of the
 * file reads as the change to the contract consumers rely on: props (attribute,
 * reflect, mutable, required, type, default), events (detail, bubbles, cancelable,
 * composed), methods (signature), slots, parts, documented CSS custom properties,
 * custom states; then the exports of the package root and their promised members
 * (rootApi below); then the declarations of the types they reference. Prose (JSDoc, usage
 * docs) is left out on purpose: rewording a description does not change the API.
 *
 * A CSS custom property is listed with its contract (scripts/style-contract-lib.ts):
 * `[static]` on a public one that takes a value of its own, `INTERNAL` on one that is not
 * promised, so pr-risk weighs its removal as a patch.
 */
import { posix } from 'node:path';
import ts from 'typescript';

interface ApiReference {
  location?: string;
  id?: string;
}

interface ApiComplexType {
  references?: Record<string, ApiReference>;
}

/** The slice of a docs-json component entry the snapshot reads. */
export interface ApiComponent {
  tag: string;
  encapsulation: string;
  deprecation?: string;
  props: {
    name: string;
    attr?: string;
    type: string;
    default?: string;
    mutable: boolean;
    reflectToAttr: boolean;
    required: boolean;
    deprecation?: string;
    complexType?: ApiComplexType;
  }[];
  events: {
    event: string;
    detail: string;
    bubbles: boolean;
    cancelable: boolean;
    composed: boolean;
    deprecation?: string;
    complexType?: ApiComplexType;
  }[];
  methods: {
    name: string;
    signature: string;
    deprecation?: string;
    complexType?: ApiComplexType;
  }[];
  slots: { name: string }[];
  parts: { name: string }[];
  styles: { name: string; visibility?: 'public' | 'internal'; static?: boolean }[];
  states?: { name: string }[];
}

/** The slice of dist/documentation.json the snapshot reads. */
export interface ApiDocs {
  components: ApiComponent[];
  typeLibrary: Record<string, { declaration: string }>;
}

export const SNAPSHOT_HEADER = [
  '# Public API of @maggioli-design-system/magma: one sorted line per member.',
  '# Generated from dist/documentation.json and dist/types/index.d.ts by the stencil build',
  '# (nx run stencil:build.api-snapshot), checked in CI (nx run stencil:check.api-snapshot).',
  '# Its diff is what a change does to the contract.',
];

const byName = <T>(items: T[] | undefined, name: (item: T) => string): T[] =>
  [...(items ?? [])].sort((a, b) => name(a).localeCompare(name(b)));

const flags = (pairs: [string, boolean][]): string => {
  const on = pairs.filter(([, value]) => value).map(([label]) => label);
  return on.length ? ` [${on.join(', ')}]` : '';
};

const deprecated = (deprecation: string | undefined): string =>
  deprecation != null ? ' DEPRECATED' : '';

/* ---- the exports of the package root ------------------------------------------------ */

/**
 * The declarations of src/index.ts, the module the package root (`.`) and `./services` serve:
 * what the TypeScript of a product reads when it imports from the package. A path relative to
 * dist/types, as every path a ReadDeclaration receives.
 */
export const ROOT_ENTRY = 'index.d.ts';

/* the types Stencil writes for the components (#1353 re-exports them from the root): the
   component lines cover them, from documentation.json */
const COMPONENT_TYPES = './components';

/** A declaration file of dist/types by its posix path relative to dist/types; undefined when missing. */
export type ReadDeclaration = (path: string) => string | undefined;

/** What rootApi adds to the snapshot, and what it could not read. */
export interface RootApi {
  /** Per export, sorted by name: `<Export> export <kind>`, then one line per promised member. */
  members: string[];
  /** The declarations of the types the root exports or its promised members reference. */
  types: { name: string; line: string }[];
  /** Each one fails the build: a declaration the snapshot cannot read, a mark it cannot trust. */
  errors: string[];
}

export const NO_ROOT: RootApi = { members: [], types: [], errors: [] };

interface Source {
  path: string;
  file: ts.SourceFile;
}

interface Declaration {
  /** const, let, var, type, interface, class, function, enum, namespace */
  kind: string;
  node: ts.Node;
  source: Source;
}

const collapse = (text: string): string => text.replace(/\s+/g, ' ').trim();

/* one parse per file and read function: a declaration found twice is the same node */
const parsed = new WeakMap<ReadDeclaration, Map<string, Source | undefined>>();
const parse = (read: ReadDeclaration, path: string): Source | undefined => {
  const files = parsed.get(read) ?? new Map<string, Source | undefined>();
  parsed.set(read, files);
  if (!files.has(path)) {
    const text = read(path);
    files.set(
      path,
      text === undefined
        ? undefined
        : { path, file: ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true) },
    );
  }
  return files.get(path);
};

/** The declaration file a module specifier names, from the file that writes it. */
const resolveModule = (read: ReadDeclaration, from: string, specifier: string) => {
  /* a package (`@stencil/core`, `idb-keyval`): its types are not this package's to promise */
  if (!specifier.startsWith('.')) return undefined;
  const base = posix.join(posix.dirname(from), specifier);
  return [`${base}.d.ts`, `${base}/index.d.ts`].find((path) => read(path) !== undefined);
};

const NAMED_KIND: [(node: ts.Node) => boolean, string][] = [
  [ts.isTypeAliasDeclaration, 'type'],
  [ts.isInterfaceDeclaration, 'interface'],
  [ts.isClassDeclaration, 'class'],
  [ts.isFunctionDeclaration, 'function'],
  [ts.isEnumDeclaration, 'enum'],
  [ts.isModuleDeclaration, 'namespace'],
];

/**
 * Where `name` is declared, seen from the file `path`: in the file, or through the import or
 * the re-export that brings it in. Undefined for a name no file of dist/types declares, a
 * global type (`MouseEvent`) or one of a package.
 */
const declarationOf = (
  read: ReadDeclaration,
  path: string,
  name: string,
  depth = 0,
): Declaration | undefined => {
  const source = parse(read, path);
  /* a chain of re-exports this long is a cycle */
  if (!source || depth > 16) return undefined;
  for (const statement of source.file.statements) {
    if (ts.isVariableStatement(statement)) {
      const flags = statement.declarationList.flags;
      const kind = flags & ts.NodeFlags.Const ? 'const' : flags & ts.NodeFlags.Let ? 'let' : 'var';
      for (const node of statement.declarationList.declarations)
        if (ts.isIdentifier(node.name) && node.name.text === name) return { kind, node, source };
      continue;
    }
    const named = NAMED_KIND.find(([is]) => is(statement));
    if (named) {
      const id = (statement as ts.DeclarationStatement).name;
      if (id && ts.isIdentifier(id) && id.text === name)
        return { kind: named[1], node: statement, source };
      continue;
    }
    if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) continue;
    const specifier = statement.moduleSpecifier;
    const bindings = ts.isImportDeclaration(statement)
      ? statement.importClause?.namedBindings
      : statement.exportClause;
    if (!specifier || !ts.isStringLiteral(specifier) || !bindings) continue;
    if (!ts.isNamedImports(bindings) && !ts.isNamedExports(bindings)) continue;
    for (const element of bindings.elements) {
      if (element.name.text !== name) continue;
      const target = resolveModule(read, path, specifier.text);
      return target === undefined
        ? undefined
        : declarationOf(read, target, (element.propertyName ?? element.name).text, depth + 1);
    }
  }
  return undefined;
};

const hasTag = (node: ts.Node, tag: string): boolean =>
  ts.getJSDocTags(node).some((one) => one.tagName.text === tag);

/* the mark of the CSS custom properties, written where the tag belongs */
const LIKE_THE_CSS_MARK = /^\W*public\b/i;
const description = (node: ts.Node): string =>
  ts
    .getJSDocCommentsAndTags(node)
    .filter(ts.isJSDoc)
    .map((doc) => ts.getTextOfJSDocComment(doc.comment) ?? '')
    .join(' ');

const isDeprecated = (node: ts.Node): string =>
  ts.getJSDocDeprecatedTag(node) !== undefined ? ' DEPRECATED' : '';

const modifierOf = (node: ts.Node, kind: ts.SyntaxKind): boolean =>
  ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((one) => one.kind === kind);

/**
 * The public API of the package root, read from the declarations of its module (ROOT_ENTRY),
 * the files the TypeScript of a product reads. What it promises, and where that comes from:
 *
 * - every named export is listed, `<Export> export <kind>` (const, type, interface): an
 *   import of it breaks when it goes, whatever it holds;
 * - of an exported const, the members its type declares (a service is a const typed with a
 *   class the root does not export) are listed only when promised, that is when their JSDoc
 *   carries `@public`, the release tag of TSDoc for an item released to third parties with a
 *   stable, semver-bound signature (https://tsdoc.org/pages/tags/public/; its counterpart is
 *   `@internal`). A member without it serves the components
 *   (`IconsSetService.fetchSvg()`, `NavigationService.handle()`) and may change in any
 *   release. A tag, and not the `Public.` that starts the description of a promised CSS
 *   custom property: that mark lives in the description because documentation.json keeps
 *   nothing else of a CSS `@prop` (style-contract-lib.ts), while a declaration file keeps the
 *   JSDoc tags. A description that starts with that mark instead, and `@public` on a private
 *   or static member or next to `@internal`, are errors;
 * - an exported type or interface is listed whole in the types section, with the types it
 *   references, as the ones the components reference; so are the types a promised member
 *   references, when dist/types declares them (a global or a package's type is not listed);
 * - `export type * from './components'` (#1353) brings the types Stencil writes for the
 *   components, which the component lines already cover: skipped.
 *
 * Anything else (a class, function, enum, let or default export; an `export *` of another
 * module; a const of another type, or whose class inherits; an accessor, a referenced class
 * or overloads among the promised members) is an error rather than a guess: extend this
 * reader first, with its test.
 */
export const rootApi = (read: ReadDeclaration, entry = ROOT_ENTRY): RootApi => {
  const source = parse(read, entry);
  if (!source) return { ...NO_ROOT, errors: [`${entry}: missing, run the stencil build first`] };
  const errors: string[] = [];
  const exports: { name: string; lines: string[] }[] = [];
  const types = new Map<string, { name: string; line: string }>();
  const listed = new Set<ts.Node>();

  const referencesOf = (node: ts.Node, from: Source) => {
    const visit = (child: ts.Node) => {
      const id = ts.isTypeReferenceNode(child)
        ? child.typeName
        : ts.isExpressionWithTypeArguments(child)
          ? child.expression
          : undefined;
      if (id && ts.isIdentifier(id)) {
        const declaration = declarationOf(read, from.path, id.text);
        if (declaration) typeOf(declaration);
      }
      ts.forEachChild(child, visit);
    };
    ts.forEachChild(node, visit);
  };

  /* a type in the types section, as the component types: `export` and `declare` dropped */
  const typeOf = ({ kind, node, source: from }: Declaration) => {
    if (listed.has(node)) return;
    listed.add(node);
    let line: string;
    if (ts.isTypeAliasDeclaration(node)) {
      const params = node.typeParameters?.map((p) => p.getText(from.file)).join(', ');
      line = `type ${node.name.text}${params ? `<${params}>` : ''} = ${collapse(node.type.getText(from.file))}`;
    } else if (ts.isInterfaceDeclaration(node) || ts.isEnumDeclaration(node)) {
      line = collapse(node.getText(from.file))
        .replace(/^export\s+/, '')
        .replace(/^declare\s+/, '');
    } else {
      errors.push(
        `${from.path}: a promised member references a ${kind}, the snapshot lists types, interfaces and enums`,
      );
      return;
    }
    types.set(line, { name: node.name.text, line });
    referencesOf(node, from);
  };

  /* the members of the type of an exported const, from the class, interface or literal */
  const membersOf = (name: string, type: ts.TypeNode, from: Source) => {
    if (ts.isTypeLiteralNode(type)) return { members: [...type.members], from };
    if (ts.isTypeReferenceNode(type) && !type.typeArguments && ts.isIdentifier(type.typeName)) {
      const declaration = declarationOf(read, from.path, type.typeName.text);
      const node = declaration?.node;
      if (node && (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node))) {
        if (node.heritageClauses?.length) {
          errors.push(
            `${name}: its ${declaration.kind} inherits members the snapshot does not read`,
          );
          return undefined;
        }
        return { members: [...node.members], from: declaration.source };
      }
    }
    errors.push(
      `${name}: a const of type ${type.getText(from.file)}, the snapshot reads a const typed with a class, an interface or a type literal`,
    );
    return undefined;
  };

  const promised = (name: string, member: ts.ClassElement | ts.TypeElement, from: Source) => {
    const label = `${name}.${member.name?.getText(from.file) ?? '(unnamed)'}`;
    if (!hasTag(member, 'public')) {
      if (LIKE_THE_CSS_MARK.test(description(member)))
        errors.push(
          `${label}: a promised member carries the @public tag, its description does not start with "Public."`,
        );
      return undefined;
    }
    if (hasTag(member, 'internal')) errors.push(`${label}: both @public and @internal`);
    if (
      modifierOf(member, ts.SyntaxKind.PrivateKeyword) ||
      modifierOf(member, ts.SyntaxKind.ProtectedKeyword) ||
      (member.name !== undefined && ts.isPrivateIdentifier(member.name))
    )
      errors.push(`${label}: @public on a member a product cannot reach`);
    if (modifierOf(member, ts.SyntaxKind.StaticKeyword))
      errors.push(
        `${label}: @public on a static member, which the exported instance does not have`,
      );
    const text = (node: ts.Node | undefined) => (node ? collapse(node.getText(from.file)) : 'any');
    const optional = 'questionToken' in member && member.questionToken ? '?' : '';
    const id = `${member.name?.getText(from.file)}${optional}`;
    referencesOf(member, from);
    if (ts.isMethodDeclaration(member) || ts.isMethodSignature(member)) {
      const params = member.typeParameters?.map(text).join(', ');
      const signature = `${id}${params ? `<${params}>` : ''}(${member.parameters.map(text).join(', ')}) => ${text(member.type)}`;
      return { key: `method ${id}`, line: `${name} method ${signature}${isDeprecated(member)}` };
    }
    if (ts.isPropertyDeclaration(member) || ts.isPropertySignature(member)) {
      const readonly = modifierOf(member, ts.SyntaxKind.ReadonlyKeyword) ? ' [readonly]' : '';
      /* a declaration file writes a readonly literal as its initializer: `readonly key = "x"` */
      const type =
        member.type ?? (ts.isPropertyDeclaration(member) ? member.initializer : undefined);
      return {
        key: `property ${id}`,
        line: `${name} property ${id}${readonly}: ${text(type)}${isDeprecated(member)}`,
      };
    }
    errors.push(
      `${label}: the snapshot does not read a promised ${ts.SyntaxKind[member.kind]} yet`,
    );
    return undefined;
  };

  const exportOf = (name: string, declaration: Declaration, typeOnly: boolean) => {
    const { kind, node, source: from } = declaration;
    const lines = [`${name} export ${kind}${isDeprecated(node)}`];
    if (kind === 'type' || kind === 'interface') {
      typeOf(declaration);
    } else if (kind === 'const' && ts.isVariableDeclaration(node) && !typeOnly) {
      const members = node.type ? membersOf(name, node.type, from) : undefined;
      if (!node.type) errors.push(`${name}: a const without a declared type`);
      const seen = new Map<string, string>();
      for (const member of members?.members ?? []) {
        const one = promised(name, member, members?.from ?? from);
        if (!one) continue;
        if (seen.has(one.key))
          errors.push(`${name}: overloads of ${one.key}, which the snapshot does not read yet`);
        seen.set(one.key, one.line);
      }
      lines.push(...[...seen.values()].sort());
    } else {
      errors.push(
        `${name}: the snapshot does not read ${typeOnly ? 'a type-only export of ' : ''}an exported ${kind} yet, extend rootApi in scripts/api-snapshot-lib.ts`,
      );
    }
    exports.push({ name, lines });
  };

  for (const statement of source.file.statements) {
    if (ts.isImportDeclaration(statement)) continue;
    if (ts.isExportDeclaration(statement)) {
      const specifier =
        statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)
          ? statement.moduleSpecifier.text
          : undefined;
      if (!statement.exportClause || ts.isNamespaceExport(statement.exportClause)) {
        if (specifier !== COMPONENT_TYPES || statement.exportClause)
          errors.push(
            `${entry}: export * from '${specifier}', which the snapshot does not read: export its members by name`,
          );
        continue;
      }
      const target = specifier === undefined ? entry : resolveModule(read, entry, specifier);
      for (const element of statement.exportClause.elements) {
        const name = element.name.text;
        const declaration = target
          ? declarationOf(read, target, (element.propertyName ?? element.name).text)
          : undefined;
        if (!declaration) errors.push(`${name}: no declaration of it in dist/types`);
        else exportOf(name, declaration, statement.isTypeOnly || element.isTypeOnly);
      }
      continue;
    }
    if (ts.isExportAssignment(statement)) {
      errors.push(`${entry}: a default export, which the snapshot does not read`);
      continue;
    }
    /* a declaration of the entry itself: listed when exported */
    if (!modifierOf(statement, ts.SyntaxKind.ExportKeyword)) continue;
    const names = ts.isVariableStatement(statement)
      ? statement.declarationList.declarations.map((d) => d.name.getText(source.file))
      : [(statement as ts.DeclarationStatement).name?.getText(source.file) ?? 'default'];
    for (const name of names) {
      const declaration = declarationOf(read, entry, name);
      if (!declaration) errors.push(`${entry}: an export the snapshot does not read (${name})`);
      else exportOf(name, declaration, false);
    }
  }

  return {
    members: exports.sort((a, b) => a.name.localeCompare(b.name)).flatMap((one) => one.lines),
    types: [...types.values()],
    errors,
  };
};

/** The lines of the snapshot, without the header. */
export const apiSnapshot = (docs: ApiDocs, root: RootApi = NO_ROOT): string[] => {
  const lines: string[] = [];
  const typeIds = new Set<string>();
  const collect = (complexType: ApiComplexType | undefined) => {
    for (const ref of Object.values(complexType?.references ?? {})) {
      if (ref.id && ref.location !== 'global') typeIds.add(ref.id);
    }
  };

  for (const c of byName(docs.components, (c) => c.tag)) {
    const t = c.tag;
    lines.push(`${t} encapsulation ${c.encapsulation}${deprecated(c.deprecation)}`);
    for (const p of byName(c.props, (p) => p.name)) {
      collect(p.complexType);
      const attr = p.attr ? `attr ${p.attr}` : 'no attr';
      const f = flags([
        ['reflect', p.reflectToAttr],
        ['mutable', p.mutable],
        ['required', p.required],
      ]);
      const def = p.default != null ? ` = ${p.default}` : '';
      lines.push(`${t} prop ${p.name} (${attr})${f}: ${p.type}${def}${deprecated(p.deprecation)}`);
    }
    for (const e of byName(c.events, (e) => e.event)) {
      collect(e.complexType);
      const f = flags([
        ['bubbles', e.bubbles],
        ['cancelable', e.cancelable],
        ['composed', e.composed],
      ]);
      lines.push(`${t} event ${e.event}: ${e.detail}${f}${deprecated(e.deprecation)}`);
    }
    for (const m of byName(c.methods, (m) => m.name)) {
      collect(m.complexType);
      lines.push(`${t} method ${m.signature}${deprecated(m.deprecation)}`);
    }
    /* the default slot is documented either nameless or as `default` */
    for (const s of byName(c.slots, (s) => s.name)) {
      lines.push(`${t} slot ${!s.name || s.name === 'default' ? '(default)' : s.name}`);
    }
    for (const p of byName(c.parts, (p) => p.name)) lines.push(`${t} part ${p.name}`);
    for (const s of byName(c.styles, (s) => s.name))
      lines.push(
        `${t} css ${s.name}${s.static ? ' [static]' : ''}${s.visibility === 'internal' ? ' INTERNAL' : ''}`,
      );
    for (const s of byName(c.states, (s) => s.name)) lines.push(`${t} state ${s.name}`);
  }

  /* an alias is stored as its right-hand side only: its name is the id's ("path::Name") */
  const types = new Map<string, string>();
  for (const id of typeIds) {
    const entry = docs.typeLibrary[id];
    if (!entry) continue;
    const declaration = entry.declaration
      .replace(/^export\s+/, '')
      .replace(/\s+/g, ' ')
      .trim();
    const name = id.split('::').pop() ?? id;
    const line = /^(interface|type|enum|class)\s/.test(declaration)
      ? declaration
      : `type ${name} = ${declaration}`;
    types.set(`${name} ${line}`, line);
  }

  /* the root after the components; its types with theirs, once each */
  lines.push(...root.members);
  for (const { name, line } of root.types) types.set(`${name} ${line}`, line);

  return [...lines, ...[...types.keys()].sort().map((key) => types.get(key) as string)];
};

/** The whole magma.api.txt file. */
export const snapshotFile = (docs: ApiDocs, root: RootApi = NO_ROOT): string =>
  [...SNAPSHOT_HEADER, ...apiSnapshot(docs, root)].join('\n') + '\n';

/** The members one snapshot file has and the other lacks, ignoring the header. */
export const diffSnapshot = (
  committed: string,
  built: string,
): { removed: string[]; added: string[] } => {
  const members = (file: string) =>
    new Set(file.split('\n').filter((line) => line && !line.startsWith('#')));
  const before = members(committed);
  const after = members(built);
  return {
    removed: [...before].filter((line) => !after.has(line)),
    added: [...after].filter((line) => !before.has(line)),
  };
};

/**
 * Reduces the docs JSON (dist/documentation.json) to the public API snapshot that
 * api-snapshot.ts writes to magma.api.txt. Kept free of file-system side effects so
 * scripts/api-snapshot-lib.spec.ts can test it directly.
 *
 * One sorted line per public member, each naming its component, so a git diff of the
 * file reads as the change to the contract consumers rely on: props (attribute,
 * reflect, mutable, required, type, default), events (detail, bubbles, cancelable,
 * composed), methods (signature), slots, parts, documented CSS custom properties,
 * custom states, then the declarations of the types they reference. Prose (JSDoc, usage
 * docs) is left out on purpose: rewording a description does not change the API.
 */

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
  styles: { name: string }[];
  states?: { name: string }[];
}

/** The slice of dist/documentation.json the snapshot reads. */
export interface ApiDocs {
  components: ApiComponent[];
  typeLibrary: Record<string, { declaration: string }>;
}

export const SNAPSHOT_HEADER = [
  '# Public API of @maggioli-design-system/magma: one sorted line per member.',
  '# Generated from dist/documentation.json by the stencil build (nx run stencil:build.api-snapshot),',
  '# checked in CI (nx run stencil:check.api-snapshot). Its diff is what a change does to the contract.',
];

const byName = <T>(items: T[] | undefined, name: (item: T) => string): T[] =>
  [...(items ?? [])].sort((a, b) => name(a).localeCompare(name(b)));

const flags = (pairs: [string, boolean][]): string => {
  const on = pairs.filter(([, value]) => value).map(([label]) => label);
  return on.length ? ` [${on.join(', ')}]` : '';
};

const deprecated = (deprecation: string | undefined): string =>
  deprecation != null ? ' DEPRECATED' : '';

/** The lines of the snapshot, without the header. */
export const apiSnapshot = (docs: ApiDocs): string[] => {
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
    for (const s of byName(c.styles, (s) => s.name)) lines.push(`${t} css ${s.name}`);
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

  return [...lines, ...[...types.keys()].sort().map((key) => types.get(key) as string)];
};

/** The whole magma.api.txt file. */
export const snapshotFile = (docs: ApiDocs): string =>
  [...SNAPSHOT_HEADER, ...apiSnapshot(docs)].join('\n') + '\n';

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

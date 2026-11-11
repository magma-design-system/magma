import { describe, expect, it } from 'vitest';
import {
  apiSnapshot,
  diffSnapshot,
  rootApi,
  SNAPSHOT_HEADER,
  snapshotFile,
  type ApiComponent,
  type ApiDocs,
  type ReadDeclaration,
} from './api-snapshot-lib';

const button = (): ApiComponent => ({
  tag: 'mds-button',
  encapsulation: 'shadow',
  props: [
    {
      name: 'variant',
      attr: 'variant',
      type: '"error" | "primary" | undefined',
      default: "'primary'",
      mutable: false,
      reflectToAttr: true,
      required: false,
    },
    {
      name: 'active',
      attr: 'active',
      type: 'boolean',
      mutable: true,
      reflectToAttr: true,
      required: false,
    },
    {
      name: 'config',
      type: 'ButtonConfig',
      mutable: false,
      reflectToAttr: false,
      required: true,
      complexType: {
        references: {
          ButtonConfig: { location: 'import', id: 'src/type/button.ts::ButtonConfig' },
          HTMLElement: { location: 'global', id: 'global::HTMLElement' },
        },
      },
    },
  ],
  events: [
    {
      event: 'mdsButtonClick',
      detail: 'ButtonClickDetail',
      bubbles: true,
      cancelable: false,
      composed: true,
      complexType: {
        references: {
          ButtonClickDetail: { location: 'local', id: 'src/type/button.ts::ButtonClickDetail' },
        },
      },
    },
  ],
  methods: [{ name: 'focusLabel', signature: 'focusLabel() => Promise<void>' }],
  slots: [{ name: 'notification' }, { name: '' }],
  parts: [{ name: 'label' }, { name: 'icon' }],
  styles: [{ name: '--mds-button-radius' }, { name: '--mds-button-background' }],
  states: [],
});

const badge = (): ApiComponent => ({
  tag: 'mds-badge',
  encapsulation: 'scoped',
  props: [],
  events: [],
  methods: [],
  slots: [{ name: 'default' }],
  parts: [],
  styles: [],
});

const docs = (components: ApiComponent[]): ApiDocs => ({
  components,
  typeLibrary: {
    'src/type/button.ts::ButtonConfig': {
      declaration: 'export interface ButtonConfig {\n  dense: boolean;\n}',
    },
    'src/type/button.ts::ButtonClickDetail': { declaration: '{ id: string }' },
    'src/type/unused.ts::Unused': { declaration: '"a" | "b"' },
  },
});

describe('apiSnapshot', () => {
  it('writes one line per member, components and members sorted by name', () => {
    expect(apiSnapshot(docs([button(), badge()]))).toEqual([
      'mds-badge encapsulation scoped',
      'mds-badge slot (default)',
      'mds-button encapsulation shadow',
      'mds-button prop active (attr active) [reflect, mutable]: boolean',
      'mds-button prop config (no attr) [required]: ButtonConfig',
      'mds-button prop variant (attr variant) [reflect]: "error" | "primary" | undefined = \'primary\'',
      'mds-button event mdsButtonClick: ButtonClickDetail [bubbles, composed]',
      'mds-button method focusLabel() => Promise<void>',
      'mds-button slot (default)',
      'mds-button slot notification',
      'mds-button part icon',
      'mds-button part label',
      'mds-button css --mds-button-background',
      'mds-button css --mds-button-radius',
      'type ButtonClickDetail = { id: string }',
      'interface ButtonConfig { dense: boolean; }',
    ]);
  });

  it('does not depend on the order the docs list things in', () => {
    const reversed = button();
    for (const key of ['props', 'events', 'methods', 'slots', 'parts', 'styles'] as const) {
      (reversed[key] as unknown[]).reverse();
    }
    expect(apiSnapshot(docs([reversed, badge()]))).toEqual(apiSnapshot(docs([badge(), button()])));
  });

  it('leaves the prose out: rewording a description is not an API change', () => {
    const reworded = button() as ApiComponent & { docs: string };
    reworded.docs = 'A completely different description';
    Object.assign(reworded.props[0], { docs: 'Another wording', docsTags: [{ name: 'example' }] });
    expect(apiSnapshot(docs([reworded]))).toEqual(apiSnapshot(docs([button()])));
  });

  it('marks deprecated components, props, events and methods', () => {
    const old = button();
    old.deprecation = 'use mds-action';
    old.props[1].deprecation = '';
    old.events[0].deprecation = 'use mdsButtonPress';
    old.methods[0].deprecation = '';
    const lines = apiSnapshot(docs([old]));
    expect(lines).toContain('mds-button encapsulation shadow DEPRECATED');
    expect(lines).toContain(
      'mds-button prop active (attr active) [reflect, mutable]: boolean DEPRECATED',
    );
    expect(lines).toContain(
      'mds-button event mdsButtonClick: ButtonClickDetail [bubbles, composed] DEPRECATED',
    );
    expect(lines).toContain('mds-button method focusLabel() => Promise<void> DEPRECATED');
  });

  it('writes the contract of the CSS custom properties: [static] and INTERNAL', () => {
    const marked = button();
    marked.styles = [
      { name: '--mds-button-radius', visibility: 'public' },
      { name: '--mds-button-skin', visibility: 'public', static: true },
      { name: '--mds-button-icon-color', visibility: 'internal' },
    ];
    expect(apiSnapshot(docs([marked])).filter((line) => line.includes(' css '))).toEqual([
      'mds-button css --mds-button-icon-color INTERNAL',
      'mds-button css --mds-button-radius',
      'mds-button css --mds-button-skin [static]',
    ]);
  });

  it('lists custom states', () => {
    const stateful = badge();
    stateful.states = [{ name: 'open' }];
    expect(apiSnapshot(docs([stateful]))).toContain('mds-badge state open');
  });

  it('declares only the types the API references, never the global ones, once each', () => {
    const twice = badge();
    twice.tag = 'mds-button-group';
    twice.props = [{ ...button().props[2], name: 'groupConfig' }];
    const types = apiSnapshot(docs([button(), twice])).filter((line) => !line.startsWith('mds-'));
    expect(types).toEqual([
      'type ButtonClickDetail = { id: string }',
      'interface ButtonConfig { dense: boolean; }',
    ]);
  });
});

/* dist/types as the stencil build writes it: the declarations of src/index.ts and of the
   modules it re-exports, with their JSDoc */
const ROOT_FILES: Record<string, string> = {
  'index.d.ts': [
    '/** The entry point that holds no component. */',
    "export type * from './components';",
    "export { IconsSetService } from './components/mds-icon/services/icons-set.service';",
    "export { NavigationService } from './common/navigation';",
    "export type { NavigationHandler } from './common/navigation';",
  ].join('\n'),
  'components.d.ts': 'export namespace Components { interface MdsButton { "size": string; } }',
  'components/mds-icon/services/icons-set.service.d.ts': `import { IconNameResolverFn, MdsIconSet } from '../meta/icon-set';
declare class IconsSetController {
    readonly _svgPathKey = "mdsIconSvgPath";
    private readonly _iconsSets;
    constructor();
    private get _svgPath();
    addIconSet(name: string, path: string, resolveIconName: IconNameResolverFn): boolean;
    getIconSet(iconName: string): { set: MdsIconSet | undefined; };
    /**
     * Sets the directory of the svg files.
     *
     * @public
     */
    setSvgPath(svgPath: string): void;
    /** @public */
    getSvgPath(): string;
    fetchSvg(name: string): Promise<string>;
}
export declare const IconsSetService: IconsSetController;
export {};`,
  'components/mds-icon/meta/icon-set.d.ts': `export type IconNameResolverFn = (name: string) => string;
export declare class MdsIconSet { name: string; }`,
  'common/navigation.d.ts': `/** The hook a client-side router registers. */
export type NavigationHandler = (href: string, event: MouseEvent) => boolean | void;
declare class NavigationController {
    private get handler();
    /**
     * Registers the handler of the app.
     * @public
     */
    setHandler(handler?: NavigationHandler): () => void;
    getHandler(): NavigationHandler | undefined;
    handle(href: string, event: MouseEvent): boolean;
}
export declare const NavigationService: NavigationController;
export {};`,
};

const reader =
  (files: Record<string, string>): ReadDeclaration =>
  (path) =>
    files[path];
/* the files of ROOT_FILES with one replaced, or added */
const withFile = (path: string, text: string) => reader({ ...ROOT_FILES, [path]: text });

describe('rootApi', () => {
  it('lists every export of the root and only the members tagged @public', () => {
    expect(rootApi(reader(ROOT_FILES))).toEqual({
      members: [
        'IconsSetService export const',
        'IconsSetService method getSvgPath() => string',
        'IconsSetService method setSvgPath(svgPath: string) => void',
        'NavigationHandler export type',
        'NavigationService export const',
        'NavigationService method setHandler(handler?: NavigationHandler) => () => void',
      ],
      types: [
        {
          name: 'NavigationHandler',
          line: 'type NavigationHandler = (href: string, event: MouseEvent) => boolean | void',
        },
      ],
      errors: [],
    });
  });

  it('adds its lines after the components and its types among theirs, once each', () => {
    const lines = apiSnapshot(docs([badge()]), rootApi(reader(ROOT_FILES)));
    expect(lines[0]).toBe('mds-badge encapsulation scoped');
    expect(lines.indexOf('IconsSetService export const')).toBeGreaterThan(
      lines.indexOf('mds-badge slot (default)'),
    );
    expect(lines.filter((line) => line.startsWith('type NavigationHandler'))).toHaveLength(1);
    expect(lines.at(-1)).toBe(
      'type NavigationHandler = (href: string, event: MouseEvent) => boolean | void',
    );
  });

  it('declares the types a promised member references, from the file that declares them', () => {
    const icons = ROOT_FILES['components/mds-icon/services/icons-set.service.d.ts'];
    const read = withFile(
      'components/mds-icon/services/icons-set.service.d.ts',
      icons.replace(
        '    fetchSvg(name: string): Promise<string>;',
        '    /** @public */\n    resolver(name: string): IconNameResolverFn;',
      ),
    );
    const { members, types, errors } = rootApi(read);
    expect(errors).toEqual([]);
    expect(members).toContain(
      'IconsSetService method resolver(name: string) => IconNameResolverFn',
    );
    expect(types.map((t) => t.line)).toContain(
      'type IconNameResolverFn = (name: string) => string',
    );
  });

  it('marks what JSDoc deprecates, and lists a promised property with its flags', () => {
    const read = withFile(
      'common/navigation.d.ts',
      ROOT_FILES['common/navigation.d.ts']
        .replace('     * @public\n', '     * @public\n     * @deprecated use the router\n')
        .replace(
          '    getHandler(): NavigationHandler | undefined;',
          '    /** @public */\n    readonly ready: boolean;',
        )
        .replace(
          'export declare const NavigationService',
          '/** @deprecated */\nexport declare const NavigationService',
        ),
    );
    const { members, errors } = rootApi(read);
    expect(errors).toEqual([]);
    expect(members.filter((line) => line.startsWith('NavigationService'))).toEqual([
      'NavigationService export const DEPRECATED',
      'NavigationService method setHandler(handler?: NavigationHandler) => () => void DEPRECATED',
      'NavigationService property ready [readonly]: boolean',
    ]);
  });

  it('ignores the JSDoc prose: rewording a promised member changes no line', () => {
    const read = withFile(
      'common/navigation.d.ts',
      ROOT_FILES['common/navigation.d.ts'].replace(
        'Registers the handler of the app.',
        'Registers, once, the router.',
      ),
    );
    expect(rootApi(read)).toEqual(rootApi(reader(ROOT_FILES)));
  });

  it('fails on a promise written as the mark of the CSS custom properties', () => {
    const read = withFile(
      'common/navigation.d.ts',
      ROOT_FILES['common/navigation.d.ts'].replace(
        '    getHandler()',
        '    /** Public. The handler. */\n    getHandler()',
      ),
    );
    expect(rootApi(read).errors).toEqual([
      'NavigationService.getHandler: a promised member carries the @public tag, its description does not start with "Public."',
    ]);
  });

  it('fails on @public where a product cannot reach the member, or next to @internal', () => {
    const read = withFile(
      'common/navigation.d.ts',
      ROOT_FILES['common/navigation.d.ts']
        .replace('    private get handler();', '    /** @public */\n    private secret: string;')
        .replace('    handle(', '    /** @public @internal */\n    handle('),
    );
    expect(rootApi(read).errors).toEqual([
      'NavigationService.secret: @public on a member a product cannot reach',
      'NavigationService.handle: both @public and @internal',
    ]);
  });

  it('fails on an export it does not read, rather than guessing its contract', () => {
    const index = ROOT_FILES['index.d.ts'];
    const cases: [string, string][] = [
      [
        "export * from './common/navigation';",
        "index.d.ts: export * from './common/navigation', which the snapshot does not read: export its members by name",
      ],
      [
        "export { MdsIconSet } from './components/mds-icon/meta/icon-set';",
        'MdsIconSet: the snapshot does not read an exported class yet, extend rootApi in scripts/api-snapshot-lib.ts',
      ],
      [
        "export { Missing } from './common/navigation';",
        'Missing: no declaration of it in dist/types',
      ],
      ['export default 1;', 'index.d.ts: a default export, which the snapshot does not read'],
    ];
    for (const [line, error] of cases)
      expect(rootApi(withFile('index.d.ts', `${index}\n${line}`)).errors).toEqual([error]);
  });

  it('fails on a const whose type it cannot read the members of', () => {
    const read = withFile('index.d.ts', 'export declare const VERSION: string;');
    expect(rootApi(read)).toEqual({
      members: ['VERSION export const'],
      types: [],
      errors: [
        'VERSION: a const of type string, the snapshot reads a const typed with a class, an interface or a type literal',
      ],
    });
  });

  it('fails when the declarations of the root are missing', () => {
    expect(rootApi(reader({})).errors).toEqual([
      'index.d.ts: missing, run the stencil build first',
    ]);
  });
});

describe('snapshotFile', () => {
  it('puts the header first and ends with a newline', () => {
    const file = snapshotFile(docs([badge()]));
    expect(file.split('\n').slice(0, SNAPSHOT_HEADER.length)).toEqual(SNAPSHOT_HEADER);
    expect(file.endsWith('mds-badge slot (default)\n')).toBe(true);
  });
});

describe('diffSnapshot', () => {
  it('reports the members removed and added, ignoring the header', () => {
    const before = snapshotFile(docs([button()]));
    const changed = button();
    changed.props[0].type = '"error" | "primary" | "secondary" | undefined';
    changed.parts = [{ name: 'icon' }];
    const after = snapshotFile(docs([changed])).replace(SNAPSHOT_HEADER[0], '# another header');
    expect(diffSnapshot(before, after)).toEqual({
      removed: [
        'mds-button prop variant (attr variant) [reflect]: "error" | "primary" | undefined = \'primary\'',
        'mds-button part label',
      ],
      added: [
        'mds-button prop variant (attr variant) [reflect]: "error" | "primary" | "secondary" | undefined = \'primary\'',
      ],
    });
  });

  it('finds nothing between two snapshots of the same API', () => {
    const file = snapshotFile(docs([button(), badge()]));
    expect(diffSnapshot(file, file)).toEqual({ removed: [], added: [] });
  });
});

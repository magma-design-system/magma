import { describe, expect, it } from 'vitest';
import {
  apiSnapshot,
  diffSnapshot,
  SNAPSHOT_HEADER,
  snapshotFile,
  type ApiComponent,
  type ApiDocs,
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

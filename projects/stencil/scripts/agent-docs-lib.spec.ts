import path from 'path';
import { describe, expect, it } from 'vitest';
import {
  brokenLinks,
  COMPONENT_CATEGORIES,
  componentDocsJson,
  relativeLinks,
  renderComponentAgentsMd,
  renderUsageFile,
  readTaxonomy,
  renderCatalogue,
  rewriteGuideLinks,
  rewriteUsageLinks,
  rootOf,
  taxonomyErrors,
  type ComponentTaxonomy,
  type DocsComponent,
} from './agent-docs-lib';

const button: DocsComponent = {
  tag: 'mds-button',
  encapsulation: 'shadow',
  readme: '# mds-button readme',
  usage: {
    '1. Description':
      'The `<mds-button>` is an action. See [`docs/agents/variants.md`](../../../../../../docs/agents/variants.md).',
    '2. Pattern':
      'Use it. Rules in [`docs/agents/conventions.md`](../../../../../../docs/agents/conventions.md#slots).',
    '3. Antipattern': '',
  },
  props: [
    {
      name: 'tone',
      attr: 'tone',
      type: '"strong" | "weak"',
      default: "'strong'",
      docs: 'The tone\nof the button',
    },
    { name: 'label', attr: 'label', type: 'string', docs: 'The label', required: true },
    { name: 'old', type: 'boolean', docs: 'Old prop', deprecation: 'use `tone`' },
  ],
  events: [{ event: 'mdsButtonClick', detail: 'MouseEvent', docs: 'Emitted on click' }],
  slots: [
    { name: '', docs: 'Text only' },
    { name: 'notification', docs: 'A notification' },
  ],
  parts: [{ name: 'icon', docs: 'The icon' }],
  styles: [{ name: '--mds-button-radius', docs: 'Corner radius' }],
  dependencies: ['mds-icon'],
};

describe('rewriteUsageLinks', () => {
  it('points the shared fragments to the agents/ folder at the package root, keeping the anchor', () => {
    expect(
      rewriteUsageLinks(
        '[`docs/agents/conventions.md`](../../../../../../docs/agents/conventions.md#slots)',
      ),
    ).toBe('[`agents/conventions.md`](../../../../agents/conventions.md#slots)');
  });

  it('points the repo catalogue to the shipped catalogue', () => {
    expect(rewriteUsageLinks('[`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md)')).toBe(
      '[`agents/components.md`](../../../../agents/components.md)',
    );
  });

  it("points the component's own readme to its shipped AGENTS.md", () => {
    expect(rewriteUsageLinks('[`readme.md`](../readme.md)')).toBe('[`AGENTS.md`](AGENTS.md)');
  });

  it("points a sibling component's source folder to its shipped AGENTS.md", () => {
    expect(rewriteUsageLinks('[`<mds-accordion-item>`](../../mds-accordion-item)')).toBe(
      '[`<mds-accordion-item>`](../mds-accordion-item/AGENTS.md)',
    );
  });

  it('is idempotent', () => {
    const once = rewriteUsageLinks(
      '[`docs/agents/variants.md`](../../../../../../docs/agents/variants.md)',
    );
    expect(rewriteUsageLinks(once)).toBe(once);
  });
});

describe('rewriteGuideLinks', () => {
  const fromMagma = '../dist/collection/components';
  const fromWrapper = '../../magma/dist/collection/components';
  const readme =
    'documented in [`../../projects/stencil/src/components/mds-icon/readme.md`](../../projects/stencil/src/components/mds-icon/readme.md):';

  it("points a component's readme to its shipped AGENTS.md, from magma and from a wrapper", () => {
    // it used to become the plain text "the mds-icon readme", which no consumer can open
    expect(rewriteGuideLinks(readme, fromMagma)).toBe(
      'documented in [`mds-icon/AGENTS.md`](../dist/collection/components/mds-icon/AGENTS.md):',
    );
    expect(rewriteGuideLinks(readme, fromWrapper)).toBe(
      'documented in [`mds-icon/AGENTS.md`](../../magma/dist/collection/components/mds-icon/AGENTS.md):',
    );
  });

  it("points a component's Pattern and Antipattern to the shipped files, keeping the link text", () => {
    expect(
      rewriteGuideLinks(
        'in the [`mds-icon` pattern](../../projects/stencil/src/components/mds-icon/usage/2.%20Pattern.md)',
        fromWrapper,
      ),
    ).toBe(
      'in the [`mds-icon` pattern](../../magma/dist/collection/components/mds-icon/pattern.md)',
    );
    expect(
      rewriteGuideLinks(
        '[no](../../projects/stencil/src/components/mds-table/usage/3.%20Antipattern.md#do-not)',
        fromMagma,
      ),
    ).toBe('[no](../dist/collection/components/mds-table/antipattern.md#do-not)');
  });

  it("points a component's description to its shipped AGENTS.md", () => {
    expect(
      rewriteGuideLinks(
        '[usage](../../projects/stencil/src/components/mds-table/usage/1.%20Description.md)',
        fromMagma,
      ),
    ).toBe('[`mds-table/AGENTS.md`](../dist/collection/components/mds-table/AGENTS.md)');
  });

  it('leaves any other monorepo link in place, so the link check of the build reports it', () => {
    const styles = 'see [`../../projects/styles/SPEC.md`](../../projects/styles/SPEC.md)';
    const rewritten = rewriteGuideLinks(styles, fromMagma);
    const root = path.resolve('/pkg');

    expect(rewritten).toBe(styles);
    expect(
      brokenLinks(
        rewritten,
        (link) => path.resolve(root, 'agents', link),
        [root],
        () => true,
      ),
    ).toEqual(['../../projects/styles/SPEC.md']);
  });

  it('points the entry point and the per-target tracks to the files the package ships', () => {
    expect(rewriteGuideLinks('see [`SPEC.md`](SPEC.md)', fromMagma)).toBe(
      'see [`AGENTS.md`](../AGENTS.md)',
    );
    expect(
      rewriteGuideLinks(
        'the tracks ([`web-components.md`](web-components.md), [`react.md`](react.md), [`angular.md`](angular.md))',
        fromMagma,
      ),
    ).toBe('the tracks ([`install.md`](install.md))');
    expect(rewriteGuideLinks('[`angular.md`](angular.md)', fromMagma)).toBe(
      '[`install.md`](install.md)',
    );
  });
});

describe('renderComponentAgentsMd', () => {
  const md = renderComponentAgentsMd(button, '2.1.0');

  it('opens with the tag, the package version and the encapsulation', () => {
    expect(md).toContain('# mds-button');
    expect(md).toContain('`@maggioli-design-system/magma` 2.1.0. Shadow DOM');
  });

  it('inlines the description with its links rewritten', () => {
    expect(md).toContain('See [`agents/variants.md`](../../../../agents/variants.md).');
  });

  it('links the pattern file only when the component documents one', () => {
    expect(md).toContain('[`pattern.md`](pattern.md)');
    expect(md).not.toContain('antipattern.md');
  });

  it('lists the allowed values of each prop, escaped for the table', () => {
    expect(md).toContain(
      '| `tone` | `tone` | `"strong" \\| "weak"` | `\'strong\'` | The tone of the button |',
    );
  });

  it('marks required and deprecated props', () => {
    expect(md).toContain('| `label` | `label` | `string` | - | **Required**. The label |');
    expect(md).toContain('| `old` | - | `boolean` | - | **Deprecated**: use `tone`. Old prop |');
  });

  it('renders events, slots (default first), parts, CSS custom properties and dependencies', () => {
    expect(md).toContain('| `mdsButtonClick` | `MouseEvent` | Emitted on click |');
    expect(md).toContain('| (default) | Text only |');
    expect(md).toContain('| `notification` | A notification |');
    expect(md).toContain('| `icon` | The icon |');
    expect(md).toContain('| `--mds-button-radius` | Corner radius |');
    expect(md).toContain('Uses: `mds-icon`.');
  });

  it('omits the sections a component does not have', () => {
    expect(md).not.toContain('## Methods');
  });

  it('lists only the public custom properties, marks the static ones and counts the internal', () => {
    const contract = renderComponentAgentsMd(
      {
        ...button,
        styles: [
          { name: '--mds-button-radius', docs: 'Corner radius', visibility: 'public' },
          { name: '--mds-button-skin', docs: 'The skin', visibility: 'public', static: true },
          { name: '--mds-button-icon-color', docs: 'Icon colour', visibility: 'internal' },
          { name: '--mds-button-gap-inner', docs: 'Inner gap', visibility: 'internal' },
        ],
      },
      '2.1.0',
    );
    expect(contract).toContain('| `--mds-button-radius` | Corner radius |');
    expect(contract).toContain(
      '| `--mds-button-skin` | **Static**: a value of its own, not a token or a role. The skin |',
    );
    expect(contract).not.toContain('--mds-button-icon-color');
    expect(contract).toContain(
      'Only these are public. Its other 2 are internal: they may change in any release, do not set them.',
    );
  });

  it('says so when none of its custom properties is public', () => {
    const contract = renderComponentAgentsMd(
      {
        ...button,
        styles: [{ name: '--mds-button-icon-color', docs: 'Icon colour', visibility: 'internal' }],
      },
      '2.1.0',
    );
    expect(contract).toContain(
      'None is public: its custom property is internal and may change in any release. Style it with its props, its parts and the semantic roles.',
    );
    expect(contract).not.toContain('--mds-button-icon-color');
  });
});

describe('renderUsageFile', () => {
  it('titles the file, links back to the API and rewrites the links', () => {
    const md = renderUsageFile('mds-button', 'patterns', button.usage!['2. Pattern']);
    expect(md).toContain('# mds-button - patterns');
    expect(md).toContain('[`AGENTS.md`](AGENTS.md)');
    expect(md).toContain('(../../../../agents/conventions.md#slots)');
  });
});

describe('componentDocsJson', () => {
  it('drops the readme and rewrites the usage links, keeping the rest of the entry', () => {
    const entry = componentDocsJson(button);
    expect(entry.readme).toBeUndefined();
    expect(entry.props).toBe(button.props);
    expect(entry.usage!['1. Description']).toContain('(../../../../agents/variants.md)');
  });
});

describe('relativeLinks', () => {
  it('skips URLs, pure anchors and links inside fenced code', () => {
    const md = [
      '[a](a.md#x) [b](https://example.com) [c](#top) [d](mailto:x@y.z)',
      '```md',
      '[e](inside-code.md)',
      '```',
    ].join('\n');
    expect(relativeLinks(md)).toEqual(['a.md']);
  });
});

describe('brokenLinks', () => {
  const root = path.resolve('/pkg');
  const files = new Set([
    path.join(root, 'agents', 'conventions.md'),
    path.resolve('/other', 'x.md'),
  ]);
  const exists = (p: string) => files.has(p);
  const fromAgents = (link: string) => path.resolve(root, 'agents', link);

  it('accepts a link that resolves inside the package', () => {
    expect(brokenLinks('[c](conventions.md)', fromAgents, [root], exists)).toEqual([]);
  });

  it('reports a link to a missing file', () => {
    expect(brokenLinks('[m](missing.md)', fromAgents, [root], exists)).toEqual(['missing.md']);
  });

  it('reports a link that leaves the package even when the file exists', () => {
    expect(brokenLinks('[x](../../other/x.md)', fromAgents, [root], exists)).toEqual([
      '../../other/x.md',
    ]);
  });
});

describe('component categories', () => {
  const source = (jsdoc: string) => `import { Component } from '@stencil/core';
${jsdoc}
@Component({ tag: 'mds-x', shadow: true })
export class MdsX {}
`;

  it('reads the category and the parents from the JSDoc of the class', () => {
    expect(readTaxonomy('mds-x', source('/**\n * @slot - Text\n * @category forms\n */'))).toEqual({
      tag: 'mds-x',
      category: 'forms',
      parents: [],
    });
    expect(
      readTaxonomy('mds-x', source('/**\n * @parent mds-table-row mds-table-footer\n */\n')),
    ).toEqual({
      tag: 'mds-x',
      category: undefined,
      parents: ['mds-table-row', 'mds-table-footer'],
    });
  });

  it('reads nothing from a comment that is not the one of the class', () => {
    const elsewhere = `/** @category forms */\nconst a = 1;\n${source('')}`;
    expect(readTaxonomy('mds-x', elsewhere)).toEqual({
      tag: 'mds-x',
      category: undefined,
      parents: [],
    });
  });

  const table: ComponentTaxonomy[] = [
    { tag: 'mds-table', category: 'data', parents: [] },
    { tag: 'mds-table-body', parents: ['mds-table'] },
    { tag: 'mds-table-row', parents: ['mds-table-body'] },
    { tag: 'mds-table-cell', parents: ['mds-table-row', 'mds-table-footer'] },
    { tag: 'mds-table-footer', parents: ['mds-table'] },
  ];

  it('follows the first parent of each part to its component', () => {
    const byTag = new Map(table.map((c) => [c.tag, c]));
    expect(rootOf('mds-table-cell', byTag)).toBe('mds-table');
    expect(rootOf('mds-table', byTag)).toBe('mds-table');
    const loop = new Map([
      ['mds-a', { tag: 'mds-a', parents: ['mds-b'] }],
      ['mds-b', { tag: 'mds-b', parents: ['mds-a'] }],
    ]);
    expect(rootOf('mds-a', loop)).toBeUndefined();
  });

  it('accepts a component with a category or a part that reaches one', () => {
    expect(taxonomyErrors(table)).toEqual([]);
  });

  it('names every component without a valid category or parent', () => {
    expect(
      taxonomyErrors([
        { tag: 'mds-a', parents: [] },
        { tag: 'mds-b', category: 'data', parents: ['mds-c'] },
        { tag: 'mds-c', category: 'Patterns', parents: [] },
        { tag: 'mds-d', parents: ['mds-e'] },
        { tag: 'mds-f', parents: ['mds-g'] },
        { tag: 'mds-g', parents: ['mds-f'] },
      ]),
    ).toEqual([
      'mds-a: no @category and no @parent',
      'mds-b: both @category and @parent',
      `mds-c: @category Patterns is not one of ${COMPONENT_CATEGORIES.map((c) => c.id).join(', ')}`,
      'mds-d: @parent mds-e is not a component',
      'mds-d: its first @parent never reaches a component with a @category',
      'mds-f: its first @parent never reaches a component with a @category',
      'mds-g: its first @parent never reaches a component with a @category',
    ]);
  });

  it('lists the components by category, each part after its component', () => {
    const md = renderCatalogue(
      [...table, { tag: 'mds-button', category: 'actions', parents: [] }],
      new Map([
        ['mds-button', 'An action'],
        ['mds-table', 'A table'],
        ['mds-table-body', 'Its rows'],
        ['mds-table-cell', 'A cell'],
        ['mds-table-footer', 'Its totals'],
        ['mds-table-row', 'A row'],
      ]),
      '../docs',
    );
    expect(md.indexOf('## Actions')).toBeLessThan(md.indexOf('## Data'));
    expect(md).toContain('## Forms\n\nFields');
    const data = md.slice(md.indexOf('## Data'), md.indexOf('## Tags'));
    expect(data.split('\n').filter((line) => line.startsWith('| ['))).toEqual([
      '| [`mds-table`](../docs/mds-table/AGENTS.md) | A table |',
      '| [`mds-table-body`](../docs/mds-table-body/AGENTS.md), part of `mds-table` | Its rows |',
      '| [`mds-table-cell`](../docs/mds-table-cell/AGENTS.md), part of `mds-table-row` or `mds-table-footer` | A cell |',
      '| [`mds-table-footer`](../docs/mds-table-footer/AGENTS.md), part of `mds-table` | Its totals |',
      '| [`mds-table-row`](../docs/mds-table-row/AGENTS.md), part of `mds-table-body` | A row |',
    ]);
  });
});

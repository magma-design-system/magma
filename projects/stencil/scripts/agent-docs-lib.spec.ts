import path from 'path';
import { describe, expect, it } from 'vitest';
import {
  brokenLinks,
  componentDocsJson,
  relativeLinks,
  renderComponentAgentsMd,
  renderUsageFile,
  rewriteUsageLinks,
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

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  checkDiagrams,
  colourErrors,
  firstLine,
  PALETTE,
  readDiagram,
  sectionOf,
  type ProjectGraph,
} from './diagrams.ts';

const fence = (source: string) => ['```mermaid', source, '```'].join('\n');
const palette = Object.entries(PALETTE).map(([name, style]) => `  classDef ${name} ${style}`);

describe('readDiagram', () => {
  it('reads nodes, rounded boxes, subgraphs, groups, labelled arrows and classes', () => {
    const diagram = readDiagram(
      [
        'flowchart LR',
        '  subgraph tok["tokens<br/>the package"]',
        '    direction TB',
        '    A["generator<br/>Leonardo"]',
        '    B["formats"]',
        '    A --> B',
        '  end',
        '  %% a comment',
        '  B -->|"dist/css"| C["styles"]',
        '  A & B -.->|"dist/dtcg"| D(["docs site"])',
        '  C <-.->|"stdio"| D',
        '  tok ==> E',
        '  class A,B, C visual',
        '  class D outside',
        '  class tok area',
        '  classDef visual fill:#dcf5ec,stroke:#1a7f64',
      ].join('\n'),
    );
    assert.deepEqual([...diagram.subgraphs], [['tok', 'tokens<br/>the package']]);
    assert.deepEqual(
      [...diagram.nodes],
      [
        ['A', 'generator<br/>Leonardo'],
        ['B', 'formats'],
        ['C', 'styles'],
        ['D', 'docs site'],
        ['E', 'E'],
      ],
    );
    assert.deepEqual(diagram.edges, [
      ['A', 'B'],
      ['B', 'C'],
      ['A', 'D'],
      ['B', 'D'],
      ['C', 'D'],
      ['D', 'C'],
      ['tok', 'E'],
    ]);
    assert.deepEqual(
      [...diagram.classes],
      [
        ['A', ['visual']],
        ['B', ['visual']],
        ['C', ['visual']],
        ['D', ['outside']],
        ['tok', ['area']],
      ],
    );
    assert.deepEqual([...diagram.classDefs], [['visual', 'fill:#dcf5ec,stroke:#1a7f64']]);
  });

  it('fails on a line in another form, with its number', () => {
    assert.throws(
      () => readDiagram(['flowchart LR', '  A --> B', '  style A fill:#fff'].join('\n')),
      /line 3: not a form the diagrams are written in: style/,
    );
    assert.throws(() => readDiagram('sequenceDiagram\n  A->>B: hi'), /line 1: a flowchart starts/);
    assert.throws(
      () => readDiagram(['flowchart LR', '  A["one"]', '  A["two"]'].join('\n')),
      /node A has two labels/,
    );
    assert.throws(
      () => readDiagram(['flowchart LR', '  A --> B', '  A:::ai --> C'].join('\n')),
      /line 3: not a form/,
    );
    assert.throws(
      () => readDiagram(['flowchart LR', '  A --> B', '  class A,Z ai'].join('\n')),
      /line 3: class names Z, which is no node or subgraph/,
    );
  });

  it('names a project by the first line of a label', () => {
    assert.equal(firstLine('stencil<br/>build-lint.ts'), 'stencil');
    assert.equal(firstLine('stencil-react'), 'stencil-react');
  });
});

describe('sectionOf', () => {
  const markdown = [
    '# Package',
    '# Architecture',
    'the diagram',
    '```bash',
    '# not a heading',
    '```',
    '## a sub-section',
    'still in',
    '# Installation',
    'out',
  ].join('\n');

  it('runs to the next heading of the same level, skipping fenced code', () => {
    const section = sectionOf(markdown, 'Architecture');
    assert.ok(section?.includes('# not a heading'));
    assert.ok(section?.includes('still in'));
    assert.ok(!section?.includes('out'));
  });

  it('is undefined without the heading', () => {
    assert.equal(sectionOf(markdown, 'Usage'), undefined);
  });
});

describe('colourErrors', () => {
  const axisOf = new Map([['styles', 'visual']]);
  const diagram = (lines: string[], withPalette = palette) =>
    readDiagram(['flowchart LR', '  subgraph p["web"]', '    X["part"]', '  end', ...lines, ...withPalette].join('\n'));

  it('passes when every node has its axis and the palette is whole', () => {
    assert.deepEqual(
      colourErrors(diagram(['  S["styles"] --> X', '  class X components', '  class S visual', '  class p area']), axisOf),
      [],
    );
  });

  it('fails on a node without an axis, or a subgraph that is not area', () => {
    assert.deepEqual(colourErrors(diagram(['  S["styles"] --> X', '  class S visual', '  class p ai']), axisOf), [
      'node X needs one axis (ai, assets, visual, components, tooling, outside), it has none',
      'subgraph p needs the class area, it has ai',
    ]);
  });

  it('fails on a project drawn with another axis than its own', () => {
    assert.deepEqual(
      colourErrors(diagram(['  S["styles<br/>sheets"] --> X', '  class X components', '  class S ai', '  class p area']), axisOf),
      ['node S stands for styles, whose axis is visual, not ai'],
    );
  });

  it('fails on a palette that is not the one of the check', () => {
    const changed = palette.map((line) => line.replace(PALETTE.ai, 'fill:#000'));
    const missing = palette.filter((line) => !line.includes('classDef area'));
    const base = ['  class X components', '  class p area'];
    assert.deepEqual(colourErrors(diagram(base, changed), axisOf), [
      `classDef ai is not the palette's: ${PALETTE.ai}`,
    ]);
    assert.deepEqual(colourErrors(diagram(base, missing), axisOf), [
      `no classDef area (classDef area ${PALETTE.area})`,
    ]);
    assert.deepEqual(colourErrors(diagram(base, [...palette, '  classDef extra fill:#fff']), axisOf), [
      'classDef extra is no axis of the palette',
    ]);
  });
});

describe('checkDiagrams', () => {
  // tokens <- styles <- web, the shape of design-tokens, styles and stencil
  const graph: ProjectGraph = {
    nodes: {
      root: { data: { root: '.' } },
      tokens: { data: { root: 'projects/tokens', tags: ['type:lib', 'axis:visual'] } },
      styles: { data: { root: 'projects/styles', tags: ['type:lib', 'axis:visual'] } },
      web: { data: { root: 'projects/web', tags: ['type:lib', 'axis:components'] } },
    },
    dependencies: {
      root: [],
      tokens: [],
      styles: [{ target: 'tokens' }, { target: 'npm:tailwindcss' }],
      web: [{ target: 'styles' }],
    },
  };
  const readme = (title: string, lines: string[], axis = 'visual') =>
    [
      '# Package',
      '## Architecture',
      fence(
        [
          'flowchart LR',
          `  subgraph p["${title}"]`,
          '    X["part"]',
          '  end',
          ...lines,
          `  class X ${axis}`,
          '  class p area',
          ...palette,
        ].join('\n'),
      ),
      '## Usage',
    ].join('\n');
  const files: Record<string, string> = {
    'projects/tokens/README.md': readme('tokens', ['  X -->|"dist/css"| S["styles<br/>its sheets"]', '  class S visual']),
    'projects/styles/README.md': readme('styles', ['  T["tokens"] --> X', '  X --> W["web"]', '  class T visual', '  class W components']),
    'projects/web/README.md': readme(
      'web',
      ['  S["styles"] --> X', '  X -.-> APP(["consumer app"])', '  class S visual', '  class APP outside'],
      'components',
    ),
    'docs/ARCHITECTURE.md': [
      '## 1. System Overview',
      fence(
        [
          'graph TD',
          '  T["tokens<br/>@scope/tokens"]',
          '  S["styles"]',
          '  W["web"]',
          '  T --> S',
          '  S --> W',
          '  class T,S visual',
          '  class W components',
          ...palette,
        ].join('\n'),
      ),
      '## 2. Sub-projects',
    ].join('\n'),
  };
  const check = (changes: Record<string, string | undefined> = {}, on = graph) =>
    checkDiagrams(on, (file) => (file in changes ? changes[file] : files[file]));

  it('passes when every diagram matches the graph', () => {
    assert.deepEqual(check(), []);
  });

  it('fails on a project without a diagram', () => {
    assert.deepEqual(check({ 'projects/web/README.md': undefined }), ['projects/web/README.md: missing']);
    assert.deepEqual(check({ 'projects/web/README.md': '# web\n\nNo diagram.' }), [
      'projects/web/README.md: no section "Architecture"',
    ]);
  });

  it('fails on a diagram that does not draw a linked project, or the project itself', () => {
    assert.deepEqual(check({ 'projects/styles/README.md': readme('styles', ['  T["tokens"] --> X', '  class T visual']) }), [
      'projects/styles/README.md: no node for web, which depends on styles',
    ]);
    assert.deepEqual(
      check({ 'projects/web/README.md': readme('web app', ['  S["styles"] --> X', '  class S visual'], 'components') }),
      ['projects/web/README.md: no subgraph titled "web" holds the parts of the project'],
    );
  });

  it('fails on a diagram it cannot read', () => {
    const errors = check({ 'projects/web/README.md': readme('web', ['  S["styles"] --> X', '  style X fill:#f00']) });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /projects\/web\/README.md: the diagram of "Architecture", line 6: not a form/);
  });

  it('fails on a node drawn in the colour of another axis, in a README and in the overview', () => {
    assert.deepEqual(check({ 'projects/web/README.md': readme('web', ['  S["styles"] --> X', '  class S tooling'], 'components') }), [
      'projects/web/README.md: node S stands for styles, whose axis is visual, not tooling',
    ]);
    const overview = files['docs/ARCHITECTURE.md'].replace('class W components', 'class W ai');
    assert.deepEqual(check({ 'docs/ARCHITECTURE.md': overview }), [
      'docs/ARCHITECTURE.md: node W stands for web, whose axis is components, not ai',
    ]);
  });

  it('fails on a project that declares no axis', () => {
    const untagged: ProjectGraph = {
      ...graph,
      nodes: { ...graph.nodes, web: { data: { root: 'projects/web', tags: ['type:lib'] } } },
    };
    assert.deepEqual(check({}, untagged), [
      'projects/web/project.json: web needs one tag axis:<ai|assets|visual|components|tooling|outside>, it has none',
    ]);
  });

  it('holds the overview to the arrows of the graph, both ways', () => {
    const overview = (lines: string[]) =>
      [
        '## 1. System Overview',
        fence(
          [
            'graph TD',
            '  T["tokens"]',
            '  S["styles"]',
            '  W["web"]',
            ...lines,
            '  class T,S visual',
            '  class W components',
            ...palette,
          ].join('\n'),
        ),
      ].join('\n');
    assert.deepEqual(check({ 'docs/ARCHITECTURE.md': overview(['  T --> S']) }), [
      'docs/ARCHITECTURE.md: the overview misses the arrow styles --> web',
    ]);
    assert.deepEqual(check({ 'docs/ARCHITECTURE.md': overview(['  T --> S', '  S --> W', '  T --> W']) }), [
      'docs/ARCHITECTURE.md: the overview draws tokens --> web, not in the project graph',
    ]);
    assert.deepEqual(
      check({ 'docs/ARCHITECTURE.md': overview(['  T --> S', '  S --> W', '  X["lint"]', '  class X ai']) }),
      ['docs/ARCHITECTURE.md: the overview draws "lint", not a project'],
    );
  });
});

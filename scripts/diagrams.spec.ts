import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkDiagrams, firstLine, readDiagram, sectionOf, type ProjectGraph } from './diagrams.ts';

const fence = (source: string) => ['```mermaid', source, '```'].join('\n');

describe('readDiagram', () => {
  it('reads nodes, rounded boxes, subgraphs, groups and labelled arrows', () => {
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
      ].join('\n'),
    );
    assert.deepEqual([...diagram.subgraphs], [['tok', 'tokens<br/>the package']]);
    assert.deepEqual([...diagram.nodes], [
      ['A', 'generator<br/>Leonardo'],
      ['B', 'formats'],
      ['C', 'styles'],
      ['D', 'docs site'],
      ['E', 'E'],
    ]);
    assert.deepEqual(diagram.edges, [
      ['A', 'B'],
      ['B', 'C'],
      ['A', 'D'],
      ['B', 'D'],
      ['C', 'D'],
      ['D', 'C'],
      ['tok', 'E'],
    ]);
  });

  it('fails on a line in another form, with its number', () => {
    assert.throws(
      () => readDiagram(['flowchart LR', '  A --> B', '  classDef x fill:#fff'].join('\n')),
      /line 3: not a form the diagrams are written in: classDef/,
    );
    assert.throws(() => readDiagram('sequenceDiagram\n  A->>B: hi'), /line 1: a flowchart starts/);
    assert.throws(
      () => readDiagram(['flowchart LR', '  A["one"]', '  A["two"]'].join('\n')),
      /node A has two labels/,
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

describe('checkDiagrams', () => {
  // tokens <- styles <- web, the shape of design-tokens, styles and stencil
  const graph: ProjectGraph = {
    nodes: {
      root: { data: { root: '.' } },
      tokens: { data: { root: 'projects/tokens' } },
      styles: { data: { root: 'projects/styles' } },
      web: { data: { root: 'projects/web' } },
    },
    dependencies: {
      root: [],
      tokens: [],
      styles: [{ target: 'tokens' }, { target: 'npm:tailwindcss' }],
      web: [{ target: 'styles' }],
    },
  };
  const readme = (title: string, lines: string[]) =>
    ['# Package', '## Architecture', fence(['flowchart LR', `  subgraph p["${title}"]`, '    X["part"]', '  end', ...lines].join('\n')), '## Usage'].join('\n');
  const files: Record<string, string> = {
    'projects/tokens/README.md': readme('tokens', ['  X -->|"dist/css"| S["styles<br/>its sheets"]']),
    'projects/styles/README.md': readme('styles', ['  T["tokens"] --> X', '  X --> W["web"]']),
    'projects/web/README.md': readme('web', ['  S["styles"] --> X', '  X -.-> APP(["consumer app"])']),
    'docs/ARCHITECTURE.md': [
      '## 1. System Overview',
      fence(['graph TD', '  T["tokens<br/>@scope/tokens"]', '  S["styles"]', '  W["web"]', '  T --> S', '  S --> W'].join('\n')),
      '## 2. Sub-projects',
    ].join('\n'),
  };
  const check = (changes: Record<string, string | undefined> = {}) =>
    checkDiagrams(graph, (file) => (file in changes ? changes[file] : files[file]));

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
    assert.deepEqual(check({ 'projects/styles/README.md': readme('styles', ['  T["tokens"] --> X']) }), [
      'projects/styles/README.md: no node for web, which depends on styles',
    ]);
    assert.deepEqual(
      check({ 'projects/web/README.md': readme('web app', ['  S["styles"] --> X']) }),
      ['projects/web/README.md: no subgraph titled "web" holds the parts of the project'],
    );
  });

  it('fails on a diagram it cannot read', () => {
    const errors = check({ 'projects/web/README.md': readme('web', ['  S["styles"] --> X', '  style X fill:#f00']) });
    assert.equal(errors.length, 1);
    assert.match(errors[0], /projects\/web\/README.md: the diagram of "Architecture", line 6: not a form/);
  });

  it('holds the overview to the arrows of the graph, both ways', () => {
    const overview = (lines: string[]) =>
      ['## 1. System Overview', fence(['graph TD', '  T["tokens"]', '  S["styles"]', '  W["web"]', ...lines].join('\n'))].join('\n');
    assert.deepEqual(check({ 'docs/ARCHITECTURE.md': overview(['  T --> S']) }), [
      'docs/ARCHITECTURE.md: the overview misses the arrow styles --> web',
    ]);
    assert.deepEqual(check({ 'docs/ARCHITECTURE.md': overview(['  T --> S', '  S --> W', '  T --> W']) }), [
      'docs/ARCHITECTURE.md: the overview draws tokens --> web, not in the project graph',
    ]);
    assert.deepEqual(check({ 'docs/ARCHITECTURE.md': overview(['  T --> S', '  S --> W', '  X["lint"]']) }), [
      'docs/ARCHITECTURE.md: the overview draws "lint", not a project',
    ]);
  });
});

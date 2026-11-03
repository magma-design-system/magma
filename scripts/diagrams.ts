/*
  The architecture diagrams of the READMEs, held to the project graph of Nx (#1227).

  Each project draws its parts, and what it reads from and gives to the other projects, in the
  Architecture section of its README; docs/ARCHITECTURE.md draws every project in its section 1,
  with the convention ("Diagrams of the projects"). Which projects a diagram must show is read
  from the graph Nx computes (`nx graph --file`), the one the build order follows, never from a
  list kept here:

  - every project but the root one has an Architecture section in the README at its root, with
    one Mermaid flowchart, and a subgraph whose title is the name of the project holds its parts;
  - a node stands for a project when the first line of its label is the name of the project, and
    every project the graph links to this one, either way, has such a node;
  - the overview of docs/ARCHITECTURE.md has a node for every project, an arrow from each
    dependency to its dependent, and no other arrow between projects.

  What a project reads at runtime where it is installed (the lint reading the DTCG of
  design-tokens in a consumer project) is not in the graph: the rule of AGENTS.md keeps those
  arrows, not this check.

  The colour of a box is its axis (`AXES`), so the diagrams read alike:

  - every diagram writes the whole `PALETTE`, as it is here, after its nodes and arrows;
  - every node has one axis, given by a `class` line, and the subgraph of the project is `area`;
  - a project declares its axis as the Nx tag `axis:<name>` in its project.json, and the node
    that stands for it takes that axis in every diagram.

  The diagrams are read in the forms they are written in (`readDiagram`); a line in any other
  form fails with its number instead of being skipped, so the check never passes on a part of a
  diagram it did not read.

    tsx scripts/diagrams.ts       fail when a diagram does not match the project graph
*/
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Diagram {
  /** The label of each node, by id; a node written without a label is labelled by its id, as in Mermaid. */
  nodes: Map<string, string>;
  /** The title of each subgraph, by id. */
  subgraphs: Map<string, string>;
  /** Each arrow, from its source to its target; a two-way arrow is two. */
  edges: Array<[string, string]>;
  /** The classes of each node or subgraph, by id, from its `class` lines. */
  classes: Map<string, string[]>;
  /** The style of each class, from its `classDef` line. */
  classDefs: Map<string, string>;
}

/** The part of the graph of `nx graph --file` the check reads. */
export interface ProjectGraph {
  nodes: Record<string, { data: { root: string; tags?: string[] } }>;
  dependencies: Record<string, Array<{ target: string }>>;
}

/** The section of docs/ARCHITECTURE.md that holds the overview. */
export const OVERVIEW = { file: 'docs/ARCHITECTURE.md', section: '1. System Overview' };

/**
 * The axes a box belongs to: what serves agents, the icons and the brand, the tokens and the CSS,
 * the components, the checks and the migration, and what has no axis (an app, a site).
 */
export const AXES = ['ai', 'assets', 'visual', 'components', 'tooling', 'outside'] as const;

/**
 * The styles of the axes and of the subgraph of a project (`area`). A light fill with dark text
 * and a strong stroke reads the same on the light and the dark themes of GitHub, which colour
 * the arrows and the background but keep the styles a class sets.
 */
export const PALETTE: Record<(typeof AXES)[number] | 'area', string> = {
  ai: 'fill:#efe5ff,stroke:#8250df,color:#3e1f79',
  assets: 'fill:#fff1d6,stroke:#bf8700,color:#5c3d00',
  visual: 'fill:#dcf5ec,stroke:#1a7f64,color:#0b4a3a',
  components: 'fill:#ddf0ff,stroke:#0969da,color:#0a3069',
  tooling: 'fill:#eceff3,stroke:#57606a,color:#24292f',
  outside: 'fill:#ffffff,stroke:#8c959f,color:#24292f',
  area: 'fill:none,stroke:#8c959f',
};

const DIRECTION = '(?:LR|RL|TB|TD|BT)';
const ID = '[A-Za-z][A-Za-z0-9_]*';
// The shapes the diagrams use, as Mermaid writes them: a rectangle ["..."] for this repository,
// a rounded box (["..."]) for what is outside it.
const REF = new RegExp(String.raw`\s*(${ID})(?:\(\["([^"]*)"\]\)|\["([^"]*)"\])?`, 'y');
const AND = /\s*&/y;
// A solid, dashed or thick arrow, one-way or two-way, with an optional label: -->|"label"|.
const ARROW = /\s*(<-\.->|-\.->|<-->|-->|==>)(?:\|"[^"]*"\||\|[^|"]*\|)?/y;

/** The first line of a label: what names the project a node stands for. */
export const firstLine = (label: string): string => label.split(/<br\s*\/?>/)[0].trim();

type Ref = { id: string; label?: string };

/** A run of nodes joined by `&`, from `at`; undefined when no node starts there. */
const readGroup = (line: string, at: number): { refs: Ref[]; at: number } | undefined => {
  const refs: Ref[] = [];
  for (;;) {
    REF.lastIndex = at;
    const ref = REF.exec(line);
    if (!ref) return undefined;
    refs.push({ id: ref[1], label: ref[2] ?? ref[3] });
    at = REF.lastIndex;
    AND.lastIndex = at;
    if (!AND.exec(line)) return { refs, at };
    at = AND.lastIndex;
  }
};

/** A node, or nodes joined by arrows: the groups and the arrow between each two. */
const readStatement = (line: string): { groups: Ref[][]; arrows: string[] } | undefined => {
  const first = readGroup(line, 0);
  if (!first) return undefined;
  const groups = [first.refs];
  const arrows: string[] = [];
  let at = first.at;
  for (;;) {
    ARROW.lastIndex = at;
    const arrow = ARROW.exec(line);
    if (!arrow) break;
    const next = readGroup(line, ARROW.lastIndex);
    if (!next) return undefined;
    arrows.push(arrow[1]);
    groups.push(next.refs);
    at = next.at;
  }
  return line.slice(at).trim() ? undefined : { groups, arrows };
};

/**
 * The nodes, subgraphs, arrows and classes of a Mermaid flowchart. Throws on a line it cannot
 * read: the header (`flowchart LR`, `graph TD`), `subgraph id["title"]`, `end`, `direction TB`,
 * `%%` comments, nodes or arrows in the shapes above, `class a,b name` and `classDef name style`
 * are the forms the diagrams are written in.
 */
export const readDiagram = (source: string): Diagram => {
  const nodes = new Map<string, string>();
  const subgraphs = new Map<string, string>();
  const edges: Array<[string, string]> = [];
  const classes = new Map<string, string[]>();
  const classDefs = new Map<string, string>();
  const unlabelled = new Set<string>();
  const classed: Array<{ id: string; line: number }> = [];
  const lines = source.split('\n');
  let header = false;
  lines.forEach((raw, index) => {
    const line = raw.trim();
    const fail = (why: string) => {
      throw new Error(`line ${index + 1}: ${why}: ${line}`);
    };
    if (!line || line.startsWith('%%')) return;
    if (!header) {
      if (!new RegExp(`^(?:flowchart|graph) ${DIRECTION}$`).test(line))
        fail('a flowchart starts with flowchart or graph and a direction');
      header = true;
      return;
    }
    if (line === 'end' || new RegExp(`^direction ${DIRECTION}$`).test(line)) return;
    const subgraph = new RegExp(`^subgraph (${ID})\\["([^"]*)"\\]$`).exec(line);
    if (subgraph) {
      subgraphs.set(subgraph[1], subgraph[2]);
      return;
    }
    const classDef = new RegExp(`^classDef (${ID}) (\\S+)$`).exec(line);
    if (classDef) {
      if (classDefs.has(classDef[1])) fail(`class ${classDef[1]} is defined twice`);
      classDefs.set(classDef[1], classDef[2]);
      return;
    }
    const classLine = new RegExp(`^class (${ID}(?:\\s*,\\s*${ID})*) (${ID})$`).exec(line);
    if (classLine) {
      for (const id of classLine[1].split(/\s*,\s*/)) {
        classes.set(id, [...(classes.get(id) ?? []), classLine[2]]);
        classed.push({ id, line: index + 1 });
      }
      return;
    }
    const statement = readStatement(line);
    if (!statement) fail('not a form the diagrams are written in');
    for (const ref of statement!.groups.flat()) {
      if (ref.label === undefined) unlabelled.add(ref.id);
      else if (nodes.has(ref.id) && nodes.get(ref.id) !== ref.label)
        fail(`node ${ref.id} has two labels`);
      else nodes.set(ref.id, ref.label);
    }
    statement!.arrows.forEach((arrow, at) => {
      for (const from of statement!.groups[at])
        for (const to of statement!.groups[at + 1]) {
          edges.push([from.id, to.id]);
          if (arrow.startsWith('<')) edges.push([to.id, from.id]);
        }
    });
  });
  if (!header) throw new Error('no flowchart');
  // an id written only bare is a node labelled by its id, unless it is a subgraph
  for (const id of unlabelled) if (!nodes.has(id) && !subgraphs.has(id)) nodes.set(id, id);
  for (const { id, line } of classed)
    if (!nodes.has(id) && !subgraphs.has(id))
      throw new Error(`line ${line}: class names ${id}, which is no node or subgraph`);
  return { nodes, subgraphs, edges, classes, classDefs };
};

/** What is wrong with the colours of a diagram, given the axis of each project it draws. */
export const colourErrors = (diagram: Diagram, axisOf: Map<string, string>): string[] => {
  const errors: string[] = [];
  for (const [name, style] of Object.entries(PALETTE)) {
    const written = diagram.classDefs.get(name);
    if (written === undefined) errors.push(`no classDef ${name} (classDef ${name} ${style})`);
    else if (written !== style) errors.push(`classDef ${name} is not the palette's: ${style}`);
  }
  for (const name of diagram.classDefs.keys())
    if (!(name in PALETTE)) errors.push(`classDef ${name} is no axis of the palette`);
  for (const [id, label] of diagram.nodes) {
    const axes = diagram.classes.get(id) ?? [];
    const axis = axes[0];
    if (axes.length !== 1 || !(AXES as readonly string[]).includes(axis))
      errors.push(`node ${id} needs one axis (${AXES.join(', ')}), it has ${axes.join(', ') || 'none'}`);
    else if (axisOf.has(firstLine(label)) && axisOf.get(firstLine(label)) !== axis)
      errors.push(`node ${id} stands for ${firstLine(label)}, whose axis is ${axisOf.get(firstLine(label))}, not ${axis}`);
  }
  for (const id of diagram.subgraphs.keys()) {
    const axes = diagram.classes.get(id) ?? [];
    if (axes.length !== 1 || axes[0] !== 'area')
      errors.push(`subgraph ${id} needs the class area, it has ${axes.join(', ') || 'none'}`);
  }
  return errors;
};

/**
 * The lines under the first heading whose text is `title`, down to the next heading of the same
 * level or above; undefined without such a heading. Lines inside fenced code are not headings.
 */
export const sectionOf = (markdown: string, title: string): string | undefined => {
  const lines = markdown.split('\n');
  let fence = false;
  let level = 0;
  const section: string[] = [];
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const heading = fence ? null : /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (level) {
      if (heading && heading[1].length <= level) break;
      section.push(line);
    } else if (heading && heading[2] === title) level = heading[1].length;
  }
  return level ? section.join('\n') : undefined;
};

/** The Mermaid blocks of a piece of Markdown, without their fences. */
export const mermaidBlocks = (markdown: string): string[] =>
  [...markdown.matchAll(/^\s*```mermaid\s*\n([\s\S]*?)^\s*```\s*$/gm)].map((block) => block[1]);

/** The project each node stands for, by id: nodes whose first line is not a project are left out. */
const projectNodes = (diagram: Diagram, projects: string[]): Map<string, string> =>
  new Map([...diagram.nodes].filter(([, label]) => projects.includes(firstLine(label))).map(
    ([id, label]) => [id, firstLine(label)],
  ));

/** What the check finds wrong in the diagrams, given the graph and a reader of the repository. */
export const checkDiagrams = (
  graph: ProjectGraph,
  read: (file: string) => string | undefined,
): string[] => {
  const errors: string[] = [];
  // the root project holds the workspace targets, not a package: it has no diagram
  const projects = Object.keys(graph.nodes)
    .filter((name) => graph.nodes[name].data.root !== '.')
    .sort();
  // every link of the graph, as "dependency>dependent", whatever made Nx draw it
  const links = new Set<string>();
  for (const [dependent, dependencies] of Object.entries(graph.dependencies))
    for (const { target } of dependencies)
      if (projects.includes(dependent) && projects.includes(target) && target !== dependent)
        links.add(`${target}>${dependent}`);
  // the axis each project declares, as the Nx tag axis:<name>
  const axisOf = new Map<string, string>();
  for (const project of projects) {
    const tags = (graph.nodes[project].data.tags ?? []).filter((tag) => tag.startsWith('axis:'));
    const axis = tags[0]?.slice('axis:'.length);
    if (tags.length !== 1 || !(AXES as readonly string[]).includes(axis!))
      errors.push(
        `${graph.nodes[project].data.root}/project.json: ${project} needs one tag axis:<${AXES.join('|')}>, it has ${tags.join(', ') || 'none'}`,
      );
    else axisOf.set(project, axis!);
  }

  /** The one diagram of a section, or undefined after recording why there is none. */
  const diagramOf = (file: string, title: string): Diagram | undefined => {
    const markdown = read(file);
    if (markdown === undefined) return void errors.push(`${file}: missing`);
    const section = sectionOf(markdown, title);
    if (section === undefined) return void errors.push(`${file}: no section "${title}"`);
    const blocks = mermaidBlocks(section);
    if (blocks.length !== 1)
      return void errors.push(`${file}: "${title}" holds ${blocks.length} Mermaid blocks, not 1`);
    let diagram: Diagram;
    try {
      diagram = readDiagram(blocks[0]);
    } catch (error) {
      return void errors.push(`${file}: the diagram of "${title}", ${(error as Error).message}`);
    }
    for (const error of colourErrors(diagram, axisOf)) errors.push(`${file}: ${error}`);
    return diagram;
  };

  for (const project of projects) {
    const file = path.posix.join(graph.nodes[project].data.root, 'README.md');
    const diagram = diagramOf(file, 'Architecture');
    if (!diagram) continue;
    if (![...diagram.subgraphs.values()].some((title) => firstLine(title) === project))
      errors.push(`${file}: no subgraph titled "${project}" holds the parts of the project`);
    const drawn = new Set(projectNodes(diagram, projects).values());
    for (const link of links) {
      const [dependency, dependent] = link.split('>');
      if (dependent === project && !drawn.has(dependency))
        errors.push(`${file}: no node for ${dependency}, which ${project} depends on`);
      if (dependency === project && !drawn.has(dependent))
        errors.push(`${file}: no node for ${dependent}, which depends on ${project}`);
    }
  }

  const overview = diagramOf(OVERVIEW.file, OVERVIEW.section);
  if (overview) {
    const nodes = projectNodes(overview, projects);
    for (const [id, label] of overview.nodes)
      if (!nodes.has(id))
        errors.push(`${OVERVIEW.file}: the overview draws "${firstLine(label)}", not a project`);
    const drawn = new Set(nodes.values());
    for (const project of projects)
      if (!drawn.has(project)) errors.push(`${OVERVIEW.file}: the overview misses ${project}`);
    const arrows = new Set(
      overview.edges
        .filter(([from, to]) => nodes.has(from) && nodes.has(to))
        .map(([from, to]) => `${nodes.get(from)}>${nodes.get(to)}`),
    );
    for (const link of links)
      if (!arrows.has(link))
        errors.push(`${OVERVIEW.file}: the overview misses the arrow ${link.replace('>', ' --> ')}`);
    for (const arrow of arrows)
      if (!links.has(arrow))
        errors.push(
          `${OVERVIEW.file}: the overview draws ${arrow.replace('>', ' --> ')}, not in the project graph`,
        );
  }
  return errors;
};

const main = () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const folder = mkdtempSync(path.join(tmpdir(), 'magma-graph-'));
  const file = path.join(folder, 'graph.json');
  try {
    execFileSync('npx', ['nx', 'graph', `--file=${file}`], { cwd: root, stdio: 'ignore' });
    const { graph } = JSON.parse(readFileSync(file, 'utf8')) as { graph: ProjectGraph };
    const errors = checkDiagrams(graph, (name) => {
      const at = path.join(root, name);
      return existsSync(at) ? readFileSync(at, 'utf8') : undefined;
    });
    if (errors.length) {
      console.error(errors.map((error) => `  ${error}`).join('\n'));
      process.exitCode = 1;
      return;
    }
    console.info('OK - the diagrams of the READMEs and the overview match the project graph');
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
};

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();

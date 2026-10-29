/*
  get_pattern: the patterns Magma ships (agents/patterns/<id>.md, #1174), the solution to a
  task that spans components: where a message goes, when to ask before acting, an empty, a
  waiting or a failed part. Without arguments the list, as get_guide lists the guides; with a
  need the patterns that answer it; with a pattern its data; with the values of its variables
  the one case for the situation. A product layer in the project (magma/patterns/<id>.md)
  narrows the open choices and adds situations; it never changes an "Always true" rule. A case
  Magma has a preview of (agents/patterns/previews/<id>/<case>.html, #1186) names it: the path
  in the pattern, the stage itself and what to try in it in the answer for a situation.
*/
import path from 'node:path';
import { loadComponents, magmaRoot } from '../core/data.js';
import {
  MAGMA_LAYER,
  answer,
  extendedId,
  indexPatterns,
  isLayer,
  listPatterns,
  previewOf,
  projectErrors,
  readPatternDir,
  readPreviews,
  readProjectDir,
  resolveLayer,
  splitBody,
  type Layer,
  type Pattern,
  type PatternFile,
  type Preview,
} from '../core/patterns.js';
import { ToolError, type Tool } from './protocol.js';
import { GAP, GAP_SCHEMA, wordsOf, type ToolContext } from './context.js';

/** Where a product keeps its layer, in its own repository (#1174, "The code: the plan"). */
export const PRODUCT_LAYER_DIR = 'magma/patterns';

interface Read {
  patterns: PatternFile[];
  /** The layer files of the project, by the Magma id they extend: the first file by name. */
  layers: Map<string, PatternFile<Layer>>;
  /** The product's own patterns, but for one under an id Magma has. */
  own: PatternFile[];
  /** What is wrong in the project's folder, by file, a file that does not parse among them. */
  problems: Map<string, string[]>;
  /** The previews of the cases Magma ships. */
  previews: Preview[];
}

const read = (context: ToolContext): Read => {
  const shipped = path.join(magmaRoot(context.settings), 'agents', 'patterns');
  const patterns = readPatternDir(shipped);
  const { byId, aliases } = indexPatterns(patterns.map((one) => one.data));
  const { files, unreadable } = readProjectDir(path.join(context.root, PRODUCT_LAYER_DIR));
  const layers = new Map<string, PatternFile<Layer>>();
  const own: PatternFile[] = [];
  for (const file of files) {
    if (isLayer(file.data)) {
      const id = extendedId(file.data) ?? file.data.id;
      if (!layers.has(id)) layers.set(id, file as PatternFile<Layer>);
    } else if (!byId.has(file.data.id) && !aliases.has(file.data.id)) own.push(file as PatternFile);
  }
  const problems = files.length
    ? projectErrors(
        files,
        patterns.map((one) => one.data),
        loadComponents(context.settings),
      )
    : new Map<string, string[]>();
  for (const [file, error] of unreadable) problems.set(file, [error]);
  return { patterns, layers, own, problems, previews: readPreviews(shipped) };
};

/** A preview as the answer for a situation gives it: where it is, what to try, the stage. */
const previewIn = (context: ToolContext, preview: Preview) => ({
  file: path.relative(context.root, preview.file),
  try: preview.try,
  ...(preview.height ? { height: preview.height } : {}),
  markup: preview.markup,
});

/** The problems of the project's files, each with the file it is in. */
const problemsIn = (context: ToolContext, problems: Map<string, string[]>, files: string[]) => {
  const found = files.flatMap((file) =>
    (problems.get(file) ?? []).map((one) => `${path.relative(context.root, file)}: ${one}`),
  );
  return found.length ? { layerErrors: found } : {};
};

/** The words of a pattern a need is matched against, by weight. */
const scoreOf = (pattern: Pattern, words: string[]): number => {
  const of = (text: unknown) => new Set(wordsOf([text].flat().join(' ')));
  const keywords = of(pattern.keywords ?? []);
  const title = of(pattern.title);
  const rest = of([pattern.need, ...(pattern.situations ?? []).map((one) => one.situation)]);
  return words.reduce(
    (score, word) =>
      score + (keywords.has(word) ? 3 : 0) + (title.has(word) ? 2 : 0) + (rest.has(word) ? 1 : 0),
    0,
  );
};

/** What a candidate answers: Magma knows the need, no default covers it yet. */
export const CANDIDATE =
  'A candidate: Magma knows this need and has no default for it yet. Do not present a choice of yours as the Magma default: tell the user which choice you made and why. ' +
  GAP;

const string = { type: 'string' };
const strings = { type: 'array', items: string };
const object = { type: 'object' };

export const getPattern = (context: ToolContext): Tool => ({
  name: 'get_pattern',
  title: 'Read a Magma pattern',
  description:
    'The patterns Magma ships: the solution to a task across components (where a message goes, confirming an action, an empty, a loading or a failed part), the same in every product. Without arguments the list, and in layerErrors what is wrong in the layer this project keeps in magma/patterns/; with need the patterns for it; with id the pattern (its variables, cases, always-true rules and open choices, with the layer of this project applied); with id and situation, the values of its variables you know, the one case to follow (with its preview when Magma has one: the stage, as markup, and what to try in it), or which variables are still to settle; with id and section the text of that section. Ask before building a flow, and follow the case it gives.',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'A pattern, such as "message-placement".' },
      need: {
        type: 'string',
        description: 'The task in words, such as "tell the user a save failed".',
      },
      situation: {
        type: 'object',
        description:
          'With id: the values of the variables of the pattern you know, such as {"about": "action", "outcome": "failure"}.',
        additionalProperties: { type: 'string' },
      },
      section: {
        type: 'string',
        description: 'With id: a section of the pattern, such as "Behaviour over time".',
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      patterns: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: string,
            title: string,
            group: string,
            kind: string,
            status: string,
            layer: string,
            need: string,
            validatedOn: strings,
          },
          required: ['id', 'title', 'group', 'status', 'need'],
        },
      },
      pattern: object,
      id: string,
      renamedFrom: string,
      layerErrors: strings,
      answer: object,
      candidates: { type: 'array', items: object },
      missing: {
        type: 'array',
        items: {
          type: 'object',
          properties: { variable: string, values: strings, means: string },
          required: ['variable', 'values'],
        },
      },
      section: string,
      text: string,
      gap: GAP_SCHEMA,
    },
  },
  run: ({ id, need, situation, section }) => {
    const { patterns, layers, own, problems, previews } = read(context);
    if (!patterns.length)
      throw new ToolError('This magma ships no patterns (agents/patterns/): update it.');
    const all = [...patterns, ...own].map((one) => one.data);

    if (typeof id !== 'string' || !id.trim()) {
      if (typeof need === 'string' && need.trim()) {
        const words = wordsOf(need);
        const found = all
          .map((one) => ({ one, score: scoreOf(one, words) }))
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score || a.one.id.localeCompare(b.one.id))
          .slice(0, 5)
          .map(({ one }) => one);
        const listed = listPatterns(found).sort(
          (a, b) =>
            found.findIndex((one) => one.id === a.id) - found.findIndex((one) => one.id === b.id),
        );
        return {
          patterns: listed,
          ...(found.some((one) => one.status !== 'candidate') ? {} : { gap: GAP }),
        };
      }
      return {
        patterns: listPatterns(all),
        ...problemsIn(context, problems, [...problems.keys()].sort()),
      };
    }

    const { byId, aliases } = indexPatterns(all);
    const wanted = id.trim();
    const realId = byId.has(wanted) ? wanted : aliases.get(wanted);
    const file = [...patterns, ...own].find((one) => one.data.id === realId);
    if (!realId || !file)
      throw new ToolError(
        `No pattern ${wanted}: the patterns are ${all.map((one) => one.id).join(', ')}. Search them with need.`,
      );
    const renamed = realId !== wanted ? { renamedFrom: wanted } : {};
    const base = file.data;
    if (base.status === 'candidate')
      return {
        pattern: {
          id: base.id,
          title: base.title,
          group: base.group,
          status: base.status,
          need: base.need,
        },
        ...renamed,
        gap: CANDIDATE,
      };

    // the layer of this project, applied only when it holds to the rules of a layer; without
    // one, the file named after the pattern may be a layer that does not parse
    const layerFile = base.layer === MAGMA_LAYER ? layers.get(base.id) : undefined;
    const projectFile =
      base.layer === MAGMA_LAYER
        ? (layerFile?.file ?? path.join(context.root, PRODUCT_LAYER_DIR, `${base.id}.md`))
        : file.file;
    const resolved = resolveLayer(
      base,
      layerFile && !problems.has(layerFile.file) ? layerFile.data : undefined,
    );
    const mine = problemsIn(context, problems, [projectFile]);

    if (typeof section === 'string' && section.trim()) {
      const { sections } = splitBody(file.body);
      const lower = section.trim().toLowerCase();
      const found =
        sections.find((one) => one.heading.toLowerCase() === lower) ??
        sections.find((one) => one.heading.toLowerCase().includes(lower));
      if (!found)
        throw new ToolError(
          `No section "${section}" in ${base.id}: its sections are ${sections.map((one) => one.heading).join('; ')}.`,
        );
      return { id: base.id, ...renamed, section: found.heading, text: found.text.trim() };
    }

    if (situation && typeof situation === 'object' && !Array.isArray(situation)) {
      let result;
      try {
        result = answer(
          base,
          Object.fromEntries(
            Object.entries(situation).map(([name, value]) => [name, String(value)]),
          ),
        );
      } catch (error) {
        throw new ToolError((error as Error).message);
      }
      const variables = base.variables ?? {};
      const missing = result.missing.map((name) => ({
        variable: name,
        values: variables[name]!.values,
        means: variables[name]!.means,
      }));
      const hits = result.hits.map(({ kind, entry }) => ({ kind, ...entry }));
      if (hits.length === 1 && !missing.length) {
        const [hit] = hits;
        const preview =
          hit!.kind === 'case'
            ? previewOf(previews, base.id, String((hit as { id?: unknown }).id))
            : undefined;
        return {
          id: base.id,
          ...renamed,
          ...mine,
          answer: preview ? { ...hit, preview: previewIn(context, preview) } : hit,
          ...(hit!.kind === 'gap' ? { gap: GAP } : {}),
        };
      }
      return { id: base.id, ...renamed, ...mine, candidates: hits, missing };
    }

    const { sections } = splitBody(file.body);
    const cases = resolved.cases?.map((one) => {
      const preview = previewOf(previews, base.id, one.id);
      return preview ? { ...one, preview: path.relative(context.root, preview.file) } : one;
    });
    return {
      pattern: {
        ...resolved,
        ...(cases ? { cases } : {}),
        sections: sections.map((one) => one.heading),
      },
      ...renamed,
      ...mine,
    };
  },
});

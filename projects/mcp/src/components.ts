/*
  The component tools: find the one that fits a need, read its API, and write it in HTML,
  React or Angular. Everything comes from the documentation.json of the installed magma; the
  rules of the design language that govern a component, from the domains it ships in
  agents/patterns/ (#1198). The need and the place of a component (epic #1579, pilot #1580) are
  its usage files `4. When to use.md` and `5. Placement context.md`, in the format of
  projects/stencil/SPEC.md ("Per-component usage docs"), read from documentation.json by the
  parser of the lint core (core/usage.ts), the one the build and check.usage-docs read them with.
*/
import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  answersOf,
  citationsOf,
  magmaRoot,
  parsePlacement,
  parseWhenToUse,
  placesOfComponent,
  PLACEMENT_HEADINGS,
  propInfo,
  readData,
  resolveCitation,
  tagOf,
  readPatternDir,
  rulesOfComponent,
  type Pattern,
  type UsageLine,
} from '@maggioli-design-system/magma/lint';
import { ToolError, type Tool } from './protocol.js';
import { firstSentence, GAP, GAP_SCHEMA, pascalOf, wordsOf, type ToolContext } from './context.js';
import { patternsDir, RULE_SCHEMA } from './patterns.js';

interface DocsComponent {
  tag: string;
  docs: string;
  usage: Record<string, string>;
  props: Array<{
    name: string;
    attr?: string;
    type: string;
    values?: Array<{ value?: string; type: string }>;
    default?: string;
    required: boolean;
    docs: string;
  }>;
  events: Array<{ event: string; detail: string; docs: string }>;
  methods: Array<{ name: string; signature: string; docs: string }>;
  slots: Array<{ name: string; docs: string }>;
  parts: Array<{ name: string; docs: string }>;
  styles: Array<{
    name: string;
    docs: string;
    visibility?: 'public' | 'internal';
    static?: boolean;
  }>;
}

const componentsOf = (context: ToolContext): DocsComponent[] =>
  readData<{ components: DocsComponent[] }>('documentation', context.settings).components;

const summaryOf = (component: DocsComponent): string =>
  firstSentence(component.usage?.['1. Description'] || component.docs);

/**
 * The keys of the two files in the `usage` of documentation.json: Stencil keys each usage file by
 * its name without `.md` (SPEC.md, "Auto-generation flow"), and the build keeps the text as written.
 */
const WHEN_TO_USE = '4. When to use';
const PLACEMENT = '5. Placement context';

/** The components and the patterns an answer of a `Not for` line may name (answersOf). */
interface Known {
  tags: ReadonlySet<string>;
  patterns: ReadonlySet<string>;
}

/** The patterns and the domains the installed magma ships, as data. */
const patternsOf = (context: ToolContext): Pattern[] =>
  readPatternDir(patternsDir(context)).map((one) => one.data);

/**
 * What a `Not for` line may name: a component of documentation.json or a pattern by its id, as
 * check.usage-docs holds them (scripts/usage-docs-lib.ts of stencil); `gap` answersOf knows.
 */
const knownOf = (components: DocsComponent[], patterns: Pattern[]): Known => ({
  tags: new Set(components.map((component) => component.tag)),
  patterns: new Set(patterns.map((one) => one.id)),
});

/** `4. When to use.md` of a component, read; undefined when it has none. */
const whenToUseOf = (component: DocsComponent) => {
  const md = component.usage?.[WHEN_TO_USE];
  return md?.trim() ? parseWhenToUse(md) : undefined;
};

/** A line of Markdown as plain text: the links, the inline code and the bold or italic marks off. */
const plainOf = (markdown: string): string =>
  markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/(\*\*|\*)(\S(?:.*?\S)?)\1/g, '$2')
    .replace(/\s+/g, ' ')
    .trim();

/** A `Not for` line as an answer gives it: the need, plain, and what answers it. */
const notForOf = (line: UsageLine, known: Known) => ({
  need: plainOf(line.need),
  answers: answersOf(line, known),
});

/**
 * The words every need line is written with (SPEC.md: "The person must ..."), left out when a
 * query is compared with the lines of When to use, as the reciprocity of check.usage-docs leaves
 * them out (needWords of scripts/usage-docs-lib.ts): they would match every line.
 */
const NEED_FORMAT = new Set(['person', 'people', 'user', 'must']);

/** The words of lines of When to use, lowercase, the words of the format left out. */
const lineWords = (texts: string[]): string[] =>
  texts
    .join(' ')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word && !NEED_FORMAT.has(word));

/**
 * A word of the query is in a line when a word of the line starts with it: wordsOf cuts the
 * final s of the query, so `stage` finds `stages`, `statu` finds `statuses` and `narrow` finds
 * `narrowing`, while a word met inside another (`over` in `popover`) does not count.
 */
const holds = (words: string[], word: string): boolean => words.some((one) => one.startsWith(word));

/**
 * The weights of a word of the query, by where it is found: the tag (a word of it, or part of
 * one), the summary, the `Use it for` lines, the full text. A `Use it for` line weighs between the
 * summary and the full text: it is a need the component answers, said by its maintainers, so it
 * tells more than the rest of the text, which also says how the component behaves and what it is
 * not; and less than the summary, which says what the component is.
 */
const WEIGHT = { tagWord: 6, tagPart: 4, summary: 3, useFor: 2, text: 1 };

/** The component of a tag or of a React or Angular class name; a tool error, with the near ones, when there is none. */
const componentOf = (context: ToolContext, name: unknown): DocsComponent => {
  if (typeof name !== 'string' || !name.trim())
    throw new ToolError('Give the tag of a component, such as "mds-button".');
  const tag = tagOf(name.trim());
  const components = componentsOf(context);
  const found = components.find((component) => component.tag === tag);
  if (found) return found;
  const near = components
    .filter((component) => wordsOf(tag).some((word) => component.tag.includes(word)))
    .map((component) => component.tag)
    .slice(0, 8);
  throw new ToolError(
    `No component ${tag} in this version of Magma.${near.length ? ` Near: ${near.join(', ')}.` : ' Use find_component to search by need.'}`,
  );
};

const string = { type: 'string' };
const strings = { type: 'array', items: string };

/** What answers a `Not for` line (UsageAnswer of the lint core). */
const ANSWER_SCHEMA = {
  type: 'object',
  properties: {
    kind: {
      type: 'string',
      enum: ['component', 'pattern', 'gap'],
      description:
        'A component (read it with get_component), a pattern (get_pattern), or gap: Magma has none.',
    },
    id: { type: 'string', description: 'The tag, the id of the pattern, or "gap".' },
  },
  required: ['kind', 'id'],
};

/**
 * A query matches a `Not for` line when the need of the line holds at least half of the words of
 * the query, the words of the format left out, and at least two of them when the query has two or
 * more: one word in common is chance, two place the need, as the reciprocity of check.usage-docs
 * decides (RECIPROCITY_SHARED_WORDS of scripts/usage-docs-lib.ts). A line that shares a word or
 * two with a longer query brings up nothing.
 */
const NOT_FOR_SHARE = 0.5;
const NOT_FOR_WORDS = 2;

/** How many words of the query a `Not for` line must hold to match it. */
const notForLeast = (count: number): number =>
  count < NOT_FOR_WORDS ? 1 : Math.max(NOT_FOR_WORDS, Math.ceil(count * NOT_FOR_SHARE));

export const findComponent = (context: ToolContext): Tool => ({
  name: 'find_component',
  title: 'Find a Magma component',
  description:
    'Find the Magma components that fit a need, described in words ("a date range picker", "a dismissible notice"). Returns the tags with what each one is for; read the one you pick with get_component. A candidate with a When to use carries its notFor lines, the near needs it does not answer, each with the component, the pattern or the gap that answers it: read them before you pick. When your need is the Not for of a candidate, the component that line names comes up too, with the line in via.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'What the component has to do, in a few words.' },
      limit: { type: 'number', description: 'How many to return, 8 by default.' },
    },
    required: ['query'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      components: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            tag: string,
            summary: string,
            notFor: {
              type: 'array',
              description:
                'The near needs it does not answer (its When to use), each with what answers it.',
              items: {
                type: 'object',
                properties: {
                  need: string,
                  answers: { type: 'array', items: ANSWER_SCHEMA },
                },
                required: ['need', 'answers'],
              },
            },
            via: {
              type: 'array',
              description:
                'Why it is here: the Not for line of another component that matches the query and names this one.',
              items: {
                type: 'object',
                properties: {
                  tag: { type: 'string', description: 'The component whose Not for line it is.' },
                  need: string,
                },
                required: ['tag', 'need'],
              },
            },
            score: { type: 'number' },
          },
          required: ['tag', 'summary', 'score'],
        },
      },
      gap: GAP_SCHEMA,
    },
    required: ['components'],
  },
  run: ({ query, limit }) => {
    const words = wordsOf(String(query ?? ''));
    if (!words.length) throw new ToolError('Describe what the component has to do.');
    // the lines of When to use are compared without the words every need is written with
    const needWords = words.filter((word) => !NEED_FORMAT.has(word));
    const all = componentsOf(context);
    const files = new Map(all.map((component) => [component.tag, whenToUseOf(component)]));
    // the patterns are read only when a component has a When to use, the only reader here
    const known = knownOf(all, [...files.values()].some(Boolean) ? patternsOf(context) : []);
    const scored = all.map((component) => {
      const tagWords = component.tag.replace(/^mds-/, '').split('-');
      const summary = summaryOf(component).toLowerCase();
      const file = files.get(component.tag);
      const useFor = lineWords(file?.useFor.map((line) => line.text) ?? []);
      // the full text is all the component writes about itself, both lists of When to use with
      // it: the need lines a Description held before #1580 moved them there, so a search still
      // finds the component it found, now with the Not for line that sends it elsewhere beside it
      const lines = file ? [...file.useFor, ...file.notFor].map((line) => line.text) : [];
      const text = [component.usage?.['1. Description'] ?? '', component.docs, ...lines]
        .join(' ')
        .toLowerCase();
      const score = words.reduce(
        (total, word) =>
          total +
          (tagWords.includes(word)
            ? WEIGHT.tagWord
            : component.tag.includes(word)
              ? WEIGHT.tagPart
              : 0) +
          (summary.includes(word) ? WEIGHT.summary : 0) +
          (needWords.includes(word) && holds(useFor, word) ? WEIGHT.useFor : 0) +
          (text.includes(word) ? WEIGHT.text : 0),
        0,
      );
      return {
        tag: component.tag,
        summary: summaryOf(component),
        ...(file ? { notFor: file.notFor.map((line) => notForOf(line, known)) } : {}),
        via: [] as Array<{ tag: string; need: string }>,
        score,
      };
    });
    // A Not for line of A that the query matches is a near need of A that A does not answer. A
    // comes up with the line beside it: the line counts once more, at the weight of the text (the
    // whole need matched, not words scattered in the text), so at most twice that weight a word.
    // The component B the line names comes up with the line in via, so the agent sees the right
    // answer beside the wrong one: B takes the line as one of its own Use it for lines (that
    // weight and the one of the text, which holds the lines), since check.usage-docs holds that
    // the need of a Not for of A that names B is among the Use it for of B (reciprocity,
    // SPEC.md); so B stands above A on that line. A pattern or the gap the line names is in the
    // notFor of A already.
    const byTag = new Map(scored.map((one) => [one.tag, one]));
    const least = notForLeast(needWords.length);
    for (const [tag, file] of files)
      for (const line of file?.notFor ?? []) {
        const theirs = lineWords([line.need]);
        const hits = needWords.filter((word) => holds(theirs, word)).length;
        if (!hits || hits < least) continue;
        byTag.get(tag)!.score += hits * WEIGHT.text;
        for (const answer of answersOf(line, known)) {
          const named = answer.kind === 'component' ? byTag.get(answer.id) : undefined;
          if (!named || named.tag === tag) continue;
          named.score += hits * (WEIGHT.useFor + WEIGHT.text);
          named.via.push({ tag, need: plainOf(line.need) });
        }
      }
    const components = scored
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.tag.localeCompare(b.tag))
      .slice(0, typeof limit === 'number' && limit > 0 ? limit : 8)
      .map(({ via, ...one }) => (via.length ? { ...one, via } : one));
    return { components, ...(components.length ? {} : { gap: GAP }) };
  },
});

/** The literal values of a prop, when its type is a closed union. */
const valuesOf = (prop: DocsComponent['props'][number]) => propInfo(prop).values;

export const getComponent = (context: ToolContext): Tool => ({
  name: 'get_component',
  title: 'Read the API of a Magma component',
  description:
    'The API of one Magma component in the installed version: props with their type, allowed values and default, events with their detail, methods, slots, parts and public CSS custom properties (the only ones a product sets; the internal ones are counted, they may change in any release), the files of its usage guide (when to use, placement, examples, mistakes), and in rules the rules of the design language that govern it (the relations and rules of the domains of the design language it carries or that write it, each with its domain and its text; the whole domain with get_guide). Where the component has them, whenToUse gives the needs it answers and the near ones it does not, each with what answers it, and placement where it goes in a view, what stands around it and inside it, with the places the patterns give it; cites gives the rules their lines name by id (actions/order), with their text. Use it before writing the component.',
  inputSchema: {
    type: 'object',
    properties: {
      tag: {
        type: 'string',
        description: 'The tag, such as "mds-button", or the wrapper name, such as "MdsButton".',
      },
    },
    required: ['tag'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      tag: string,
      summary: string,
      whenToUse: {
        type: 'object',
        description: 'Its need (When to use), when it has one.',
        properties: {
          useFor: { ...strings, description: 'The needs it answers, one line each, as written.' },
          notFor: {
            type: 'array',
            description: 'The near needs it does not answer.',
            items: {
              type: 'object',
              properties: {
                need: string,
                answers: { type: 'array', items: ANSWER_SCHEMA },
                text: {
                  type: 'string',
                  description: 'The whole line as written, with what it adds after the answers.',
                },
              },
              required: ['need', 'answers', 'text'],
            },
          },
        },
        required: ['useFor', 'notFor'],
      },
      placement: {
        type: 'object',
        description: 'Its place in a view (Placement context), when it has one.',
        properties: {
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                heading: { type: 'string', enum: [...PLACEMENT_HEADINGS] },
                lines: { ...strings, description: 'One rule each, as written.' },
              },
              required: ['heading', 'lines'],
            },
          },
          places: {
            type: 'array',
            description:
              'The places the patterns give it: each case of a pattern, or region of a building block, that writes it; read it with get_pattern.',
            items: {
              type: 'object',
              properties: {
                pattern: string,
                id: { type: 'string', description: 'The case, or the region of a block.' },
                roles: { ...strings, description: 'What the component does there.' },
                where: string,
              },
              required: ['pattern', 'id', 'roles', 'where'],
            },
          },
        },
        required: ['sections', 'places'],
      },
      cites: {
        type: 'array',
        description:
          'What the lines of whenToUse and placement name by id (`actions/order`): the rule, the case or the region, with its text.',
        items: {
          type: 'object',
          properties: {
            from: { type: 'string', description: 'The pattern or the domain.' },
            id: string,
            kind: { type: 'string', enum: ['rule', 'case', 'region'] },
            text: {
              type: 'string',
              description: 'The rule, the where of the case, the what of the region.',
            },
          },
          required: ['from', 'id', 'kind', 'text'],
        },
      },
      props: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: string,
            attribute: string,
            type: string,
            values: strings,
            default: string,
            required: { type: 'boolean' },
            description: string,
          },
          required: ['name', 'type', 'required', 'description'],
        },
      },
      events: {
        type: 'array',
        items: {
          type: 'object',
          properties: { name: string, detail: string, description: string },
          required: ['name', 'detail', 'description'],
        },
      },
      methods: {
        type: 'array',
        items: {
          type: 'object',
          properties: { name: string, signature: string, description: string },
          required: ['name', 'signature', 'description'],
        },
      },
      slots: {
        type: 'array',
        items: {
          type: 'object',
          properties: { name: string, description: string },
          required: ['name', 'description'],
        },
      },
      parts: {
        type: 'array',
        items: {
          type: 'object',
          properties: { name: string, description: string },
          required: ['name', 'description'],
        },
      },
      cssProperties: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: string,
            description: string,
            static: {
              type: 'boolean',
              description:
                'It takes a value of its own (an illustration colour), not a token or a role.',
            },
          },
          required: ['name', 'description'],
        },
      },
      internalCssProperties: {
        type: 'integer',
        description:
          'How many more it has, internal: not to be set, they may change in any release.',
      },
      files: {
        type: 'object',
        properties: {
          api: string,
          whenToUse: string,
          placement: string,
          examples: string,
          mistakes: string,
        },
      },
      rules: { type: 'array', items: RULE_SCHEMA },
    },
    required: [
      'tag',
      'summary',
      'props',
      'events',
      'methods',
      'slots',
      'parts',
      'cssProperties',
      'internalCssProperties',
      'files',
      'rules',
    ],
  },
  run: ({ tag }) => {
    const component = componentOf(context, tag);
    const dir = path.join(magmaRoot(context.settings), 'dist/collection/components', component.tag);
    // the shipped docs of the component, when the package has them (the files of the need and
    // the place only for a component that has them, SPEC.md "Auto-generation flow")
    const files = Object.fromEntries(
      Object.entries({
        api: 'AGENTS.md',
        whenToUse: 'when-to-use.md',
        placement: 'placement.md',
        examples: 'examples.md',
        mistakes: 'mistakes.md',
      })
        .map(([key, name]) => [key, path.join(dir, name)])
        .filter(([, full]) => existsSync(full!)),
    );
    const patterns = patternsOf(context);
    const need = whenToUseOf(component);
    const known = need && knownOf(componentsOf(context), patterns);
    // the text of the file, from documentation.json: the shipped placement.md adds "In the
    // patterns", which places gives as data and parsePlacement refuses as written by hand
    const place = component.usage?.[PLACEMENT]?.trim()
      ? parsePlacement(component.usage[PLACEMENT])
      : undefined;
    // the rules the two files name by id and do not rewrite (SPEC.md: "get_component returns
    // it"), each once, in the order of the files; one that names nothing check.usage-docs reports
    const lines = [
      ...(need ? [...need.useFor, ...need.notFor] : []),
      ...(place?.sections.flatMap((one) => one.lines) ?? []),
    ];
    const cites = [
      ...new Map(
        lines
          .flatMap((line) => citationsOf(line))
          .map(({ from, id }) => [`${from}/${id}`, resolveCitation(patterns, from, id)] as const),
      ).values(),
    ].filter((one) => one !== undefined);
    return {
      tag: component.tag,
      summary: summaryOf(component),
      ...(need && known
        ? {
            whenToUse: {
              useFor: need.useFor.map((line) => line.text),
              notFor: need.notFor.map((line) => ({ ...notForOf(line, known), text: line.text })),
            },
          }
        : {}),
      ...(place
        ? {
            placement: {
              sections: place.sections.map(({ heading, lines }) => ({
                heading,
                lines: lines.map((line) => line.text),
              })),
              places: placesOfComponent(patterns, component.tag),
            },
          }
        : {}),
      ...(cites.length ? { cites } : {}),
      props: component.props.map((prop) => {
        const values = valuesOf(prop);
        return {
          name: prop.name,
          ...(prop.attr ? { attribute: prop.attr } : {}),
          type: prop.type,
          ...(values ? { values } : {}),
          ...(prop.default !== undefined ? { default: prop.default } : {}),
          required: prop.required,
          description: prop.docs,
        };
      }),
      events: component.events.map(({ event, detail, docs }) => ({
        name: event,
        detail,
        description: docs,
      })),
      methods: component.methods.map(({ name, signature, docs }) => ({
        name,
        signature,
        description: docs,
      })),
      slots: component.slots.map(({ name, docs }) => ({
        name: name || 'default',
        description: docs,
      })),
      parts: component.parts.map(({ name, docs }) => ({ name, description: docs })),
      // an entry without visibility comes from a release before the contract: all were promised
      cssProperties: component.styles
        .filter((style) => style.visibility !== 'internal')
        .map((style) => ({
          name: style.name,
          description: style.docs,
          ...(style.static ? { static: true } : {}),
        })),
      internalCssProperties: component.styles.filter((style) => style.visibility === 'internal')
        .length,
      files,
      rules: rulesOfComponent(patterns, component.tag),
    };
  },
});

const FRAMEWORKS = ['html', 'react', 'angular'] as const;
type Framework = (typeof FRAMEWORKS)[number];

const NOTES: Record<Framework, string[]> = {
  html: [
    'A boolean attribute is on whenever it is present: remove it to turn the prop off, never write "false".',
    'Listen to an event with addEventListener on the element; its value is in event.detail.',
  ],
  react: [
    'Pass a real boolean to a boolean prop: disabled={isDisabled}.',
    'In a Next.js Server Component import the .server variant of the wrapper (agents/install.md, the React track).',
  ],
  angular: [
    'Bind an input with [prop]="value" and a boolean with [disabled]="isDisabled": a static disabled="false" turns a form-associated component on.',
    'Add the component class to the imports of your standalone component, or import MagmaModule.',
  ],
};

export const getUsage = (context: ToolContext): Tool => ({
  name: 'get_usage',
  title: 'Write a Magma component in HTML, React or Angular',
  description:
    'How to write one Magma component in a framework: the import, the element or wrapper name, every prop and event as that framework writes them (attribute, React prop and onMdsX handler, Angular [input] and (output)), an example and the traps of that framework.',
  inputSchema: {
    type: 'object',
    properties: {
      tag: { type: 'string', description: 'The tag, such as "mds-input".' },
      framework: {
        type: 'string',
        enum: [...FRAMEWORKS],
        description: 'html (web components), react (magma-react) or angular (magma-angular).',
      },
    },
    required: ['tag', 'framework'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      tag: string,
      framework: string,
      import: string,
      element: string,
      props: {
        type: 'array',
        items: {
          type: 'object',
          properties: { name: string, written: string, values: strings },
          required: ['name', 'written'],
        },
      },
      events: {
        type: 'array',
        items: {
          type: 'object',
          properties: { name: string, written: string, detail: string },
          required: ['name', 'written', 'detail'],
        },
      },
      example: string,
      notes: strings,
    },
    required: ['tag', 'framework', 'import', 'element', 'props', 'events', 'example', 'notes'],
  },
  run: ({ tag, framework }) => {
    if (!FRAMEWORKS.includes(framework as Framework))
      throw new ToolError(`framework is one of ${FRAMEWORKS.join(', ')}.`);
    const target = framework as Framework;
    const component = componentOf(context, tag);
    const pascal = pascalOf(component.tag);
    const element = target === 'html' ? component.tag : pascal;
    const props = component.props.map((prop) => {
      const values = valuesOf(prop);
      const sample = values?.[0] ?? 'value';
      const boolean = propInfo(prop).boolean;
      const written =
        target === 'html'
          ? prop.attr
            ? boolean
              ? prop.attr
              : `${prop.attr}="${sample}"`
            : `element.${prop.name} = value (a property, no attribute)`
          : target === 'react'
            ? boolean
              ? `${prop.name}={isOn}`
              : values
                ? `${prop.name}="${sample}"`
                : `${prop.name}={value}`
            : boolean
              ? `[${prop.name}]="isOn"`
              : values
                ? `${prop.name}="${sample}"`
                : `[${prop.name}]="value"`;
      return { name: prop.name, written, ...(values ? { values } : {}) };
    });
    const events = component.events.map(({ event, detail }) => ({
      name: event,
      written:
        target === 'html'
          ? `element.addEventListener('${event}', (event) => event.detail)`
          : target === 'react'
            ? `on${event.charAt(0).toUpperCase()}${event.slice(1)}={(event) => event.detail}`
            : `(${event})="on($event.detail)"`,
      detail,
    }));
    const shown = component.props
      .filter((prop) => prop.required || (valuesOf(prop) && !propInfo(prop).boolean))
      .slice(0, 2)
      .map((prop) => props.find((one) => one.name === prop.name)!.written)
      .filter((written) => !written.startsWith('element.'));
    const label = component.props.find((prop) => prop.name === 'label')
      ? props.find((one) => one.name === 'label')!.written
      : undefined;
    // in HTML an event is listened to in a script, not written on the element
    const handler = target !== 'html' && events[0] ? [events[0].written] : [];
    const attributes = [
      ...(label ? [label] : []),
      ...shown.filter((one) => one !== label),
      ...handler,
    ];
    const open = `<${element}${attributes.length ? ` ${attributes.join(' ')}` : ''}`;
    const importLine =
      target === 'html'
        ? `import { defineCustomElement${pascal} } from '@maggioli-design-system/magma/components';\ndefineCustomElement${pascal}();`
        : target === 'react'
          ? `import { ${pascal} } from '@maggioli-design-system/magma-react';`
          : `import { ${pascal} } from '@maggioli-design-system/magma-angular';`;
    return {
      tag: component.tag,
      framework: target,
      import: importLine,
      element,
      props,
      events,
      example: target === 'react' ? `${open} />` : `${open}></${element}>`,
      notes: NOTES[target],
    };
  },
});

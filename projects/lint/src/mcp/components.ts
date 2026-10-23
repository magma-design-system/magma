/*
  The component tools: find the one that fits a need, read its API, and write it in HTML,
  React or Angular. Everything comes from the documentation.json of the installed magma.
*/
import { existsSync } from 'node:fs';
import path from 'node:path';
import { magmaRoot, propInfo, readData } from '../core/data.js';
import { tagOf } from '../core/element.js';
import { ToolError, type Tool } from './protocol.js';
import { firstSentence, pascalOf, wordsOf, type ToolContext } from './context.js';

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
  styles: Array<{ name: string; docs: string }>;
}

const componentsOf = (context: ToolContext): DocsComponent[] =>
  readData<{ components: DocsComponent[] }>('documentation', context.settings).components;

const summaryOf = (component: DocsComponent): string =>
  firstSentence(component.usage?.['1. Description'] || component.docs);

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

export const findComponent = (context: ToolContext): Tool => ({
  name: 'find_component',
  title: 'Find a Magma component',
  description:
    'Find the Magma components that fit a need, described in words ("a date range picker", "a dismissible notice"). Returns the tags with what each one is for; read the one you pick with get_component.',
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
          properties: { tag: string, summary: string, score: { type: 'number' } },
          required: ['tag', 'summary', 'score'],
        },
      },
    },
    required: ['components'],
  },
  run: ({ query, limit }) => {
    const words = wordsOf(String(query ?? ''));
    if (!words.length) throw new ToolError('Describe what the component has to do.');
    const scored = componentsOf(context).map((component) => {
      const tagWords = component.tag.replace(/^mds-/, '').split('-');
      const summary = summaryOf(component).toLowerCase();
      const text = `${component.usage?.['1. Description'] ?? ''} ${component.docs}`.toLowerCase();
      const score = words.reduce(
        (total, word) =>
          total +
          (tagWords.includes(word) ? 6 : component.tag.includes(word) ? 4 : 0) +
          (summary.includes(word) ? 3 : 0) +
          (text.includes(word) ? 1 : 0),
        0,
      );
      return { tag: component.tag, summary: summaryOf(component), score };
    });
    return {
      components: scored
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score || a.tag.localeCompare(b.tag))
        .slice(0, typeof limit === 'number' && limit > 0 ? limit : 8),
    };
  },
});

/** The literal values of a prop, when its type is a closed union. */
const valuesOf = (prop: DocsComponent['props'][number]) => propInfo(prop).values;

export const getComponent = (context: ToolContext): Tool => ({
  name: 'get_component',
  title: 'Read the API of a Magma component',
  description:
    'The API of one Magma component in the installed version: props with their type, allowed values and default, events with their detail, methods, slots, parts and CSS custom properties, and the files of its usage guide (pattern, antipattern). Use it before writing the component.',
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
          properties: { name: string, description: string },
          required: ['name', 'description'],
        },
      },
      files: { type: 'object', properties: { api: string, pattern: string, antipattern: string } },
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
      'files',
    ],
  },
  run: ({ tag }) => {
    const component = componentOf(context, tag);
    const dir = path.join(magmaRoot(context.settings), 'dist/collection/components', component.tag);
    // the shipped docs of the component, when the package has them
    const files = Object.fromEntries(
      Object.entries({ api: 'AGENTS.md', pattern: 'pattern.md', antipattern: 'antipattern.md' })
        .map(([key, name]) => [key, path.join(dir, name)])
        .filter(([, full]) => existsSync(full!)),
    );
    return {
      tag: component.tag,
      summary: summaryOf(component),
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
      cssProperties: component.styles.map(({ name, docs }) => ({ name, description: docs })),
      files,
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

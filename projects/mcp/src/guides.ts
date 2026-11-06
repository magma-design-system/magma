/*
  get_guide: one section of the guides the magma package ships (AGENTS.md and agents/*.md),
  instead of a whole file: the list of guides, the headings of one, or the text of one section.
  The domains of Foundation (agents/patterns/<id>.md of kind foundation, #1189) are guides too,
  the rules of composition of the design language (#1198): named by their id, read without
  their frontmatter, the data get_pattern answers from; a domain names the previews of its
  cases and of its rules (#1221), which render_preview renders by case or rule.
*/
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
  magmaRoot,
  FOUNDATION,
  ownRules,
  readPatternDir,
  readPreviews,
} from '@maggioli-design-system/magma/lint';
import { ToolError, type Tool } from './protocol.js';
import { patternsDir } from './patterns.js';
import type { ToolContext } from './context.js';

interface Guide {
  name: string;
  /** Its text: the file of a guide, the body of a domain. */
  read: () => string;
  /** `foundation` for a domain. */
  kind?: string;
  /** For a domain, the previews of its cases and of its rules, in the order of the folder. */
  previews?: GuidePreview[];
}

interface GuidePreview {
  id: string;
  kind: 'case' | 'rule';
  file: string;
  /** From 2, the example after the first (<id>.<n>.html). */
  example?: number;
}

const guidesOf = (context: ToolContext): Guide[] => {
  const root = magmaRoot(context.settings);
  const dir = path.join(root, 'agents');
  const guide = (name: string, file: string): Guide => ({
    name,
    read: () => readFileSync(file, 'utf8'),
  });
  const guides: Guide[] = existsSync(path.join(root, 'AGENTS.md'))
    ? [guide('AGENTS', path.join(root, 'AGENTS.md'))]
    : [];
  if (existsSync(dir))
    for (const file of readdirSync(dir)
      .filter((one) => one.endsWith('.md'))
      .sort())
      guides.push(guide(file.slice(0, -3), path.join(dir, file)));
  // after the guides, by id; a guide of the same name comes first, the domain stays patterns/<id>
  const previews = readPreviews(patternsDir(context));
  for (const { data, body } of readPatternDir(patternsDir(context)))
    if (data.kind === FOUNDATION) {
      const rules = ownRules(data);
      const mine: GuidePreview[] = previews
        .filter((one) => one.pattern === data.id)
        .map((one) => ({
          id: one.id,
          kind: rules.includes(one.id) ? 'rule' : 'case',
          file: path.relative(context.root, one.file),
          ...(one.example > 1 ? { example: one.example } : {}),
        }));
      guides.push({
        name: data.id,
        read: () => body,
        kind: FOUNDATION,
        ...(mine.length ? { previews: mine } : {}),
      });
    }
  return guides;
};

interface Heading {
  heading: string;
  level: number;
  line: number;
}

const headingsOf = (lines: string[]): Heading[] => {
  const found: Heading[] = [];
  let fence = false;
  lines.forEach((line, index) => {
    if (/^```/.test(line)) fence = !fence;
    const match = !fence && /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (match) found.push({ heading: match[2]!, level: match[1]!.length, line: index });
  });
  return found;
};

/** `## 2. Use the components` -> `2-use-the-components`, the anchor GitHub gives it. */
const anchorOf = (heading: string) =>
  heading
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-');

export const getGuide = (context: ToolContext): Tool => ({
  name: 'get_guide',
  title: 'Read a Magma guide',
  description:
    'The guides Magma ships for agents (installation, conventions, color, typography, theming, lint...) and the domains of Foundation, the rules of composition of the design language (kind foundation, such as rhythm: the space between elements): without arguments the list with their sections, with a guide its headings (a domain also the previews of its cases and rules, for render_preview), with a guide and a section the text of that section only. Read the section you need, not the whole file.',
  inputSchema: {
    type: 'object',
    properties: {
      guide: {
        type: 'string',
        description: 'The guide, such as "color", "conventions", "lint", or a domain, "rhythm".',
      },
      section: {
        type: 'string',
        description: 'A heading of the guide, or part of it, such as "Boolean".',
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      guides: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            title: { type: 'string' },
            sections: { type: 'array', items: { type: 'string' } },
            kind: { type: 'string', description: 'foundation: a domain of the design language.' },
          },
          required: ['name', 'title', 'sections'],
        },
      },
      guide: { type: 'string' },
      title: { type: 'string' },
      sections: {
        type: 'array',
        items: {
          type: 'object',
          properties: { heading: { type: 'string' }, level: { type: 'number' } },
          required: ['heading', 'level'],
        },
      },
      section: { type: 'string' },
      text: { type: 'string' },
      previews: {
        type: 'array',
        description:
          'For a domain: the previews of its cases and of its rules, for render_preview (pattern with case or rule, and example from 2).',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            kind: { type: 'string', enum: ['case', 'rule'] },
            file: { type: 'string' },
            example: { type: 'number' },
          },
          required: ['id', 'kind', 'file'],
        },
      },
    },
  },
  run: ({ guide, section }) => {
    const guides = guidesOf(context);
    if (!guides.length)
      throw new ToolError('This magma has no guides for agents (AGENTS.md, agents/).');
    const read = (one: Guide) => one.read().split('\n');
    const titleOf = (lines: string[]) =>
      headingsOf(lines).find((one) => one.level === 1)?.heading ?? '';

    if (typeof guide !== 'string' || !guide) {
      return {
        guides: guides.map((one) => {
          const lines = read(one);
          return {
            name: one.name,
            title: titleOf(lines),
            sections: headingsOf(lines)
              .filter((one) => one.level === 2)
              .map((one) => one.heading),
            ...(one.kind ? { kind: one.kind } : {}),
          };
        }),
      };
    }
    const name = guide
      .replace(/^agents\//, '')
      .replace(/\.md$/, '')
      .toLowerCase();
    const found =
      guides.find((one) => one.name.toLowerCase() === name) ??
      guides.find((one) => one.kind === FOUNDATION && `patterns/${one.name}` === name);
    if (!found)
      throw new ToolError(
        `No guide ${guide}: the guides are ${guides.map((one) => one.name).join(', ')}.`,
      );
    const lines = read(found);
    const headings = headingsOf(lines);
    if (typeof section !== 'string' || !section)
      return {
        guide: found.name,
        title: titleOf(lines),
        sections: headings
          .filter((one) => one.level > 1)
          .map(({ heading, level }) => ({ heading, level })),
        ...(found.previews ? { previews: found.previews } : {}),
      };

    const wanted = section.toLowerCase();
    const start =
      headings.find(
        (one) =>
          one.heading.toLowerCase() === wanted ||
          anchorOf(one.heading) === wanted.replace(/^#/, ''),
      ) ?? headings.find((one) => one.heading.toLowerCase().includes(wanted));
    if (!start)
      throw new ToolError(
        `No section "${section}" in ${found.name}: its sections are ${headings
          .filter((one) => one.level > 1)
          .map((one) => one.heading)
          .join('; ')}.`,
      );
    // the section runs to the next heading of the same level or above
    const end =
      headings.find((one) => one.line > start.line && one.level <= start.level)?.line ??
      lines.length;
    return {
      guide: found.name,
      section: start.heading,
      text: lines.slice(start.line, end).join('\n').trim(),
    };
  },
});

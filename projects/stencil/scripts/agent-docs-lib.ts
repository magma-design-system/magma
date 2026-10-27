/**
 * Pure helpers shared by the agent-docs generators:
 *
 * - sync-agent-docs.ts (before the stencil build) ships the docs/agents/ fragments
 *   into the three entry-point packages;
 * - component-docs.ts (after the stencil build) writes the per-component docs next
 *   to each component in dist/collection/components/<tag>/.
 *
 * Kept free of file-system side effects so scripts/agent-docs-lib.spec.ts can test
 * the link rewriting and the rendering directly.
 */
import path from 'path';
import { isPublic, type ContractStyle } from './style-contract-lib';

/** Folder of one component's docs inside the magma package. */
export const COMPONENT_DOCS_DIR = 'dist/collection/components';

/** From a component's docs folder back to the package root (dist/collection/components/<tag>/). */
const TO_PACKAGE_ROOT = '../../../../';

/** The shared fragments of docs/agents/ shipped as agents/<name> in every entry-point package. */
export const SHARED_FRAGMENTS = [
  'conventions.md',
  'variants.md',
  'mistakes.md',
  'color.md',
  'typography.md',
  'theming.md',
  'assets.md',
  'reporting.md',
  'lint.md',
  'mcp.md',
] as const;

/** Collapses common non-ASCII punctuation to ASCII, then drops anything left. */
export function toAscii(text: string): string {
  return text
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u0080-\uFFFF]/g, '');
}

/**
 * Rewrites the links of a component's usage markdown, authored against the monorepo
 * layout (src/components/<tag>/usage/), so they resolve from the shipped copy in
 * dist/collection/components/<tag>/. The same text goes into documentation.json, whose
 * usage links are therefore relative to that folder too.
 */
export function rewriteUsageLinks(md: string): string {
  return (
    md
      // the shared fragments: docs/agents/<name>.md -> agents/<name>.md at the package root
      .replace(
        /\[`docs\/agents\/([a-z-]+\.md)`\]\((?:\.\.\/)+docs\/agents\/([a-z-]+\.md)(#[a-z0-9-]+)?\)/g,
        (_m, text: string, file: string, anchor = '') =>
          `[\`agents/${text}\`](${TO_PACKAGE_ROOT}agents/${file}${anchor})`,
      )
      // the repo catalogue -> the shipped catalogue
      .replace(
        /\[`docs\/COMPONENTS\.md`\]\((?:\.\.\/)+docs\/COMPONENTS\.md\)/g,
        `[\`agents/components.md\`](${TO_PACKAGE_ROOT}agents/components.md)`,
      )
      // the component's own Stencil readme -> its shipped AGENTS.md, in the same folder
      .replace(/\[`readme\.md`\]\(\.\.\/readme\.md\)/g, '[`AGENTS.md`](AGENTS.md)')
      // a sibling component's source folder -> its shipped AGENTS.md, one folder up
      .replace(/\]\(\.\.\/\.\.\/(mds-[a-z0-9-]+)\/?\)/g, '](../$1/AGENTS.md)')
  );
}

/**
 * Rewrites the links of a docs/agents/ fragment for its shipped copy in <package>/agents/.
 * `componentDocs` is the folder of the per-component docs as seen from there: the magma
 * package's dist/collection/components, `../../magma/...` from a wrapper. A component's
 * Examples and Mistakes become its shipped examples.md and mistakes.md, any other doc of
 * it its AGENTS.md, the install entry point and the per-target
 * tracks become the files the package ships. Any other link into the monorepo is left as it
 * is, so component-docs.ts fails the build on it: turned into plain text, it used to ship
 * as a reference nobody outside the monorepo can open ("the mds-icon readme").
 */
export function rewriteGuideLinks(md: string, componentDocs: string): string {
  return (
    md
      // a component's Examples or Mistakes usage file -> its shipped examples.md / mistakes.md
      .replace(
        /\[([^\]]*)\]\((?:\.\.\/)+projects\/stencil\/src\/components\/(mds-[a-z0-9-]+)\/usage\/[23]\.(?:%20| )(Examples|Mistakes)\.md(#[a-z0-9-]+)?\)/g,
        (_m, text: string, tag: string, file: string, anchor = '') =>
          `[${text}](${componentDocs}/${tag}/${file.toLowerCase()}.md${anchor})`,
      )
      // any other doc of a component in the monorepo (readme, description) -> its shipped AGENTS.md
      .replace(
        /\[[^\]]*\]\((?:\.\.\/)+projects\/stencil\/src\/components\/(mds-[a-z0-9-]+)\/[^)]*\)/g,
        (_m, tag: string) => `[\`${tag}/AGENTS.md\`](${componentDocs}/${tag}/AGENTS.md)`,
      )
      // install entry point SPEC.md -> the package AGENTS.md (one level up from agents/)
      .replace(/\[`?SPEC\.md`?\]\(SPEC\.md\)/g, '[`AGENTS.md`](../AGENTS.md)')
      // collapse the "(web-components.md, react.md, angular.md)" group to the single shipped track
      .replace(
        /\(\[`?web-components\.md`?\]\([^)]*\),\s*\[`?react\.md`?\]\([^)]*\),\s*\[`?angular\.md`?\]\([^)]*\)\)/g,
        '([`install.md`](install.md))',
      )
      // per-target track filenames -> the single track shipped here
      .replace(
        /\[`?(?:web-components|react|angular)\.md`?\]\((?:web-components|react|angular)\.md\)/g,
        '[`install.md`](install.md)',
      )
  );
}

/** Escapes a value for a single markdown table cell. */
function cell(value: string | undefined): string {
  if (!value) return '-';
  return (
    value
      .replace(/\s*\n\s*/g, ' ')
      .replace(/\|/g, '\\|')
      .trim() || '-'
  );
}

/** Escapes a value as inline code inside a table cell. */
function code(value: string | undefined): string {
  if (!value) return '-';
  return '`' + cell(value).replace(/`/g, "'") + '`';
}

function table(header: string[], rows: string[][]): string {
  return [
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...rows.map((r) => `| ${r.join(' | ')} |`),
  ].join('\n');
}

/** Minimal shape of a docs-json component entry read by the renderer. */
export interface DocsComponent {
  tag: string;
  encapsulation?: string;
  readme?: string;
  usage?: Record<string, string>;
  props?: {
    name: string;
    attr?: string;
    type: string;
    default?: string;
    docs?: string;
    required?: boolean;
    deprecation?: string;
  }[];
  events?: { event: string; detail: string; docs?: string; deprecation?: string }[];
  methods?: { name: string; signature: string; docs?: string; deprecation?: string }[];
  slots?: { name: string; docs?: string }[];
  parts?: { name: string; docs?: string }[];
  styles?: ContractStyle[];
  dependencies?: string[];
  dependents?: string[];
  /** The id of its docs page in the published Storybook (component-docs.ts, #1148). */
  storybook?: string;
  [key: string]: unknown;
}

/**
 * The usage files of a component, as the keys of its `usage` in documentation.json: the file
 * name without `.md`, the number only sets the order. A contract with the readers of
 * documentation.json, the docs site first (docs/CONTRACTS.md, "documentation.json"), which
 * leaves out a name it does not know: a name outside this list fails the build instead.
 */
export const USAGE_FILES = ['1. Description', '2. Examples', '3. Mistakes'] as const;

/** The keys of a component's `usage` that are not in USAGE_FILES. */
export const unknownUsageFiles = (component: DocsComponent): string[] =>
  Object.keys(component.usage ?? {}).filter(
    (key) => !(USAGE_FILES as readonly string[]).includes(key),
  );

function described(docs: string | undefined, deprecation?: string, required?: boolean): string {
  const parts: string[] = [];
  // a @deprecated text that ends its own sentence keeps one full stop, not two
  if (deprecation !== undefined)
    parts.push(`**Deprecated**${deprecation ? `: ${deprecation.replace(/\.$/, '')}` : ''}.`);
  if (required) parts.push('**Required**.');
  if (docs) parts.push(docs);
  return cell(parts.join(' '));
}

function section(title: string, body: string | undefined): string {
  return body ? `## ${title}\n\n${body}\n` : '';
}

/**
 * Renders a component's AGENTS.md: what it is (its usage description), then its API as
 * compact tables, with links to the examples / mistakes files beside it and to the
 * rules shared by every component.
 */
export function renderComponentAgentsMd(
  component: DocsComponent,
  pkgVersion: string,
  storybookUrl?: string,
): string {
  const { tag } = component;
  const usage = component.usage ?? {};
  const description = usage['1. Description']?.trim();
  const hasExamples = !!usage['2. Examples']?.trim();
  const hasMistakes = !!usage['3. Mistakes']?.trim();

  const readNext = [
    hasExamples ? '[`examples.md`](examples.md) - correct usage, from the most common case' : '',
    hasMistakes ? '[`mistakes.md`](mistakes.md) - the wrong forms, each with the right one' : '',
    storybookUrl && component.storybook
      ? `[Storybook](${storybookUrl}?path=/docs/${component.storybook}) - the live examples, in the published Storybook of \`main\``
      : '',
    `[\`conventions.md\`](${TO_PACKAGE_ROOT}agents/conventions.md), ` +
      `[\`variants.md\`](${TO_PACKAGE_ROOT}agents/variants.md), ` +
      `[\`mistakes.md\`](${TO_PACKAGE_ROOT}agents/mistakes.md) - the rules shared by every component`,
  ].filter(Boolean);

  const encapsulation =
    component.encapsulation === 'shadow'
      ? 'Shadow DOM: style it only through the public CSS custom properties and the parts below.'
      : component.encapsulation === 'scoped'
        ? 'Scoped styles (no shadow root): it takes part natively in HTML form submission.'
        : '';

  const props = component.props?.length
    ? table(
        ['Prop', 'Attribute', 'Type', 'Default', 'Description'],
        component.props.map((p) => [
          `\`${p.name}\``,
          code(p.attr),
          code(p.type),
          code(p.default),
          described(p.docs, p.deprecation, p.required),
        ]),
      )
    : undefined;
  const events = component.events?.length
    ? table(
        ['Event', 'Detail', 'Description'],
        component.events.map((e) => [
          `\`${e.event}\``,
          code(e.detail),
          described(e.docs, e.deprecation),
        ]),
      )
    : undefined;
  const methods = component.methods?.length
    ? table(
        ['Method', 'Signature', 'Description'],
        component.methods.map((m) => [
          `\`${m.name}\``,
          code(m.signature),
          described(m.docs, m.deprecation),
        ]),
      )
    : undefined;
  const slots = component.slots?.length
    ? table(
        ['Slot', 'Description'],
        component.slots.map((s) => [s.name ? `\`${s.name}\`` : '(default)', cell(s.docs)]),
      )
    : undefined;
  const parts = component.parts?.length
    ? table(
        ['Part', 'Description'],
        component.parts.map((p) => [`\`${p.name}\``, cell(p.docs)]),
      )
    : undefined;
  const publicStyles = (component.styles ?? []).filter(isPublic);
  const internal = (component.styles?.length ?? 0) - publicStyles.length;
  const styles = !component.styles?.length
    ? undefined
    : !publicStyles.length
      ? `None is public: its ${internal === 1 ? 'custom property is' : `${internal} custom properties are`} internal and may change in any release. Style it with its props, its parts and the semantic roles.`
      : [
          table(
            ['Property', 'Description'],
            publicStyles.map((s) => [
              `\`${s.name}\``,
              cell(
                s.static
                  ? `**Static**: a value of its own, not a token or a role. ${s.docs ?? ''}`
                  : s.docs,
              ),
            ]),
          ),
          internal
            ? internal === 1
              ? 'Only these are public. Its other one is internal: it may change in any release, do not set it.'
              : `Only these are public. Its other ${internal} are internal: they may change in any release, do not set them.`
            : '',
        ]
          .filter(Boolean)
          .join('\n\n');
  const deps = [
    component.dependencies?.length
      ? `Uses: ${component.dependencies.map((d) => `\`${d}\``).join(', ')}.`
      : '',
    component.dependents?.length
      ? `Used by: ${component.dependents.map((d) => `\`${d}\``).join(', ')}.`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  return [
    `<!--
  GENERATED FILE - do not edit by hand.
  Source of truth: src/components/${tag}/ in the magma monorepo (usage/*.md and the
  component's JSDoc). Regenerated on every stencil build (scripts/component-docs.ts).
-->`,
    `# ${tag}`,
    `> \`@maggioli-design-system/magma\` ${pkgVersion}. ${encapsulation}`.trimEnd(),
    description ? rewriteUsageLinks(description) : '',
    `## Read next\n\n${readNext.map((r) => `- ${r}`).join('\n')}\n`,
    section('Props', props),
    section('Events', events),
    section('Methods', methods),
    section('Slots', slots),
    section('Parts', parts),
    section('CSS custom properties', styles),
    section('Dependencies', deps || undefined),
  ]
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd()
    .concat('\n');
}

/** A usage file (examples / mistakes) as shipped beside the component's AGENTS.md. */
export function renderUsageFile(tag: string, title: string, md: string): string {
  return `<!--
  GENERATED FILE - do not edit by hand.
  Source of truth: src/components/${tag}/usage/ in the magma monorepo.
-->

# ${tag} - ${title}

> The API of this component: [\`AGENTS.md\`](AGENTS.md).

${rewriteUsageLinks(md.trim())}
`;
}

/** The docs-json entry of one component as shipped beside it: no readme, links rewritten. */
export function componentDocsJson(component: DocsComponent): DocsComponent {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { readme, ...rest } = component;
  return { ...rest, usage: rewriteUsageEntries(component.usage) };
}

/** The usage map of a docs-json entry with every link rewritten for the shipped layout. */
export function rewriteUsageEntries(
  usage: Record<string, string> | undefined,
): Record<string, string> {
  return Object.fromEntries(Object.entries(usage ?? {}).map(([k, v]) => [k, rewriteUsageLinks(v)]));
}

/** The relative markdown links of a document (no URL, no pure anchor). */
export function relativeLinks(md: string): string[] {
  const out: string[] = [];
  // strip fenced code blocks: their brackets are code, not links
  const text = md.replace(/```[\s\S]*?```/g, '');
  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = m[1];
    if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('#')) continue;
    out.push(target.split('#')[0]);
  }
  return out;
}

/**
 * Checks that every relative link of a shipped document resolves to an existing file
 * inside one of the allowed roots (the package itself, or the magma package a wrapper
 * links into). `resolve` maps a link to a path on disk, so a wrapper's link into the
 * installed magma package can be checked against its monorepo location. Returns the
 * broken links, empty when all resolve.
 */
export function brokenLinks(
  md: string,
  resolve: (link: string) => string,
  allowedRoots: string[],
  exists: (p: string) => boolean,
): string[] {
  return relativeLinks(md).filter((link) => {
    const resolved = resolve(decodeURI(link));
    const inside = allowedRoots.some(
      (root) => resolved === root || resolved.startsWith(root + path.sep),
    );
    return !inside || !exists(resolved);
  });
}

/**
 * The categories of the components, in the order of the catalogue (#1106). Every
 * component that stands alone names one with `@category <id>` in the JSDoc of its
 * class; every part of a compound names its direct parent with `@parent <tag>` instead
 * (several tags where it sits in several parents, the first one leading to its
 * component), and is listed after that component. docs/COMPONENTS.md ("Categories")
 * describes the same list: change both together.
 */
export const COMPONENT_CATEGORIES = [
  {
    id: 'actions',
    title: 'Actions',
    summary: 'Controls that make something happen: buttons, links, action bars and menus',
  },
  {
    id: 'forms',
    title: 'Forms',
    summary: 'Fields that take a value, and the calendar and the filters that help pick one',
  },
  {
    id: 'navigation',
    title: 'Navigation',
    summary: 'Where the user is and where they can go: breadcrumbs, tabs, steps, pages, trees',
  },
  {
    id: 'feedback',
    title: 'Feedback',
    summary: 'Messages, progress and empty states that tell the user what is happening',
  },
  {
    id: 'overlays',
    title: 'Overlays',
    summary: 'Surfaces that float over the page: dialogs, dropdowns, tooltips, help',
  },
  {
    id: 'data',
    title: 'Data',
    summary: 'Sets of values and the people they belong to: tables, lists, figures, avatars',
  },
  {
    id: 'tags',
    title: 'Tags',
    summary: 'Short markers attached to other content: badges, chips, labels, mentions, keys',
  },
  {
    id: 'structure',
    title: 'Structure',
    summary: 'Containers and dividers that lay the page out: cards, accordions, headers, rules',
  },
  {
    id: 'content',
    title: 'Content',
    summary: 'Text, media and files: typography, images, icons, quotes, notes, previews',
  },
  {
    id: 'preferences',
    title: 'Preferences',
    summary:
      'The controls a user tunes the interface with: mode, theme, contrast, motion, language',
  },
] as const;

/** The place of a component in the catalogue: its category, or the parents of a part. */
export interface ComponentTaxonomy {
  tag: string;
  category?: string;
  parents: string[];
}

/**
 * Reads `@category` and `@parent` from the JSDoc of a component's class: the comment
 * right before its `@Component(` decorator, where Stencil takes the docs tags of
 * dist/documentation.json from.
 */
export function readTaxonomy(tag: string, source: string): ComponentTaxonomy {
  const at = source.indexOf('@Component(');
  const before = at < 0 ? '' : source.slice(0, at).trimEnd();
  const jsdoc = before.endsWith('*/') ? before.slice(before.lastIndexOf('/**')) : '';
  const texts = (name: string): string[] =>
    [...jsdoc.matchAll(new RegExp(`^\\s*\\*\\s*@${name}\\s+(.+)$`, 'gm'))].map((m) => m[1].trim());
  return {
    tag,
    category: texts('category')[0],
    parents: texts('parent').flatMap((text) => text.split(/\s+/)),
  };
}

/**
 * The component a part belongs to, through the first parent of each; the tag itself
 * for a component with a category, undefined for a missing parent or a loop.
 */
export function rootOf(
  tag: string,
  byTag: Map<string, ComponentTaxonomy>,
  seen: Set<string> = new Set(),
): string | undefined {
  const entry = byTag.get(tag);
  if (!entry || seen.has(tag)) return undefined;
  if (entry.parents.length === 0) return entry.category === undefined ? undefined : tag;
  seen.add(tag);
  return rootOf(entry.parents[0], byTag, seen);
}

/**
 * What is wrong with the categories and the parents of the components, one line each:
 * neither tag or both, a category outside COMPONENT_CATEGORIES, a parent that is not a
 * component, a part whose first parents never reach a component with a category.
 */
export function taxonomyErrors(components: ComponentTaxonomy[]): string[] {
  const byTag = new Map(components.map((c) => [c.tag, c]));
  const ids: readonly string[] = COMPONENT_CATEGORIES.map((c) => c.id);
  const errors: string[] = [];
  for (const { tag, category, parents } of components) {
    if (category === undefined && parents.length === 0) {
      errors.push(`${tag}: no @category and no @parent`);
    } else if (category !== undefined && parents.length > 0) {
      errors.push(`${tag}: both @category and @parent`);
    }
    if (category !== undefined && !ids.includes(category)) {
      errors.push(`${tag}: @category ${category} is not one of ${ids.join(', ')}`);
    }
    for (const parent of parents) {
      if (!byTag.has(parent)) errors.push(`${tag}: @parent ${parent} is not a component`);
    }
    if (category === undefined && parents.length > 0 && rootOf(tag, byTag) === undefined) {
      errors.push(`${tag}: its first @parent never reaches a component with a @category`);
    }
  }
  return errors;
}

/**
 * The body of agents/components.md: a section per category, in the order of
 * COMPONENT_CATEGORIES, each component followed by its parts, each part naming the
 * components it sits in. `summaries` holds the one-line description of each component
 * listed: a component without one is left out, as before the categories.
 */
export function renderCatalogue(
  components: ComponentTaxonomy[],
  summaries: Map<string, string>,
  docsPrefix: string,
): string {
  const byTag = new Map(components.map((c) => [c.tag, c]));
  const tags = components
    .map((c) => c.tag)
    .filter((tag) => summaries.has(tag))
    .sort((a, b) => a.localeCompare(b));
  const row = (tag: string): string => {
    const parents = byTag.get(tag)?.parents ?? [];
    const part =
      parents.length > 0 ? `, part of ${parents.map((p) => `\`${p}\``).join(' or ')}` : '';
    return `| [\`${tag}\`](${docsPrefix}/${tag}/AGENTS.md)${part} | ${summaries.get(tag)} |`;
  };
  return COMPONENT_CATEGORIES.map(({ id, title, summary }) => {
    const rows = tags
      .filter((tag) => byTag.get(tag)?.category === id)
      .flatMap((tag) => [tag, ...tags.filter((t) => t !== tag && rootOf(t, byTag) === tag)])
      .map(row);
    return `## ${title}

${summary}.

| Component | What it is |
| --------- | ---------- |
${rows.join('\n')}
`;
  }).join('\n');
}

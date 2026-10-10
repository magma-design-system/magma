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

/** Folder of one component's docs inside the magma package. */
export const COMPONENT_DOCS_DIR = 'dist/collection/components';

/** From a component's docs folder back to the package root (dist/collection/components/<tag>/). */
const TO_PACKAGE_ROOT = '../../../../';

/** The shared fragments of docs/agents/ shipped as agents/<name> in every entry-point package. */
export const SHARED_FRAGMENTS = [
  'conventions.md',
  'variants.md',
  'anti-patterns.md',
  'color.md',
  'typography.md',
  'theming.md',
  'assets.md',
  'reporting.md',
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
  styles?: { name: string; docs?: string }[];
  dependencies?: string[];
  dependents?: string[];
  [key: string]: unknown;
}

function described(docs: string | undefined, deprecation?: string, required?: boolean): string {
  const parts: string[] = [];
  if (deprecation !== undefined)
    parts.push(`**Deprecated**${deprecation ? `: ${deprecation}` : ''}.`);
  if (required) parts.push('**Required**.');
  if (docs) parts.push(docs);
  return cell(parts.join(' '));
}

function section(title: string, body: string | undefined): string {
  return body ? `## ${title}\n\n${body}\n` : '';
}

/**
 * Renders a component's AGENTS.md: what it is (its usage description), then its API as
 * compact tables, with links to the pattern / antipattern files beside it and to the
 * rules shared by every component.
 */
export function renderComponentAgentsMd(component: DocsComponent, pkgVersion: string): string {
  const { tag } = component;
  const usage = component.usage ?? {};
  const description = usage['1. Description']?.trim();
  const hasPattern = !!usage['2. Pattern']?.trim();
  const hasAntipattern = !!usage['3. Antipattern']?.trim();

  const readNext = [
    hasPattern ? '[`pattern.md`](pattern.md) - correct usage, with examples' : '',
    hasAntipattern ? '[`antipattern.md`](antipattern.md) - mistakes to avoid' : '',
    `[\`conventions.md\`](${TO_PACKAGE_ROOT}agents/conventions.md), ` +
      `[\`variants.md\`](${TO_PACKAGE_ROOT}agents/variants.md), ` +
      `[\`anti-patterns.md\`](${TO_PACKAGE_ROOT}agents/anti-patterns.md) - the rules shared by every component`,
  ].filter(Boolean);

  const encapsulation =
    component.encapsulation === 'shadow'
      ? 'Shadow DOM: style it only through the CSS custom properties and parts below.'
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
  const styles = component.styles?.length
    ? table(
        ['Property', 'Description'],
        component.styles.map((s) => [`\`${s.name}\``, cell(s.docs)]),
      )
    : undefined;
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

/** A usage file (pattern / antipattern) as shipped beside the component's AGENTS.md. */
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

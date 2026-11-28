/**
 * Pure checks of the component usage docs (src/components/<tag>/usage/*.md) against
 * the built API, used by check-usage-docs.ts. Kept free of file-system side effects so
 * scripts/usage-docs-lib.spec.ts can test them directly.
 *
 * Only what is certainly wrong is reported: a tag, attribute, value, slot, part, event,
 * custom property or icon that does not exist, an `--mds-*` property that is not public
 * (scripts/style-contract-lib.ts), a colour or radius that bypasses the
 * semantic roles or the corner axis, markup that does not parse as written. The
 * INCORRECT half of the example of a mistake is wrong on purpose and is skipped.
 */
import { parseFragment, type DefaultTreeAdapterMap } from 'parse5';
import { indexPatterns, type Pattern } from '../../lint/src/core/patterns';
import {
  answersOf,
  citationsOf,
  parsePlacement,
  parseWhenToUse,
  resolveCitation,
  type UsageLine,
  type UsageProblem,
  type WhenToUse,
} from '../../lint/src/core/usage';
import { isPublic, type Visibility } from './style-contract-lib';

type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];

/** The slice of a docs-json component entry the checks read. */
export interface ApiComponent {
  tag: string;
  props: { name: string; attr?: string; values?: { type: string; value?: string }[] }[];
  events: { event: string }[];
  slots: { name: string }[];
  parts: { name: string }[];
  styles: { name: string; visibility?: Visibility }[];
}

/** Everything a usage doc is checked against. */
export interface UsageModel {
  components: Map<string, ApiComponent>;
  /** tags of the form-associated components: `name` is their native attribute */
  formAssociated: Set<string>;
  /** custom properties defined by the token layer (design-tokens, styles, Tailwind theme) */
  tokens: Set<string>;
  /** `--mds-*` set inside the component sheets without `@prop`: real, not API, so a doc naming one gets internal-css-var, not unknown-css-var */
  privateVars: Set<string>;
  icons: Set<string>;
}

export type UsageFindingKind =
  | 'emoji'
  | 'fence-without-language'
  | 'self-closing-element'
  | 'unknown-tag'
  | 'unknown-attribute'
  | 'invalid-value'
  | 'false-boolean'
  | 'unknown-slot'
  | 'unknown-part'
  | 'unknown-event'
  | 'unknown-css-var'
  | 'internal-css-var'
  | 'unknown-token'
  | 'palette-color'
  | 'raw-radius'
  | 'unknown-icon'
  | 'shadow-piercing'
  | 'dark-variant'
  | 'pref-media-query'
  | 'usage-format'
  | 'no-answer'
  | 'unknown-pattern'
  | 'unknown-rule'
  | 'not-reciprocal';

export interface UsageFinding {
  line: number;
  kind: UsageFindingKind;
  what: string;
}

export interface MarkdownBlock {
  type: 'code' | 'prose';
  /** 1-based line of the opening fence (code) or of the first line (prose) */
  line: number;
  /** the fence language, lowercased (code only) */
  lang?: string;
  text: string;
}

/**
 * Splits a markdown file into fenced code blocks and prose blocks (runs of non-blank
 * lines). Code fenced inside a list item counts as code, with the list indentation
 * removed.
 */
export function splitMarkdown(md: string): MarkdownBlock[] {
  const lines = md.split('\n');
  const blocks: MarkdownBlock[] = [];
  let prose: { line: number; lines: string[] } | null = null;
  const flush = (): void => {
    if (prose) blocks.push({ type: 'prose', line: prose.line, text: prose.lines.join('\n') });
    prose = null;
  };
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(/^(\s*)(`{3,}|~{3,})\s*([\w-]*)/);
    if (open) {
      flush();
      const [, indent, fence, lang] = open;
      const close = new RegExp(`^\\s*\\${fence[0]}{${fence.length},}\\s*$`);
      const body: string[] = [];
      let j = i + 1;
      for (; j < lines.length && !close.test(lines[j]); j++) {
        body.push(lines[j].startsWith(indent) ? lines[j].slice(indent.length) : lines[j]);
      }
      blocks.push({ type: 'code', line: i + 1, lang: lang.toLowerCase(), text: body.join('\n') });
      i = j;
      continue;
    }
    if (lines[i].trim() === '') flush();
    else (prose ??= { line: i + 1, lines: [] }).lines.push(lines[i]);
  }
  flush();
  return blocks;
}

/**
 * The 0-based lines of a code block that belong to the INCORRECT half of an example:
 * from an `INCORRECT` marker comment up to the next `CORRECT` one.
 */
export function incorrectLines(code: string): Set<number> {
  const wrong = new Set<number>();
  let inWrong = false;
  code.split('\n').forEach((line, i) => {
    if (/\bINCORRECT\b/.test(line)) inWrong = true;
    else if (/\bCORRECT\b/.test(line)) inWrong = false;
    if (inWrong) wrong.add(i);
  });
  return wrong;
}

/** Attributes any element may carry, on top of a component's own props. */
const GLOBAL_ATTR =
  /^(class|id|style|slot|title|role|tabindex|hidden|lang|dir|part|inert|autofocus|draggable|contenteditable|translate|spellcheck|is|aria-[a-z-]+|data-[a-z0-9-]+|on[a-z]+)$/;
/** Framework bindings (Angular, Vue, Alpine...) are not HTML attributes: not checked. */
const FRAMEWORK_ATTR = /^([[(*#:@]|v-)/;
const SLUG = /^(mi|mdi|mgg)\/[a-z0-9/_-]+$/;
const PALETTE_VAR = /^--(tone|variant|status)-[a-z0-9-]+$/;
const PALETTE_CLASS =
  /^(?:[a-z0-9-]+:)*(?:bg|text|border|fill|stroke|ring|outline|divide|from|via|to|shadow|decoration|accent|caret|placeholder)-(?:tone|variant|status)-/;
const TAILWIND_PALETTE_CLASS =
  /^(?:[a-z0-9-]+:)*(?:bg|text|border)-(?:white|black|gray|slate|zinc|neutral|stone|red|blue|green|yellow)(?:-\d+)?$/;

function propOf(c: ApiComponent, attr: string): ApiComponent['props'][number] | undefined {
  return c.props.find((p) => p.attr === attr || p.name === attr || p.attr === attr.toLowerCase());
}

/**
 * A template literal type as a pattern, `${number}x${number}` matching `17x24`: Stencil lists it
 * as the type of a value that has no value of its own
 */
function templatePattern(type: string): RegExp | null {
  const literal = /^`(.*)`$/.exec(type);
  if (literal === null) return null;
  const source = literal[1]
    .split(/(\$\{(?:number|string)\})/)
    .map((piece) => {
      if (piece === '${number}') return '-?\\d+(?:\\.\\d+)?';
      if (piece === '${string}') return '.*';
      return piece.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('');
  return new RegExp(`^${source}$`);
}

/**
 * The allowed string values of a prop, the literals and the template literal types, or null
 * when it accepts any string.
 */
function enumValues(
  p: ApiComponent['props'][number],
): { listed: string[]; patterns: { type: string; pattern: RegExp }[] } | null {
  const values = p.values ?? [];
  if (values.some((v) => v.type === 'string' && v.value === undefined)) return null;
  const listed = values
    .filter((v) => v.type === 'string' && v.value !== undefined)
    .map((v) => v.value!);
  const patterns = values
    .filter((v) => v.value === undefined)
    .flatMap((v) => {
      const pattern = templatePattern(v.type);
      return pattern === null ? [] : [{ type: v.type, pattern }];
    });
  return listed.length || patterns.length ? { listed, patterns } : null;
}

function isBoolean(p: ApiComponent['props'][number]): boolean {
  return (p.values ?? []).every((v) => v.type === 'boolean' || v.type === 'undefined');
}

class UsageChecker {
  readonly findings: UsageFinding[] = [];
  /** the custom properties the components promise: the only `--mds-*` a doc may name */
  private readonly publicVars: Set<string>;
  /** documented, but internal: they may change in any release */
  private readonly internalVars: Set<string>;
  private readonly allEvents: Set<string>;
  /** custom properties the doc itself declares (an example defining its own token) */
  private readonly docVars = new Set<string>();

  constructor(private readonly model: UsageModel) {
    const styles = [...model.components.values()].flatMap((c) => c.styles);
    this.publicVars = new Set(styles.filter(isPublic).map((s) => s.name));
    this.internalVars = new Set(styles.filter((s) => !isPublic(s)).map((s) => s.name));
    this.allEvents = new Set(
      [...model.components.values()].flatMap((c) => c.events.map((e) => e.event)),
    );
  }

  add(line: number, kind: UsageFindingKind, what: string): void {
    this.findings.push({ line, kind, what });
  }

  collectDocVars(blocks: MarkdownBlock[]): void {
    for (const b of blocks) {
      if (b.type !== 'code') continue;
      for (const m of b.text.matchAll(/(--[\w-]+)\s*:/g))
        if (!m[1].startsWith('--mds-')) this.docVars.add(m[1]);
    }
  }

  /** A doc names only public `--mds-*`: an internal or private one is real, but not promised. */
  checkComponentVar(name: string, line: number): void {
    if (this.publicVars.has(name)) return;
    if (this.internalVars.has(name) || this.model.privateVars.has(name))
      this.add(line, 'internal-css-var', name);
    else this.add(line, 'unknown-css-var', name);
  }

  checkVarName(name: string, line: number): void {
    if (name.startsWith('--mds-')) {
      this.checkComponentVar(name, line);
      return;
    }
    if (!this.model.tokens.has(name) && !this.docVars.has(name))
      this.add(line, 'unknown-token', name);
    else if (PALETTE_VAR.test(name)) this.add(line, 'palette-color', name);
    else if (name.startsWith('--radius-')) this.add(line, 'raw-radius', name);
  }

  checkCss(css: string, firstLine: number, wrong: Set<number>): void {
    css.split('\n').forEach((text, i) => {
      if (wrong.has(i)) return;
      const line = firstLine + i;
      for (const m of text.matchAll(/(--mds-[\w-]+)\s*:/g)) this.checkVarName(m[1], line);
      for (const m of text.matchAll(/var\(\s*(--[\w-]+)/g)) this.checkVarName(m[1], line);
      for (const m of text.matchAll(/(mds-[a-z0-9-]+)::part\(\s*([a-z0-9-]+)\s*\)/g)) {
        const c = this.model.components.get(m[1]);
        if (c && !c.parts.some((p) => p.name === m[2]))
          this.add(line, 'unknown-part', `${m[1]}::part(${m[2]})`);
      }
      if (/>>>|\/deep\/|::v-deep|::ng-deep/.test(text))
        this.add(line, 'shadow-piercing', text.trim());
      if (/prefers-(color-scheme|contrast|reduced-motion)/.test(text))
        this.add(line, 'pref-media-query', text.trim());
    });
  }

  checkJs(js: string, firstLine: number, wrong: Set<number>): void {
    js.split('\n').forEach((text, i) => {
      if (wrong.has(i)) return;
      const line = firstLine + i;
      for (const m of text.matchAll(/addEventListener\(\s*['"`](mds[A-Z]\w*)['"`]/g)) {
        if (!this.allEvents.has(m[1])) this.add(line, 'unknown-event', m[1]);
      }
      for (const m of text.matchAll(/\bon(Mds[A-Z]\w*)\b/g)) {
        const event = m[1][0].toLowerCase() + m[1].slice(1);
        if (!this.allEvents.has(event)) this.add(line, 'unknown-event', event);
      }
      for (const m of text.matchAll(/['"`]((?:mi|mdi|mgg)\/[a-z0-9/_-]+)['"`]/g)) {
        if (!this.model.icons.has(m[1])) this.add(line, 'unknown-icon', m[1]);
      }
    });
  }

  checkClasses(value: string, line: number): void {
    for (const cls of value.split(/\s+/).filter(Boolean)) {
      if (PALETTE_CLASS.test(cls)) this.add(line, 'palette-color', cls);
      else if (TAILWIND_PALETTE_CLASS.test(cls)) this.add(line, 'palette-color', cls);
      else if (/(^|:)dark:/.test(cls)) this.add(line, 'dark-variant', cls);
    }
  }

  checkIconValue(attr: string, value: string, line: number): void {
    if (SLUG.test(value)) {
      if (!this.model.icons.has(value)) this.add(line, 'unknown-icon', `${attr}="${value}"`);
    } else if (value && !/^(<svg|data:|https?:|\/)|[{}]/.test(value)) {
      // not a slug, not inline markup, not a URL or a path, not a framework binding
      this.add(line, 'unknown-icon', `${attr}="${value}"`);
    }
  }

  checkHtml(html: string, firstLine: number, wrong: Set<number>): void {
    html.split('\n').forEach((text, i) => {
      if (wrong.has(i)) return;
      for (const m of text.matchAll(/<(mds-[a-z0-9-]+)\b[^>]*\/>/g)) {
        this.add(firstLine + i, 'self-closing-element', `<${m[1]} ... />`);
      }
    });
    const fragment = parseFragment(html, { sourceCodeLocationInfo: true });
    const visit = (node: Node, parent: Element | null): void => {
      if (!('tagName' in node)) return;
      const el = node as Element;
      const loc = el.sourceCodeLocation;
      const startLine = loc ? loc.startLine - 1 : 0;
      if (el.tagName === 'style' || el.tagName === 'script') {
        const body = el.childNodes.map((n) => ('value' in n ? n.value : '')).join('');
        const offset = startLine;
        const inner = new Set([...wrong].map((w) => w - offset).filter((w) => w >= 0));
        if (el.tagName === 'style') this.checkCss(body, firstLine + offset, inner);
        else this.checkJs(body, firstLine + offset, inner);
        return;
      }
      if (!wrong.has(startLine)) this.checkElement(el, parent, firstLine, wrong);
      const children =
        el.tagName === 'template'
          ? (el as DefaultTreeAdapterMap['template']).content.childNodes
          : el.childNodes;
      for (const child of children) visit(child, el);
    };
    for (const child of fragment.childNodes) visit(child, null);
  }

  private checkElement(
    el: Element,
    parent: Element | null,
    firstLine: number,
    wrong: Set<number>,
  ): void {
    const loc = el.sourceCodeLocation;
    const lineOf = (attr: string): number =>
      (loc?.attrs?.[attr]?.startLine ?? loc?.startLine ?? 1) - 1;
    const tag = el.tagName;
    const component = tag.startsWith('mds-') ? this.model.components.get(tag) : undefined;
    if (tag.startsWith('mds-') && !component) this.add(firstLine + lineOf(''), 'unknown-tag', tag);
    for (const { name, value } of el.attrs) {
      const rel = lineOf(name);
      if (wrong.has(rel)) continue;
      const line = firstLine + rel;
      if (name === 'class') {
        this.checkClasses(value, line);
        continue;
      }
      if (name === 'style') {
        for (const m of value.matchAll(/var\(\s*(--[\w-]+)/g)) this.checkVarName(m[1], line);
        continue;
      }
      if (name === 'slot') {
        const host =
          parent && parent.tagName.startsWith('mds-')
            ? this.model.components.get(parent.tagName)
            : undefined;
        if (host && !host.slots.some((s) => s.name === value)) {
          this.add(line, 'unknown-slot', `<${parent!.tagName}> has no slot "${value}"`);
        }
        continue;
      }
      if (name === 'icon' || (tag === 'mds-icon' && name === 'name'))
        this.checkIconValue(name, value, line);
      else if (SLUG.test(value) && !this.model.icons.has(value))
        this.add(line, 'unknown-icon', `${name}="${value}"`);
      if (!component || FRAMEWORK_ATTR.test(name)) continue;
      const prop = propOf(component, name);
      if (!prop) {
        const native =
          GLOBAL_ATTR.test(name) || (name === 'name' && this.model.formAssociated.has(tag));
        if (!native) this.add(line, 'unknown-attribute', `<${tag} ${name}>`);
        continue;
      }
      if (isBoolean(prop) && value === 'false')
        this.add(line, 'false-boolean', `<${tag} ${name}="false">`);
      const allowed = enumValues(prop);
      if (
        allowed &&
        value !== '' &&
        !/[{}]/.test(value) &&
        !allowed.listed.includes(value) &&
        !allowed.patterns.some(({ pattern }) => pattern.test(value))
      ) {
        const names = [...allowed.listed, ...allowed.patterns.map(({ type }) => type)];
        this.add(
          line,
          'invalid-value',
          `<${tag} ${name}="${value}"> (allowed: ${names.join(', ')})`,
        );
      }
    }
  }

  checkProse(text: string, firstLine: number): void {
    text.split('\n').forEach((t, i) => {
      const line = firstLine + i;
      for (const m of t.matchAll(/`([^`]+)`/g)) {
        const code = m[1].trim();
        const tag = code.match(/^<?\/?(mds-[a-z0-9-]+)>?$/)?.[1];
        if (tag && !this.model.components.has(tag)) this.add(line, 'unknown-tag', tag);
        if (SLUG.test(code) && !this.model.icons.has(code)) this.add(line, 'unknown-icon', code);
        for (const v of code.matchAll(/(--[\w-]+)/g)) {
          const name = v[1];
          // prefixes and families named in prose (`--mds-avatar-*`, `--magma-<hue>-*`) are not names
          if (
            name.endsWith('-') ||
            /[*<]/.test(code.slice(v.index! + name.length, v.index! + name.length + 1))
          )
            continue;
          if (name.startsWith('--mds-')) this.checkComponentVar(name, line);
          else if (
            /^--(magma|tone|variant|status|label|brand|radius|shadow|spacing|font)-/.test(name)
          ) {
            if (!this.model.tokens.has(name)) this.add(line, 'unknown-token', name);
          }
        }
      }
    });
  }
}

/**
 * Fence languages that only the shared guides use, for commands, configuration and prompts:
 * no component markup in them to check.
 */
const GUIDE_ONLY_LANGS = new Set(['bash', 'json', 'markdown', 'text']);

/**
 * Checks one usage doc; the findings carry the 1-based line in the file. A shared guide of
 * docs/agents/ (`guide`) also installs, configures and prompts, so its commands, JSON and
 * prompts are fenced too, and its TypeScript can be spelled out.
 */
export function checkUsageDoc(md: string, model: UsageModel, guide = false): UsageFinding[] {
  const checker = new UsageChecker(model);
  md.split('\n').forEach((text, i) => {
    const emoji = [...text.matchAll(/\p{Extended_Pictographic}/gu)].map((m) => m[0]);
    if (emoji.length) checker.add(i + 1, 'emoji', [...new Set(emoji)].join(' '));
  });
  const blocks = splitMarkdown(md);
  checker.collectDocVars(blocks);
  for (const b of blocks) {
    if (b.type === 'prose') {
      checker.checkProse(b.text, b.line);
      continue;
    }
    const first = b.line + 1;
    const wrong = incorrectLines(b.text);
    if (b.lang === 'html') checker.checkHtml(b.text, first, wrong);
    else if (b.lang === 'css') checker.checkCss(b.text, first, wrong);
    else if (
      b.lang === 'js' ||
      b.lang === 'javascript' ||
      b.lang === 'ts' ||
      b.lang === 'tsx' ||
      (guide && b.lang === 'typescript')
    )
      checker.checkJs(b.text, first, wrong);
    else if (!guide || !GUIDE_ONLY_LANGS.has(b.lang ?? ''))
      checker.add(b.line, 'fence-without-language', b.text.split('\n')[0].slice(0, 60));
  }
  return checker.findings.sort((a, b) => a.line - b.line);
}

/** The intro every component readme carries under its title, above the generated part. */
export const README_INTRO =
  "This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.";

/**
 * The hand-written text of a component readme: what sits above Stencil's
 * `<!-- Auto Generated Below -->` besides the title and the generic intro. The usage files
 * are the only hand-authored docs of a component (docs/COMPONENTS.md); a readme section
 * reaches nobody but the readers of the `readme` field of dist/documentation.json, where
 * it went stale or repeated the usage docs (#842). Empty for a clean readme.
 */
export function handWrittenReadme(tag: string, readme: string): string {
  const marker = readme.indexOf('<!-- Auto Generated Below -->');
  const head = marker === -1 ? readme : readme.slice(0, marker);
  return head
    .replace(new RegExp(`^# ${tag}[ \\t]*$`, 'm'), '')
    .replace(README_INTRO, '')
    .trim();
}

/** The members of a docs-json component entry, each with the description it ships. */
export interface DescribedComponent {
  tag: string;
  props: { name: string; docs: string }[];
  events: { event: string; docs: string }[];
  methods: { name: string; docs: string }[];
  slots: { name: string; docs: string }[];
  parts: { name: string; docs: string }[];
  styles: { name: string; docs: string }[];
}

/**
 * The members of a component that ship without a description, named as in magma.api.txt
 * (`prop size`, `part label`, `slot (default)`). The JSDoc of a member is its only line in the
 * readme, in the shipped AGENTS.md and in documentation.json, which consumers and their agents
 * read as the API. Stencil lists every part that render() sets, with or without an `@part`; and
 * an `@part` or `@slot` outside the JSDoc right above `@Component` (a plain `/*` comment, or a
 * block above another declaration) never reaches the docs (#829). Empty when all are described.
 */
export function undescribedMembers(c: DescribedComponent): string[] {
  return membersWhose(c, (docs) => docs.trim() === '');
}

// an HTML tag: `<input>`, `</a>`, `<mds-text variant="info">`
const HTML_TAG = /<\/?[a-z][a-z0-9-]*(\s[^<>]*)?\/?>/;
const INLINE_CODE = /`[^`]*`/g;

/**
 * The members whose description writes an HTML tag outside inline code, named as in
 * magma.api.txt. Whatever reads the description as Markdown takes the tag for markup: GitHub
 * drops it from the AGENTS.md table ("the name of an  element"), the docs site rendered a real
 * text field inside its API table (#1036). Written as code, `` `<input>` ``, it reads as text.
 */
export function rawHtmlMembers(c: DescribedComponent): string[] {
  return membersWhose(c, (docs) => HTML_TAG.test(docs.replace(INLINE_CODE, '')));
}

// the members whose description `test` picks, named as in magma.api.txt
function membersWhose(c: DescribedComponent, test: (docs: string) => boolean): string[] {
  const picked = (m: { docs: string }) => test(m.docs ?? '');
  return [
    ...c.props.filter(picked).map((m) => `prop ${m.name}`),
    ...c.events.filter(picked).map((m) => `event ${m.event}`),
    ...c.methods.filter(picked).map((m) => `method ${m.name}`),
    ...c.slots.filter(picked).map((m) => `slot ${m.name || '(default)'}`),
    ...c.parts.filter(picked).map((m) => `part ${m.name}`),
    ...c.styles.filter(picked).map((m) => `css ${m.name}`),
  ];
}

/* ---- the need and the place (epic #1579) -------------------------------------------- */

/**
 * What `4. When to use.md` and `5. Placement context.md` are checked against: the components of
 * the build, the patterns of docs/agents/patterns/, and the names of the API that a code span may
 * be without being an answer (apiNamesOf).
 */
export interface NeedModel {
  tags: ReadonlySet<string>;
  patterns: Pattern[];
  /** attribute names, enumerated values, slots and parts of every component of the build */
  apiNames: ReadonlySet<string>;
}

/**
 * The names of the API a code span of a usage file may be without naming a component or a
 * pattern: every attribute, enumerated value, slot and part of the build (`hide-backdrop`,
 * `top-right`, `action-close`), and the global attributes of HTML.
 */
export function apiNamesOf(components: Iterable<ApiComponent>): Set<string> {
  const names = new Set<string>();
  for (const c of components) {
    for (const p of c.props) {
      if (p.attr) names.add(p.attr);
      for (const v of p.values ?? []) if (v.value !== undefined) names.add(v.value);
    }
    for (const slot of c.slots) if (slot.name) names.add(slot.name);
    for (const part of c.parts) names.add(part.name);
  }
  return names;
}

/** kebab-case with at least one hyphen: the form of most pattern ids, `confirm-action` */
const HYPHENATED_ID = /^[a-z0-9]+(?:-[a-z0-9]+)+$/;

const formatFindings = (problems: UsageProblem[]): UsageFinding[] =>
  problems.map(({ line, message }) => ({ line, kind: 'usage-format', what: message }));

/** the citations of a line, `pattern/id`, that name no pattern, or nothing inside the pattern */
function citationFindings(lines: UsageLine[], patterns: Pattern[]): UsageFinding[] {
  const { byId, aliases } = indexPatterns(patterns);
  return lines.flatMap((line) =>
    citationsOf(line).flatMap(({ from, id }): UsageFinding[] => {
      const cited = `${from}/${id}`;
      if (!byId.has(from)) {
        const renamed = aliases.get(from);
        const what = renamed
          ? `${cited}: ${from} is now ${renamed}`
          : `${cited}: no pattern ${from} in docs/agents/patterns/`;
        return [{ line: line.line, kind: 'unknown-rule', what }];
      }
      return resolveCitation(patterns, from, id)
        ? []
        : [
            {
              line: line.line,
              kind: 'unknown-rule',
              what: `${cited}: ${from} has no rule, case or region ${id} of its own`,
            },
          ];
    }),
  );
}

/**
 * The checks of `4. When to use.md` (SPEC.md, "Per-component usage docs"): the two headings in
 * their order with only list items under them (`usage-format`, the parser of the lint core);
 * every `Not for` line with its colon and at least one answer, a component of the build, a pattern
 * or `gap` (`no-answer`); a code span after the colon in the form of a pattern id that is no
 * pattern, nor a name of the API (`unknown-pattern`); every `pattern/id` it cites names a rule, a
 * case or a region (`unknown-rule`). An `mds-*` the build does not have is `unknown-tag`, from
 * checkUsageDoc, which reads every usage file. Only what is certainly wrong: a single word in code
 * (`href`, `multiple`) may be an attribute, so only a hyphenated name, or an id a pattern left
 * behind when it was renamed, is reported as a pattern that does not exist.
 */
export function whenToUseFindings(md: string, model: NeedModel): UsageFinding[] {
  const parsed = parseWhenToUse(md);
  const { byId, aliases } = indexPatterns(model.patterns);
  const known = { tags: model.tags, patterns: new Set(byId.keys()) };
  const findings = formatFindings(parsed.problems);
  for (const line of parsed.notFor) {
    // a line with no colon has its problem already, and no candidate
    if (!line.text.includes(': ')) continue;
    if (!answersOf(line, known).length)
      findings.push({
        line: line.line,
        kind: 'no-answer',
        what: 'no component, pattern or `gap` after the colon',
      });
    for (const code of line.codes) {
      if (code === 'gap' || code.startsWith('mds-') || known.patterns.has(code)) continue;
      if (model.tags.has(code) || model.apiNames.has(code)) continue;
      const renamed = aliases.get(code);
      if (renamed)
        findings.push({
          line: line.line,
          kind: 'unknown-pattern',
          what: `${code} is now ${renamed}`,
        });
      else if (HYPHENATED_ID.test(code))
        findings.push({
          line: line.line,
          kind: 'unknown-pattern',
          what: `${code}: no pattern of docs/agents/patterns/ has this id, nor is it a name of the API`,
        });
    }
  }
  findings.push(...citationFindings([...parsed.useFor, ...parsed.notFor], model.patterns));
  return findings.sort((a, b) => a.line - b.line);
}

/**
 * The checks of `5. Placement context.md`: only the five headings, in their order, each a list,
 * and no "In the patterns", which the build writes (`usage-format`); every `pattern/id` it cites
 * names a pattern and a rule, a case or a region inside it (`unknown-rule`).
 */
export function placementFindings(md: string, model: Pick<NeedModel, 'patterns'>): UsageFinding[] {
  const parsed = parsePlacement(md);
  return [
    ...formatFindings(parsed.problems),
    ...citationFindings(
      parsed.sections.flatMap((one) => one.lines),
      model.patterns,
    ),
  ].sort((a, b) => a.line - b.line);
}

/**
 * The words a need is compared by: lowercase words of three letters or more, the inline code left
 * out, the stop words and the words every need is written with (`person`, `must`) dropped, each
 * reduced to a light stem (plural, `-ing`, `-ed`, a final `e`), so that `narrowing` and `narrow`,
 * `steps` and `step`, `choose` and `choosing` meet. Each once, in the order of the text.
 */
export function needWords(text: string): string[] {
  const words = text
    .replace(/`[^`]*`/g, ' ')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word))
    .map(stem);
  return [...new Set(words)];
}

/** a light stem: plural, `-ing`, `-ed`, then a final `e` */
function stem(word: string): string {
  let w = word;
  if (w.length > 4 && w.endsWith('ies')) w = `${w.slice(0, -3)}y`;
  else if (w.length > 4 && /(?:s|x|z|ch|sh)es$/.test(w)) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith('s') && !/(?:ss|us|is)$/.test(w)) w = w.slice(0, -1);
  else if (w.length > 5 && w.endsWith('ing')) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith('ed')) w = w.slice(0, -2);
  if (w.length > 3 && w.endsWith('e')) w = w.slice(0, -1);
  return w;
}

/**
 * English function words, and the words of the format every need is written with ("The person
 * must ..."): they would make any two needs meet.
 */
const STOP_WORDS = new Set(
  (
    'the and but not nor for with from into onto out off over under about above below between ' +
    'among within without before after during through per via than then that this these those ' +
    'there their they them its his her our your you who whom whose which what when where while ' +
    'why how all any each every both few many much more most other another same such some own ' +
    'only also just very too can may might must should would will shall does did done doing has ' +
    'have had having are was were been being one two three person people user users need needs ' +
    'needing'
  ).split(' '),
);

/** How many words a `Not for` need must share with one `Use it for` line of the component it names. */
export const RECIPROCITY_SHARED_WORDS = 2;

/** A `Not for` of one component that the component it names does not take among its needs. */
export interface ReciprocityFailure {
  /** the component whose `Not for` line it is */
  tag: string;
  line: number;
  need: string;
  /** the component the line names, which has its own `4. When to use.md` */
  answer: string;
  words: string[];
  /** each `Use it for` line of the answer, with the words it shares */
  against: { line: number; text: string; shared: string[] }[];
}

/**
 * Reciprocity (SPEC.md): a `Not for` of A that names B, where B has its own `4. When to use.md`,
 * finds its need among the `Use it for` lines of B, or one of the two files is wrong: A sends the
 * agent to B for a need B does not say it answers. The need (the text before the first `: `) and
 * one `Use it for` line of B must share RECIPROCITY_SHARED_WORDS words (needWords): one word in
 * common is chance ("time", "move"); two place the need. A line naming A itself is left out.
 */
export function reciprocityFailures(
  files: ReadonlyMap<string, WhenToUse>,
  model: Pick<NeedModel, 'tags' | 'patterns'>,
): ReciprocityFailure[] {
  const known = { tags: model.tags, patterns: new Set(model.patterns.map((one) => one.id)) };
  const failures: ReciprocityFailure[] = [];
  for (const [tag, file] of [...files].sort(([a], [b]) => a.localeCompare(b))) {
    for (const line of file.notFor) {
      const words = needWords(line.need);
      for (const answer of answersOf(line, known)) {
        const other = answer.kind === 'component' ? files.get(answer.id) : undefined;
        if (!other || answer.id === tag) continue;
        const against = other.useFor.map((use) => {
          const theirs = new Set(needWords(use.text));
          return { line: use.line, text: use.text, shared: words.filter((w) => theirs.has(w)) };
        });
        if (!against.some((one) => one.shared.length >= RECIPROCITY_SHARED_WORDS))
          failures.push({
            tag,
            line: line.line,
            need: line.need,
            answer: answer.id,
            words,
            against,
          });
      }
    }
  }
  return failures;
}

/** A reciprocity failure as a finding on the `Not for` line, with the words compared. */
export function reciprocityFinding(failure: ReciprocityFailure): UsageFinding {
  const lines = failure.against
    .map(({ line, shared }) => `line ${line} [${shared.join(', ')}]`)
    .join(', ');
  return {
    line: failure.line,
    kind: 'not-reciprocal',
    what:
      `${failure.answer} takes no such need among its Use it for lines ` +
      `(${RECIPROCITY_SHARED_WORDS} words in common with one of them): ` +
      `the need [${failure.words.join(', ')}]; its lines ${lines}`,
  };
}

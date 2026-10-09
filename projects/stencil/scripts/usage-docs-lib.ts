/**
 * Pure checks of the component usage docs (src/components/<tag>/usage/*.md) against
 * the built API, used by check-usage-docs.ts. Kept free of file-system side effects so
 * scripts/usage-docs-lib.spec.ts can test them directly.
 *
 * Only what is certainly wrong is reported: a tag, attribute, value, slot, part, event,
 * custom property or icon that does not exist, a colour or radius that bypasses the
 * semantic roles or the corner axis, markup that does not parse as written. The
 * INCORRECT half of an antipattern example is wrong on purpose and is skipped.
 */
import { parseFragment, type DefaultTreeAdapterMap } from 'parse5';

type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];

/** The slice of a docs-json component entry the checks read. */
export interface ApiComponent {
  tag: string;
  props: { name: string; attr?: string; values?: { type: string; value?: string }[] }[];
  events: { event: string }[];
  slots: { name: string }[];
  parts: { name: string }[];
  styles: { name: string }[];
}

/** Everything a usage doc is checked against. */
export interface UsageModel {
  components: Map<string, ApiComponent>;
  /** tags of the form-associated components: `name` is their native attribute */
  formAssociated: Set<string>;
  /** custom properties defined by the token layer (design-tokens, styles, Tailwind theme) */
  tokens: Set<string>;
  /** `--mds-*` set inside the component sheets without `@prop`: real, not API */
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
  | 'unknown-token'
  | 'palette-color'
  | 'raw-radius'
  | 'unknown-icon'
  | 'shadow-piercing'
  | 'dark-variant'
  | 'pref-media-query';

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

/** The allowed string values of a prop, or null when it accepts any string. */
function enumValues(p: ApiComponent['props'][number]): string[] | null {
  const values = p.values ?? [];
  if (values.some((v) => v.type === 'string' && v.value === undefined)) return null;
  const listed = values
    .filter((v) => v.type === 'string' && v.value !== undefined)
    .map((v) => v.value!);
  return listed.length ? listed : null;
}

function isBoolean(p: ApiComponent['props'][number]): boolean {
  return (p.values ?? []).every((v) => v.type === 'boolean' || v.type === 'undefined');
}

class UsageChecker {
  readonly findings: UsageFinding[] = [];
  private readonly documentedVars: Set<string>;
  private readonly allEvents: Set<string>;
  /** custom properties the doc itself declares (an example defining its own token) */
  private readonly docVars = new Set<string>();

  constructor(private readonly model: UsageModel) {
    this.documentedVars = new Set(
      [...model.components.values()].flatMap((c) => c.styles.map((s) => s.name)),
    );
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

  checkVarName(name: string, line: number): void {
    if (name.startsWith('--mds-')) {
      if (!this.documentedVars.has(name) && !this.model.privateVars.has(name)) {
        this.add(line, 'unknown-css-var', name);
      }
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
      if (allowed && value !== '' && !/[{}]/.test(value) && !allowed.includes(value)) {
        this.add(
          line,
          'invalid-value',
          `<${tag} ${name}="${value}"> (allowed: ${allowed.join(', ')})`,
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
          if (name.startsWith('--mds-')) {
            if (!this.documentedVars.has(name) && !this.model.privateVars.has(name))
              this.add(line, 'unknown-css-var', name);
          } else if (
            /^--(magma|tone|variant|status|label|brand|radius|shadow|spacing|font)-/.test(name)
          ) {
            if (!this.model.tokens.has(name)) this.add(line, 'unknown-token', name);
          }
        }
      }
    });
  }
}

/** Checks one usage doc; the findings carry the 1-based line in the file. */
export function checkUsageDoc(md: string, model: UsageModel): UsageFinding[] {
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
    else if (b.lang === 'js' || b.lang === 'javascript' || b.lang === 'ts' || b.lang === 'tsx')
      checker.checkJs(b.text, first, wrong);
    else checker.add(b.line, 'fence-without-language', b.text.split('\n')[0].slice(0, 60));
  }
  return checker.findings.sort((a, b) => a.line - b.line);
}

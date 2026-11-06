/**
 * Context hints for the background decisions of category L: which surface role
 * the ELEMENT probably is, read from where the class sits (its tag, its `role`,
 * the components around it, the other classes on it). The colour alone cannot
 * tell a page from a card from a popover; the markup often can.
 *
 * A hint is only ever reported, never written: it groups the places of a
 * decision in the Markdown report ("Likely `bg-surface-overlay`: inside
 * `<MdsModal>`") so the reader confirms a batch instead of judging each site.
 *
 * Surface-independent: each surface builds an {@link ElementContext} from its
 * own tree and hands it to category L (`SemanticHooks.element`), which turns
 * the role into a hint with its distance (semantic-ops.ts).
 */
/** One element as the hint rules see it. Tags as written (`div`, `MdsModal`, `mds-modal`). */
export interface ElementNode {
  tag: string;
  /** The `role` attribute, when it is a literal. */
  role?: string;
}

export interface ElementContext extends ElementNode {
  /** The enclosing elements, nearest first. */
  ancestors: ElementNode[];
  /** Every class token of the element's class attribute, variants included. */
  classes: string[];
}

export type SurfaceRole = 'sunken' | 'default' | 'raised' | 'overlay';

const OVERLAY_ROLES = new Set(['dialog', 'alertdialog', 'menu', 'listbox', 'tooltip']);
/** Component names of floating layers, PascalCase or kebab-case (`MdsModal`, `mds-modal`). */
const OVERLAY_TAG = /(?:modal|dialog|drawer|popover|dropdown|menu|tooltip|sheet|toast)$/i;
const CARD_TAG = /(?:card|panel)$/i;
const PAGE_TAGS = new Set(['body', 'html', 'main']);
const WELL_TAGS = new Set(['code', 'pre', 'kbd']);
const SECTION_TAG = /^section$/i;

/** The utility of a class token: variants (`hover:`, `dark:`) and modifier dropped. */
const utilityOf = (token: string): string =>
  token
    .slice(token.lastIndexOf(':') + 1)
    .replace(/^!/, '')
    .replace(/\/[\d.]+$/, '');

const tagText = (tag: string): string => `\`<${tag}>\``;

/** The surface role the element probably is, and why; undefined when nothing tells. */
export const surfaceHint = (el: ElementContext): { role: SurfaceRole; why: string } | undefined => {
  const tag = el.tag;
  const lower = tag.toLowerCase();
  if (PAGE_TAGS.has(lower)) return { role: 'default', why: `on ${tagText(tag)}` };
  if (WELL_TAGS.has(lower)) return { role: 'sunken', why: `on ${tagText(tag)}` };
  if (el.role && OVERLAY_ROLES.has(el.role))
    return { role: 'overlay', why: `\`role="${el.role}"\`` };
  if (OVERLAY_TAG.test(tag)) return { role: 'overlay', why: `on ${tagText(tag)}` };
  if (CARD_TAG.test(tag)) return { role: 'raised', why: `on ${tagText(tag)}` };

  const utilities = el.classes.map(utilityOf);
  const shadow = el.classes.find((c) => {
    const u = utilityOf(c);
    return /^shadow(?:-|$)/.test(u) && u !== 'shadow-none' && !u.startsWith('shadow-ring');
  });
  const floating = utilities.find((u) => u === 'fixed' || u === 'absolute');
  if (floating && shadow) return { role: 'overlay', why: `\`${floating}\` with \`${shadow}\`` };
  if (utilities.includes('sticky')) return { role: 'raised', why: '`sticky`' };

  for (const a of el.ancestors) {
    if (a.role && OVERLAY_ROLES.has(a.role))
      return { role: 'overlay', why: `inside \`role="${a.role}"\`` };
    if (OVERLAY_TAG.test(a.tag)) return { role: 'overlay', why: `inside ${tagText(a.tag)}` };
  }
  if (shadow) return { role: 'raised', why: `with \`${shadow}\`` };
  if (SECTION_TAG.test(tag)) return { role: 'default', why: `on ${tagText(tag)}` };
  for (const a of el.ancestors)
    if (CARD_TAG.test(a.tag)) return { role: 'raised', why: `inside ${tagText(a.tag)}` };
  return undefined;
};

/** A component (`MdsModal`, `mds-modal`) or an element with a role: worth naming as a place. */
const isLandmark = (n: ElementNode): boolean =>
  /^[A-Z]/.test(n.tag) || n.tag.includes('-') || n.role !== undefined || PAGE_TAGS.has(n.tag);

const nodeText = (n: ElementNode): string => `\`<${n.tag}${n.role ? ` role="${n.role}"` : ''}>\``;

/**
 * Where a class sits, as Markdown: its element and the nearest named element
 * around it, ``on `<div>` inside `<MdsModal>` ``. Printed next to every
 * occurrence in the report, hint or not.
 */
export const describeElement = (el: ElementContext): string => {
  const around = el.ancestors.find(isLandmark);
  return `on ${nodeText(el)}${around ? ` inside ${nodeText(around)}` : ''}`;
};

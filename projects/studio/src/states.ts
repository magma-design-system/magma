import type { ComponentAxes } from '../magma-api.js';
import { COMPONENTS, TONES, type Painted } from './paints.js';

/*
  The states of a colour beside a contrast scale (scales.tsx, #1308): the components the sample
  family paints (paints.ts) at every tone they publish, in a page of their own (states.html)
  painted with the family solved on the scale, so the scale is judged on them while it is edited.

  What is shown, and where each choice is read:
  - the variant: the first the family paints, its own before the accents it backs and those
    before the neutral ones of its theme (paints.ts);
  - the components: the action and the message of the variant, mds-button and mds-banner, the
    two the person asked for (#1308); a variant neither takes, a label, shows the markers of a
    category, mds-badge and mds-label (docs/agents/variants.md: a label is for "Categories, tags");
  - the tones: those each component takes in the documentation.json of the installed magma
    (magma-api.ts), from the most to the least emphasis as the guide orders them;
  - the states of the action: the props mds-button publishes for them (magma.api.txt: `active`
    while pressed, `current` for the action of the view you are in, `disabled`), and the hover,
    which no prop gives: its :hover rules are copied under an attribute (forceHover).
*/

/** A component shown, with the tones it takes. */
export interface Shown {
  tag: string;
  tones: string[];
}

/** What the page shows for a family: a variant and the components that paint it. */
export interface StatesPlan {
  variant: string;
  action?: Shown;
  message?: Shown;
  markers: Shown[];
}

/** The states of an action and the attribute that gives each (magma.api.txt, mds-button). */
export const ACTION_STATES: ReadonlyArray<{ label: string; attribute?: string }> = [
  { label: 'Rest' },
  { label: 'Hover', attribute: 'data-studio-hover' },
  { label: 'Pressed', attribute: 'active' },
  { label: 'Selected', attribute: 'current' },
  { label: 'Disabled', attribute: 'disabled' },
];

/** The tones a component takes, in the order of the guide; a tone it alone has goes last. */
const tonesOf = (component: ComponentAxes): string[] => {
  const takes = component.tone?.values ?? [];
  return [
    ...TONES.filter((tone) => takes.includes(tone)),
    ...takes.filter((tone) => !TONES.includes(tone)),
  ];
};

/** The plan of the page for what a family paints; none when it paints no variant. */
export function statesPlan(
  painted: Painted,
  components: readonly ComponentAxes[] = COMPONENTS,
): StatesPlan | undefined {
  const variant = painted.variants[0]?.variant;
  if (!variant) return undefined;
  const taking = (tag: string): Shown | undefined => {
    const component = components.find((one) => one.tag === tag);
    return component?.variant?.values.includes(variant)
      ? { tag, tones: tonesOf(component) }
      : undefined;
  };
  const action = taking('mds-button');
  const message = taking('mds-banner');
  const markers =
    action || message
      ? []
      : ['mds-badge', 'mds-label'].map(taking).filter((one): one is Shown => one !== undefined);
  return { variant, action, message, markers };
}

const escape = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

/** The markup of the page for a plan: written into the <main> of states.html. */
export function statesMarkup(plan: StatesPlan): string {
  const variant = escape(plan.variant);
  const parts: string[] = [];
  if (plan.action) {
    const { tag, tones } = plan.action;
    const head = tones
      .map(
        (tone) => `<mds-text typography="caption" class="states-muted">${escape(tone)}</mds-text>`,
      )
      .join('');
    const rows = ACTION_STATES.map(
      ({ label, attribute }) =>
        `<mds-text typography="caption" class="states-muted">${label}</mds-text>` +
        tones
          .map(
            (tone) =>
              `<${tag} type="button" size="sm" variant="${variant}" tone="${escape(tone)}"${attribute ? ` ${attribute}` : ''}>Ok</${tag}>`,
          )
          .join(''),
    ).join('');
    parts.push(
      `<section class="states-grid" style="--states-tones: ${tones.length}" aria-label="${tag}, variant ${variant}"><span></span>${head}${rows}</section>`,
    );
  }
  if (plan.message) {
    const { tag, tones } = plan.message;
    parts.push(
      `<section class="states-stack" aria-label="${tag}, variant ${variant}">${tones
        .map(
          (tone) =>
            `<${tag} variant="${variant}" tone="${escape(tone)}" headline="Tono ${escape(tone)}">Il testo di un messaggio della pagina.</${tag}>`,
        )
        .join('')}</section>`,
    );
  }
  for (const { tag, tones } of plan.markers)
    parts.push(
      `<section class="states-row" aria-label="${tag}, variant ${variant}">${tones
        .map(
          (tone) =>
            `<${tag} variant="${variant}" tone="${escape(tone)}" label="${escape(tone)}"></${tag}>`,
        )
        .join('')}</section>`,
    );
  return parts.join('');
}

/** A selector with its :hover written as the attribute that forces it. */
export const forcedSelector = (selector: string): string =>
  selector.replaceAll(':hover', '[data-studio-hover]');

/** A rule of a sheet, read without the classes of a realm: the sheets are another document's. */
interface Rule {
  selectorText?: string;
  cssText: string;
  cssRules?: CSSRuleList;
  insertRule?: (rule: string, index: number) => number;
}

/** Copies each :hover rule of a list under the attribute that forces it, nested ones included. */
function copyHover(owner: { cssRules: CSSRuleList; insertRule: Rule['insertRule'] }) {
  for (let index = 0; index < owner.cssRules.length; index += 1) {
    const rule = owner.cssRules[index] as unknown as Rule;
    if (rule.cssRules?.length && rule.insertRule)
      copyHover(rule as Parameters<typeof copyHover>[0]);
    const selector = rule.selectorText;
    if (!selector?.includes(':hover') || !rule.cssText.startsWith(selector)) continue;
    try {
      owner.insertRule!(forcedSelector(selector) + rule.cssText.slice(selector.length), index + 1);
      index += 1;
    } catch {
      /* a rule the sheet refuses stays the pointer's alone */
    }
  }
}

/**
 * Forces the hover on the elements of a page that ask for it (`data-studio-hover`): a pointer
 * hovers one element at a time, so each :hover rule of their shadow sheets is copied under that
 * attribute. The sheets are the component's own, shared by its instances: each is copied once.
 */
export function forceHover(page: Document, done: WeakSet<object>) {
  for (const host of page.querySelectorAll('[data-studio-hover]')) {
    const root = host.shadowRoot;
    if (!root) continue;
    const sheets = [
      ...(root.adoptedStyleSheets ?? []),
      ...[...root.querySelectorAll('style')].map((style) => style.sheet),
    ];
    for (const sheet of sheets) {
      if (!sheet || done.has(sheet)) continue;
      done.add(sheet);
      copyHover(sheet as unknown as Parameters<typeof copyHover>[0]);
    }
  }
}

/** Waits for the components of a page to render: defined by its loader, then ready. */
export async function settled(page: Document) {
  const view = page.defaultView;
  const hosts = [...page.body.querySelectorAll('*')].filter((one) => one.localName.includes('-'));
  if (!view) return;
  await Promise.all(
    [...new Set(hosts.map((one) => one.localName))].map((tag) =>
      view.customElements.whenDefined(tag),
    ),
  );
  await Promise.all(
    hosts.map((one) =>
      (one as HTMLElement & { componentOnReady?: () => Promise<unknown> }).componentOnReady?.(),
    ),
  );
}

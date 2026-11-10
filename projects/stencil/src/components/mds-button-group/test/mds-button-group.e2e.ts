import { render } from '@stencil/vitest';
import { page } from 'vitest/browser';

/** Top-left, top-right, bottom-right, bottom-left, rounded to the pixel. */
const corners = (el: Element): number[] => {
  const cs = getComputedStyle(el);
  return [
    cs.borderTopLeftRadius,
    cs.borderTopRightRadius,
    cs.borderBottomRightRadius,
    cs.borderBottomLeftRadius,
  ].map((v) => Math.round(parseFloat(v) || 0));
};

const flat = (n: number) => n === 0;
const round = (n: number) => n > 0;

describe('mds-button-group', () => {
  it('renders', async () => {
    const { root } = await render('<mds-button-group></mds-button-group>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('joined edges', () => {
    it('leaves a lone button rounded on both sides', async () => {
      const { root } = await render(
        '<mds-button-group><mds-button label="Only"></mds-button></mds-button-group>',
      );

      expect(corners(root.children[0]).every(round)).toBe(true);
    });

    it('flattens the inner edges of two buttons', async () => {
      const { root } = await render(
        '<mds-button-group><mds-button label="One"></mds-button><mds-button label="Two"></mds-button></mds-button-group>',
      );

      const [tl, tr, br, bl] = corners(root.children[0]);
      const [tl2, tr2, br2, bl2] = corners(root.children[1]);

      expect([round(tl), flat(tr), flat(br), round(bl)]).toEqual([true, true, true, true]);
      expect([flat(tl2), round(tr2), round(br2), flat(bl2)]).toEqual([true, true, true, true]);
    });

    it('counts mds-button-dropdown as a member of the group', async () => {
      const { root } = await render(
        '<mds-button-group><mds-button label="Export"></mds-button><mds-button-dropdown label="More"></mds-button-dropdown></mds-button-group>',
      );

      // the dropdown is documented as a legitimate sibling: it has to give up its
      // left corners, or the pair is joined on one side only
      const [, tr, br] = corners(root.children[0]);
      const [tl2, , , bl2] = corners(root.children[1]);

      expect([flat(tr), flat(br)]).toEqual([true, true]);
      expect([flat(tl2), flat(bl2)]).toEqual([true, true]);
    });

    // #1340: ::slotted reaches the host of the dropdown, not the two buttons inside it, whose
    // corners are the ones drawn; they take their outer corners from the host
    it.each([
      [
        'after a button: its main action flat, its chevron round at the end',
        '<mds-button label="Esporta CSV"></mds-button><mds-button-dropdown label="Altro"></mds-button-dropdown>',
        '.dropdown-primary-action',
        '.dropdown-action',
      ],
      [
        'before a button: its chevron flat, its main action round at the start',
        '<mds-button-dropdown label="Altro"></mds-button-dropdown><mds-button label="Esporta CSV"></mds-button>',
        '.dropdown-action',
        '.dropdown-primary-action',
      ],
    ])('joins an mds-button-dropdown %s', async (_, members, joined, outer) => {
      const { root } = await render(`<mds-button-group>${members}</mds-button-group>`);
      const dropdown = root.querySelector('mds-button-dropdown')!;
      const [joinedButton, outerButton] = [joined, outer].map((inner) =>
        dropdown.shadowRoot!.querySelector(inner)!,
      );
      await vi.waitFor(() => {
        for (const button of [joinedButton, outerButton])
          expect(button).toHaveAttribute('hydrated');
      });
      const [tl, tr, br, bl] = corners(outerButton);

      // flat on the side of the button of the group and on the inner side of the dropdown
      expect(corners(joinedButton).every(flat)).toBe(true);
      expect((outer === '.dropdown-action' ? [tr, br] : [tl, bl]).every(round)).toBe(true);
    });

    it('ignores an element that is not a member when it decides the edges', async () => {
      const { root } = await render(
        '<mds-button-group><span></span><mds-button label="Only"></mds-button></mds-button-group>',
      );

      // the button is still the only member, so it keeps both sides: a plain
      // :first-child would have counted the span and flattened its left
      expect(corners(root.children[1]).every(round)).toBe(true);
    });
  });
});

// actions/stacked (#1189) stretches every labelled action of a row: the group gives its free width
// to its labelled members, each at its own width plus the same share, and keeps an icon-only
// member at its size; at its own width nothing moves (#1340)
describe('mds-button-group stretched', () => {
  const draft = (style = '') =>
    `<mds-button-group style="${style}"><mds-button tone="outline" label="Salva come bozza"></mds-button><mds-button label="Pubblica"></mds-button></mds-button-group>`;

  const box = (element: Element): DOMRect => element.getBoundingClientRect();

  const members = (group: Element): DOMRect[] => Array.from(group.children).map(box);

  const centre = ({ left, width }: DOMRect): number => left + width / 2;

  // the members of a dropdown live in its shadow root, and their size waits for them too
  const hydrated = (root: Element) =>
    vi.waitFor(() => {
      for (const component of root.querySelectorAll(
        'mds-button-group, mds-button, mds-button-dropdown, mds-card-footer, mds-status-bar',
      )) {
        expect(component).toHaveAttribute('hydrated');
        for (const inner of component.shadowRoot?.querySelectorAll('mds-button') ?? [])
          expect(inner).toHaveAttribute('hydrated');
      }
    });

  it('keeps its own width where nothing stretches it, each member as wide as a button', async () => {
    const { root } = await render<HTMLElement>(
      `<div>${draft()}<mds-button tone="outline" label="Salva come bozza"></mds-button><mds-button label="Pubblica"></mds-button></div>`,
    );
    await hydrated(root);
    const group = root.querySelector('mds-button-group')!;
    const [first, second] = members(group);
    const [alone, alone2] = Array.from(root.querySelectorAll(':scope > mds-button')).map(box);

    expect(first.width).toBeCloseTo(alone.width, 0);
    expect(second.width).toBeCloseTo(alone2.width, 0);
    expect(first.left).toBeCloseTo(box(group).left, 0);
    expect(second.right).toBeCloseTo(box(group).right, 0);
  });

  // the three ways the rows of Magma stretch an action: mds-card-footer and mds-status-bar, a
  // product's own row, mds-banner
  it.each([
    ['align-self in a column', 'display: flex; flex-direction: column', 'align-self: stretch'],
    ['a width', '', 'width: 100%'],
    ['a flex-basis in a row that wraps', 'display: flex; flex-wrap: wrap', 'flex-basis: 100%'],
  ])('shares the width it gets from %s among its members', async (_, row, stretch) => {
    const { root } = await render<HTMLElement>(
      `<div><div style="width: 20rem; ${row}">${draft(stretch)}</div>${draft()}</div>`,
    );
    await hydrated(root);
    const [stretched, intrinsic] = Array.from(root.querySelectorAll('mds-button-group'));
    const host = box(stretched);
    const [first, second] = members(stretched);
    const [first0, second0] = members(intrinsic);

    expect(host.width).toBeCloseTo(box(stretched.parentElement!).width, 0);
    expect(first.left).toBeCloseTo(host.left, 0);
    expect(second.right).toBeCloseTo(host.right, 0);
    // the joint as at its own width
    expect(second.left - first.right).toBeCloseTo(second0.left - first0.right, 0);
    // each member at its own width plus the same share: a long label is never cut for a short one
    expect(first.width - first0.width).toBeGreaterThan(0);
    expect(first.width - first0.width).toBeCloseTo(second.width - second0.width, 0);
    // the label in the middle of its member, as in a stretched mds-button
    for (const member of stretched.children) {
      const label = box(member.shadowRoot!.querySelector('[part="label"]')!);

      expect(centre(label)).toBeCloseTo(centre(box(member)), 0);
    }
  });

  it('keeps an icon-only member at its size, the labelled one taking the width', async () => {
    const group = (style = '') =>
      `<mds-button-group style="${style}"><mds-button label="Modifica"></mds-button><mds-button icon="mi/baseline/more-vert" aria-label="Altre azioni"></mds-button></mds-button-group>`;
    const { root } = await render<HTMLElement>(
      `<div><div style="width: 20rem; display: flex; flex-direction: column">${group('align-self: stretch')}</div>${group()}</div>`,
    );
    await hydrated(root);
    const [stretched, intrinsic] = Array.from(root.querySelectorAll('mds-button-group'));
    const [labelled, icon] = members(stretched);
    const [, icon0] = members(intrinsic);

    expect(labelled.left).toBeCloseTo(box(stretched).left, 0);
    expect(icon.right).toBeCloseTo(box(stretched).right, 0);
    expect([icon.width, icon.height]).toEqual([icon0.width, icon0.height]);
  });

  it('leaves a group of icon-only members at their size, at the start', async () => {
    const icons =
      '<mds-button icon="mi/baseline/share" aria-label="Condividi"></mds-button><mds-button icon="mi/baseline/print" aria-label="Stampa"></mds-button>';
    const { root } = await render<HTMLElement>(
      `<div><div style="width: 20rem; display: flex; flex-direction: column"><mds-button-group style="align-self: stretch">${icons}</mds-button-group></div><mds-button-group>${icons}</mds-button-group></div>`,
    );
    await hydrated(root);
    const [stretched, intrinsic] = Array.from(root.querySelectorAll('mds-button-group'));

    expect(members(stretched).map(({ width }) => width)).toEqual(
      members(intrinsic).map(({ width }) => width),
    );
    expect(members(stretched)[0].left).toBeCloseTo(box(stretched).left, 0);
  });

  it('gives the share of an mds-button-dropdown member to it, its chevron at the end', async () => {
    const group = (style = '') =>
      `<mds-button-group style="${style}"><mds-button label="Esporta CSV"></mds-button><mds-button-dropdown label="Altro"><mds-button label="Esporta PDF"></mds-button></mds-button-dropdown></mds-button-group>`;
    const { root } = await render<HTMLElement>(
      `<div><div style="width: 20rem; display: flex; flex-direction: column">${group('align-self: stretch')}</div>${group()}</div>`,
    );
    await hydrated(root);
    const [stretched, intrinsic] = Array.from(root.querySelectorAll('mds-button-group'));
    const [button, dropdown] = members(stretched);
    const [button0, dropdown0] = members(intrinsic);
    const chevron = stretched
      .querySelector('mds-button-dropdown')!
      .shadowRoot!.querySelector('.dropdown-action')!;

    expect(dropdown.width - dropdown0.width).toBeGreaterThan(0);
    expect(dropdown.width - dropdown0.width).toBeCloseTo(button.width - button0.width, 0);
    expect(box(chevron).right).toBeCloseTo(box(stretched).right, 0);
  });

  describe('in a row of actions', () => {
    const cancel = '<mds-button variant="dark" tone="outline" label="Annulla"></mds-button>';

    afterEach(async () => {
      // the size of the browser project in vitest.config.mts
      await page.viewport(1280, 800);
    });

    // under 380px of the footer (272px in a card of 20rem) the row stacks: the group spans it as
    // the action above it; in a card of 30rem the row stays on one line and nothing moves
    it('spans the stacked row of a narrow mds-card-footer, as the action above it', async () => {
      const { root } = await render<HTMLElement>(
        `<mds-card style="width: 20rem"><mds-card-footer>${cancel}${draft()}</mds-card-footer></mds-card>`,
      );
      await hydrated(root);
      const action = box(root.querySelector('mds-card-footer > mds-button')!);
      const [first, second] = members(root.querySelector('mds-button-group')!);

      expect(box(root.querySelector('mds-card-footer')!).width).toBeLessThan(380);
      expect(first.left).toBeCloseTo(action.left, 0);
      expect(second.right).toBeCloseTo(action.right, 0);
    });

    it('keeps its own width at the end of a footer of one line', async () => {
      const { root } = await render<HTMLElement>(
        `<div><mds-card style="width: 30rem"><mds-card-footer>${cancel}${draft()}</mds-card-footer></mds-card>${draft()}</div>`,
      );
      await hydrated(root);
      const [inFooter, intrinsic] = Array.from(root.querySelectorAll('mds-button-group'));
      const action = box(root.querySelector('mds-card-footer > mds-button')!);
      const end = root.querySelector('mds-card-footer')!.shadowRoot!.querySelector('.actions')!;

      expect(box(inFooter).top).toBeCloseTo(action.top, 0);
      expect(box(inFooter).width).toBeCloseTo(box(intrinsic).width, 0);
      expect(box(inFooter).right).toBeCloseTo(box(end).right, 0);
    });

    it('spans the stacked row of mds-status-bar on a phone, as the action above it', async () => {
      await page.viewport(375, 812);
      const { root } = await render<HTMLElement>(
        `<mds-status-bar visible description="Modifiche non salvate">${cancel}${draft()}</mds-status-bar>`,
      );
      await hydrated(root);
      const action = box(root.querySelector(':scope > mds-button')!);
      const [first, second] = members(root.querySelector('mds-button-group')!);

      expect(first.left).toBeCloseTo(action.left, 0);
      expect(second.right).toBeCloseTo(action.right, 0);
    });
  });
});

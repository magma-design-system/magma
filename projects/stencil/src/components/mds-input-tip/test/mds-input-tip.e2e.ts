import { render } from '@stencil/vitest';

describe('mds-input-tip', () => {
  it('renders', async () => {
    const { root } = await render('<mds-input-tip></mds-input-tip>');

    expect(root).toHaveAttribute('hydrated');
  });
});

// The top tip of a field (the badge of read only and disabled, the dot of required) stood inside
// its top right corner, over the button at the end of the field: at md and sm it covered it almost
// whole. It stands on the top border now, half outside, clear of the corner by the radius of the
// field plus a margin, and stays there while the field has the focus (vittorio 2026-11-11, #1368).
describe('the top tip of a field', () => {
  // the margin past the radius of the field, --spacing(200)
  const MARGIN = 8;
  const SIZES = ['lg', 'md', 'sm'];

  // [the field, its markup, what stands at its end: the buttons, or the arrow of the select]
  const CASES: [string, string, string][] = [
    [
      'a read-only password',
      '<mds-input type="password" value="secret" readonly></mds-input>',
      '.password-toggle-button',
    ],
    [
      'a disabled password',
      '<mds-input type="password" value="secret" disabled></mds-input>',
      '.password-toggle-button',
    ],
    [
      'a required password',
      '<mds-input type="password" value="secret" required></mds-input>',
      '.password-toggle-button',
    ],
    [
      'a required colour',
      '<mds-input type="color" value="#2f6fd0" required></mds-input>',
      '.color-picker-button',
    ],
    [
      'a required text to dictate',
      '<mds-input mic value="text" required></mds-input>',
      '.mic-toggle-button',
    ],
    [
      'a required number',
      '<mds-input type="number" value="3" required></mds-input>',
      '.counter-button',
    ],
    [
      'a required number, horizontal',
      '<mds-input type="number" controls-layout="horizontal" value="3" required></mds-input>',
      '.counter-button',
    ],
    [
      'a required date',
      '<mds-input-date value="2026-11-11" required></mds-input-date>',
      '.action-open-calendar',
    ],
    [
      'a required select',
      '<mds-input-select required><option value="a">A</option></mds-input-select>',
      '.icon',
    ],
    [
      'a disabled select',
      '<mds-input-select disabled><option value="a">A</option></mds-input-select>',
      '.icon',
    ],
  ];

  const withSize = (markup: string, size: string): string =>
    markup.replace(/^<([a-z-]+)/, `<$1 size="${size}"`);

  /** The glyph of what stands at the end: the icon of a button, or the arrow itself. */
  const glyphs = (field: Element, selector: string): Element[] =>
    Array.from(field.shadowRoot!.querySelectorAll(selector)).map((element) =>
      element.localName === 'mds-button' ? element.shadowRoot!.querySelector('.icon')! : element,
    );

  /** The area two boxes share, 0 when they do not overlap. */
  const overlap = (a: DOMRect, b: DOMRect): number =>
    Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
    Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

  const tipOf = (field: Element): Element =>
    field.shadowRoot!.querySelector('mds-input-tip[position="top"]')!;

  const itemsOf = (field: Element): DOMRect[] =>
    Array.from(tipOf(field).querySelectorAll('mds-input-tip-item')).map((item) =>
      item.getBoundingClientRect(),
    );

  /** The tip as the user sees it once its transitions end. */
  const settle = async (): Promise<void> => {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    await Promise.all(document.getAnimations().map((animation) => animation.finished));
  };

  beforeEach(() => {
    document.documentElement.classList.add('pref-animation-reduce');
  });

  it.each(
    CASES.flatMap(([name, markup, end]) => SIZES.map((size) => ({ name, markup, end, size }))),
  )(
    'stands on the border of $name ($size), clear of its corner and of its end, focused too',
    async ({ markup, end, size }) => {
      const { root, waitForChanges } = await render(
        `<div style="padding: 24px; width: 320px">${withSize(markup, size)}</div>`,
      );
      const field = root.firstElementChild!;
      await settle();
      const box = field.getBoundingClientRect();
      const radius = parseFloat(getComputedStyle(field).borderTopRightRadius);
      const items = itemsOf(field);

      expect(items.length).toBeGreaterThan(0);
      items.forEach((item) => {
        // on the border: half outside, half inside
        expect(Math.abs((item.top + item.bottom) / 2 - box.top)).toBeLessThanOrEqual(1);
      });
      expect(box.right - tipOf(field).getBoundingClientRect().right).toBeCloseTo(
        radius + MARGIN,
        0,
      );
      const ends = glyphs(field, end);
      expect(ends.length).toBeGreaterThan(0);
      ends.forEach((glyph) =>
        items.forEach((item) => expect(overlap(item, glyph.getBoundingClientRect())).toBe(0)),
      );

      // the focus expands the items but does not move the tip: it stays on the border
      const native = field.shadowRoot!.querySelector<HTMLElement>('input, select')!;
      if (native.matches(':disabled')) return;
      native.focus();
      await waitForChanges();
      await settle();

      expect(tipOf(field)).toHaveAttribute('active');
      const focused = itemsOf(field);
      focused.forEach((item) => {
        expect(Math.abs((item.top + item.bottom) / 2 - box.top)).toBeLessThanOrEqual(1);
        ends.forEach((glyph) => expect(overlap(item, glyph.getBoundingClientRect())).toBe(0));
      });
      expect(box.right - tipOf(field).getBoundingClientRect().right).toBeCloseTo(
        radius + MARGIN,
        0,
      );
    },
  );

  it('leaves the bottom tip inside the bottom edge of the field', async () => {
    const { root } = await render('<mds-input tip="A hint" value="text"></mds-input>');
    await settle();
    const box = root.getBoundingClientRect();
    const tip = root.shadowRoot!.querySelector(
      'mds-input-tip[position="bottom"] mds-input-tip-item',
    )!;

    expect(tip.getBoundingClientRect().bottom).toBeLessThanOrEqual(box.bottom);
  });
});

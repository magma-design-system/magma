import { render } from '@stencil/vitest';

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

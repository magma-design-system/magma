import { render } from '@stencil/vitest';
import { describeConditionalSlot } from '@test/slot';

describe('mds-entity', () => {
  it('renders', async () => {
    const { root } = await render('<mds-entity>Name</mds-entity>');

    expect(root).toHaveAttribute('hydrated');
  });

  describeConditionalSlot({
    html: '<mds-entity>Name</mds-entity>',
    slot: 'detail',
    region: '.details',
    childTag: 'span',
  });

  describeConditionalSlot({
    html: '<mds-entity>Name</mds-entity>',
    slot: 'action',
    region: '.actions',
  });

  // #1037: the detail sat right against the name, and the column had no part
  describe('the infos column', () => {
    const infos = (root: HTMLElement): HTMLElement =>
      root.shadowRoot!.querySelector<HTMLElement>('[part~="infos"]')!;

    it('is the infos part, with the name and the detail row inside', async () => {
      const { root } = await render(
        '<mds-entity><span>Name</span><span slot="detail">Detail</span></mds-entity>',
      );

      expect(infos(root).querySelector('slot:not([name])')).not.toBeNull();
      expect(infos(root).querySelector('slot[name="detail"]')).not.toBeNull();
    });

    it('takes the styles of ::part(infos)', async () => {
      const style = document.createElement('style');
      style.textContent = 'mds-entity::part(infos) { gap: 12px; }';
      document.head.append(style);
      try {
        const { root } = await render('<mds-entity>Name</mds-entity>');

        expect(getComputedStyle(infos(root)).rowGap).toBe('12px');
      } finally {
        style.remove();
      }
    });

    it('leaves 2px between the name and the detail', async () => {
      const { root } = await render(
        '<mds-entity><span class="name">Name</span><span slot="detail">Detail</span></mds-entity>',
      );
      const name = root.querySelector('.name')!.getBoundingClientRect();
      const detail = root.shadowRoot!.querySelector('.details')!.getBoundingClientRect();

      expect(detail.top - name.bottom).toBe(2);
    });

    it('is as tall as the name without a detail', async () => {
      const { root } = await render('<mds-entity><span class="name">Name</span></mds-entity>');
      const name = root.querySelector('.name')!.getBoundingClientRect();

      expect(infos(root).getBoundingClientRect().height).toBe(name.height);
    });
  });
});

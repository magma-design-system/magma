import { render } from '@stencil/vitest';
import { childOpacityBeforeHydration, hostOpacityBeforeHydration } from '@test/fouc';

const stepsOf = (root: HTMLElement): string[] =>
  Array.from(root.querySelectorAll('mds-stepper-bar-item')).map((item) =>
    (item.shadowRoot!.querySelector('.step') as HTMLElement).textContent!.trim(),
  );

describe('mds-stepper-bar-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-stepper-bar-item></mds-stepper-bar-item>');

    expect(root).toHaveAttribute('hydrated');
  });

  // its FOUC import was lost resolving a merge (#1004)
  it('stays hidden until it hydrates, and so do its badge, icon, progress and text', async () => {
    const { root } = await render('<mds-stepper-bar-item label="One"></mds-stepper-bar-item>');

    expect(await hostOpacityBeforeHydration(root)).toBe('0');
    for (const tag of ['mds-badge', 'mds-icon', 'mds-progress', 'mds-text']) {
      expect(childOpacityBeforeHydration(root, tag), tag).toBe('0');
    }
  });

  it('numbers the steps by their position among the items', async () => {
    const { root } = await render(`
      <mds-stepper-bar>
        <mds-stepper-bar-item step label="One"></mds-stepper-bar-item>
        <mds-stepper-bar-item step label="Two"></mds-stepper-bar-item>
        <mds-stepper-bar-item step label="Three"></mds-stepper-bar-item>
      </mds-stepper-bar>
    `);

    // the markup is indented, so there is a whitespace text node before every
    // item: counting childNodes made the numbers come out 2, 4, 6
    expect(stepsOf(root)).toEqual(['Step 1', 'Step 2', 'Step 3']);
  });

  it('numbers them the same when the items are written with no space between them', async () => {
    const { root } = await render(
      '<mds-stepper-bar><mds-stepper-bar-item step label="One"></mds-stepper-bar-item><mds-stepper-bar-item step label="Two"></mds-stepper-bar-item></mds-stepper-bar>',
    );

    expect(stepsOf(root)).toEqual(['Step 1', 'Step 2']);
  });

  it('squares the bar of its progress', async () => {
    // #988: it set --mds-progress-radius to 0, and mds-progress no longer read the property
    const { root } = await render('<mds-stepper-bar-item label="One"></mds-stepper-bar-item>');
    const progress = root.shadowRoot!.querySelector('.progress')!;

    expect(getComputedStyle(progress).borderTopLeftRadius).toBe('0px');
  });
});

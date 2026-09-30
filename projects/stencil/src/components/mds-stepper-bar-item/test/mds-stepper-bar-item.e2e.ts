import { render } from '@stencil/vitest';

const stepsOf = (root: HTMLElement): string[] =>
  Array.from(root.querySelectorAll('mds-stepper-bar-item')).map((item) =>
    (item.shadowRoot!.querySelector('.step') as HTMLElement).textContent!.trim(),
  );

describe('mds-stepper-bar-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-stepper-bar-item></mds-stepper-bar-item>');

    expect(root).toHaveAttribute('hydrated');
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
});

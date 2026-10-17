import { render } from '@stencil/vitest';

describe('mds-stepper-bar', () => {
  it('renders', async () => {
    const { root } = await render('<mds-stepper-bar></mds-stepper-bar>');

    expect(root).toHaveAttribute('hydrated');
  });

  // the test page defines no `.hidden` rule, as many pages do not
  it('shows only the panel of the current step, with no style of the page', async () => {
    const { root, waitForChanges } = await render<HTMLMdsStepperBarElement>(`
      <mds-stepper-bar>
        <mds-stepper-bar-item value="first" label="First"></mds-stepper-bar-item>
        <mds-stepper-bar-item value="second" label="Second"></mds-stepper-bar-item>
        <div slot="content">Primo passo</div>
        <div slot="content">Secondo passo</div>
      </mds-stepper-bar>
    `);
    const panels = Array.from(root.querySelectorAll<HTMLElement>('[slot="content"]'));
    const shown = () => panels.map((panel) => getComputedStyle(panel).display !== 'none');
    await vi.waitFor(() => expect(shown()).toEqual([true, false]));

    root.itemsDone = 2;
    await waitForChanges();

    expect(shown()).toEqual([false, true]);
  });

  it('leaves out of the value a done item whose value attribute was removed', async () => {
    const { root, spyOnEvent, waitForChanges } = await render<HTMLMdsStepperBarElement>(`
      <mds-stepper-bar items-done="1">
        <mds-stepper-bar-item value="first" label="First"></mds-stepper-bar-item>
        <mds-stepper-bar-item value="second" label="Second"></mds-stepper-bar-item>
        <mds-stepper-bar-item value="third" label="Third"></mds-stepper-bar-item>
      </mds-stepper-bar>
    `);
    const change = spyOnEvent('mdsStepperBarChange');
    // a removed attribute leaves null, the value Angular and Vue bind for a missing one
    root.querySelectorAll('mds-stepper-bar-item')[1].removeAttribute('value');
    await waitForChanges();

    root.itemsDone = 3;
    await waitForChanges();

    expect(change.lastEvent?.detail.value).toBe('first');
  });
});

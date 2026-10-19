import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

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

  // mdsStepperBarItemDone was declared and never emitted, and the handler of the bar read a
  // detail of the wrong shape and marked every item as not done (#823)
  describe('going back to a step that is done', () => {
    const stage = async () => {
      const rendered = await render<HTMLMdsStepperBarElement>(`
        <mds-stepper-bar items-done="3">
          <mds-stepper-bar-item value="first" label="First"></mds-stepper-bar-item>
          <mds-stepper-bar-item value="second" label="Second"></mds-stepper-bar-item>
          <mds-stepper-bar-item value="third" label="Third"></mds-stepper-bar-item>
        </mds-stepper-bar>`);
      await rendered.waitForChanges();
      const items = Array.from(rendered.root.querySelectorAll('mds-stepper-bar-item'));
      return { ...rendered, items };
    };

    it('makes a done step a button, and leaves the current one alone', async () => {
      const { items } = await stage();

      expect(items[0]).toEqualAttributes({ role: 'button', tabindex: '0' });
      expect(items[2]).not.toHaveAttribute('role');
      expect(items[2]).not.toHaveAttribute('tabindex');
    });

    it('asks for the step with its value, from the pointer and the keyboard', async () => {
      const { root, items, spyOnEvent, waitForChanges } = await stage();
      const done = spyOnEvent('mdsStepperBarItemDone');
      const change = spyOnEvent('mdsStepperBarChange');

      items[0].click();
      items[2].click();
      items[1].focus();
      await userEvent.keyboard('{Enter}');
      await waitForChanges();

      expect(done.events.map((event) => event.detail)).toEqual([
        { value: 'first' },
        { value: 'second' },
      ]);
      // the bar is driven by itemsDone: the page answers the request
      expect(change).not.toHaveReceivedEvent();
      expect(items[2]).toHaveAttribute('current');

      root.itemsDone = 1;
      await waitForChanges();
      expect(items[0]).toHaveAttribute('current');
    });
  });
});

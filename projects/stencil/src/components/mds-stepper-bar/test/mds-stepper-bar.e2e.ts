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

  // the id is the page's: a label association or a deep link points at it (#680, entry 33)
  it('keeps the id of an item written in the markup, and writes none of its own', async () => {
    const { root, waitForChanges } = await render<HTMLMdsStepperBarElement>(`
      <mds-stepper-bar items-done="2">
        <mds-stepper-bar-item id="step-account" value="first" label="First"></mds-stepper-bar-item>
        <mds-stepper-bar-item value="second" label="Second"></mds-stepper-bar-item>
      </mds-stepper-bar>
    `);
    await waitForChanges();
    const items = root.querySelectorAll('mds-stepper-bar-item');

    expect(items[0].id).toBe('step-account');
    expect(items[1]).not.toHaveAttribute('id');
    expect(document.getElementById('step-account')).toBe(items[0]);
  });

  // the last step draws no bar: it took an equal share of the row all the same, and left an empty
  // column after its icon, a third of the row with three steps (#680, entry 14)
  it('gives the room of a wider row to the bars, not to the last step', async () => {
    const stepper = (width: number) => `
      <mds-stepper-bar style="width: ${width}px" items-done="2">
        <mds-stepper-bar-item step label="Account"></mds-stepper-bar-item>
        <mds-stepper-bar-item step label="Dati"></mds-stepper-bar-item>
        <mds-stepper-bar-item step label="Fine"></mds-stepper-bar-item>
      </mds-stepper-bar>`;
    const { root, waitForChanges } = await render<HTMLElement>(
      `<div>${stepper(800)}${stepper(1100)}</div>`,
    );
    await waitForChanges();
    const [narrow, wide] = Array.from(root.querySelectorAll('mds-stepper-bar')).map((bar) => {
      const items = Array.from(bar.querySelectorAll('mds-stepper-bar-item'));
      const bars = items
        .slice(0, -1)
        .map((item) => item.shadowRoot!.querySelector('.progress')!.getBoundingClientRect().width);
      return {
        last: items[items.length - 1].getBoundingClientRect().width,
        bars: bars.reduce((sum, width) => sum + width, 0),
      };
    });

    expect(wide.last).toBeCloseTo(narrow.last, 0);
    expect(wide.bars - narrow.bars).toBeCloseTo(300, 0);
  });
});

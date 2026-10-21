import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

describe('mds-input-date-range-preselection', () => {
  it('renders', async () => {
    const { root } = await render(
      '<mds-input-date-range-preselection></mds-input-date-range-preselection>',
    );

    expect(root).toHaveAttribute('hydrated');
  });

  it('assigns itself to the calendar-preselection slot of mds-input-date-range', async () => {
    const { root } = await render(
      '<mds-input-date-range><mds-input-date-range-preselection start="2025-06-01" end="2025-06-30">Giugno</mds-input-date-range-preselection></mds-input-date-range>',
    );

    expect(root.querySelector('mds-input-date-range-preselection')!.slot).toBe(
      'calendar-preselection',
    );
  });

  it('keeps the slot the author gives it, past the first render', async () => {
    const { root, waitForChanges } = await render(
      '<mds-calendar><mds-input-date-range-preselection slot="preselection" start="2025-06-01" end="2025-06-30">Giugno</mds-input-date-range-preselection></mds-calendar>',
    );
    const preselection = root.querySelector('mds-input-date-range-preselection')!;

    // the first render keeps an attribute the host already has; the next one used to set it
    preselection.selected = true;
    await waitForChanges();

    expect(preselection.slot).toBe('preselection');
  });

  it('lets the click reach the page outside a date range', async () => {
    const { root } = await render(
      '<mds-input-date-range-preselection start="2025-06-01" end="2025-06-30">Giugno</mds-input-date-range-preselection>',
    );
    const onClick = vi.fn();
    root.addEventListener('click', onClick);

    await userEvent.click(root.shadowRoot!.querySelector('.action')!);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

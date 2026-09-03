import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

describe('mds-chip', () => {
  it('renders', async () => {
    const { root } = await render('<mds-chip></mds-chip>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('renders the label in the shadow DOM', async () => {
    const { root } = await render('<mds-chip label="chip"></mds-chip>');

    expect(root).toEqualAttributes({
      'aria-disabled': 'false',
      label: 'chip',
      tone: 'strong',
      variant: 'primary',
    });

    const label = root.shadowRoot!.querySelector('.label-wrapper > mds-text.label')!;
    expect(label).toEqualAttributes({ truncate: 'word', typography: 'caption' });
    expect(label.textContent?.trim()).toBe('chip');
  });

  it('emits mdsChipDelete when the delete button is clicked', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      '<mds-chip label="chip" deletable></mds-chip>',
    );
    const deleteSpy = spyOnEvent('mdsChipDelete');

    await userEvent.click(root.shadowRoot!.querySelector('.button-delete')!);
    await waitForChanges();

    expect(deleteSpy).toHaveReceivedEventTimes(1);
  });
});

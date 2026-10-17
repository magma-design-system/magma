import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

describe('mds-details', () => {
  it('renders', async () => {
    const { root } = await render('<mds-details></mds-details>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('exposes the header as a disclosure button instead of a banner landmark', async () => {
    const { root, waitForChanges } = await render(
      '<mds-details><span slot="title">Vision</span>Details</mds-details>',
    );
    const header = root.shadowRoot!.querySelector('.header')!;

    expect(header.tagName).toBe('DIV');
    expect(header).toEqualAttributes({ role: 'button', 'aria-expanded': 'false', tabindex: '0' });

    await userEvent.click(header);
    await waitForChanges();

    expect(header).toEqualAttribute('aria-expanded', 'true');
  });

  // a user toggle changed only an inner state: opened went stale, and assigning the value it
  // still held did nothing (#823)
  it('writes the user toggle into opened, so code can reopen what the user closed', async () => {
    const { root, waitForChanges } = await render<HTMLMdsDetailsElement>(
      '<mds-details opened><span slot="title">Vision</span>Details</mds-details>',
    );
    const header = root.shadowRoot!.querySelector<HTMLElement>('.header')!;

    header.click();
    await waitForChanges();
    expect(root.opened).toBe(false);
    expect(root).not.toHaveAttribute('opened');

    root.opened = true;
    await waitForChanges();
    expect(header).toEqualAttribute('aria-expanded', 'true');
  });
});

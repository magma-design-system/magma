import { render } from '@stencil/vitest';

describe('mds-breadcrumb', () => {
  it('renders', async () => {
    const { root } = await render('<mds-breadcrumb></mds-breadcrumb>');

    expect(root).toHaveAttribute('hydrated');
  });
});

// for the back arrow the caller was the item the step left, for a click the item it selects (#823)
describe('mds-breadcrumb change caller', () => {
  it('is the item the back arrow selects, as for a click', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(`
      <mds-breadcrumb>
        <mds-breadcrumb-item label="Home"></mds-breadcrumb-item>
        <mds-breadcrumb-item label="Section"></mds-breadcrumb-item>
        <mds-breadcrumb-item label="Page" selected></mds-breadcrumb-item>
      </mds-breadcrumb>`);
    const change = spyOnEvent('mdsBreadcrumbChange');
    const items = root.querySelectorAll('mds-breadcrumb-item');

    root.shadowRoot!.querySelector<HTMLElement>('.back')!.click();
    await waitForChanges();

    expect(change.lastEvent?.detail.id).toBe('1');
    expect(change.lastEvent?.detail.caller).toBe(items[1]);
  });
});

import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { mockIconFetch } from '@test/fetch';

describe('mds-mention', () => {
  it('renders', async () => {
    const { root } = await render('<mds-mention></mds-mention>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('falls back to the default icon once the icon attribute is removed', async () => {
    mockIconFetch();
    const { root, waitForChanges } = await render(
      '<mds-mention label="mario.rossi" icon="mdi/alien"></mds-mention>',
    );
    const icon = root.shadowRoot!.querySelector('mds-icon')!;
    const custom = icon.name;

    root.removeAttribute('icon');
    await waitForChanges();

    expect(icon.name).toBeTruthy();
    expect(icon.name).not.toBe(custom);
  });

  it('keeps the remove button out until deletable asks for it', async () => {
    // It used to be rendered for every mention, wired to nothing: an affordance that
    // promised an action the component could not deliver.
    const { root } = await render('<mds-mention label="mario.rossi"></mds-mention>');

    expect(root.shadowRoot!.querySelector('.action-remove')).toBeNull();
  });

  it('emits mdsMentionDelete when the remove button is clicked', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      '<mds-mention label="mario.rossi" deletable></mds-mention>',
    );
    const deleteSpy = spyOnEvent('mdsMentionDelete');

    await userEvent.click(root.shadowRoot!.querySelector('.action-remove')!);
    await waitForChanges();

    expect(deleteSpy).toHaveReceivedEventTimes(1);
    expect(deleteSpy.lastEvent?.detail.element).toBe(root);
  });

  it('titles the remove button in the active language', async () => {
    const { root } = await render('<mds-mention label="mario.rossi" deletable></mds-mention>');

    expect(root.shadowRoot!.querySelector('.action-remove')).toHaveAttribute(
      'title',
      'Remove mario.rossi',
    );
  });

  it('insets the remove button like the leading icon', async () => {
    // The whole of entry 16: the disc used to stop short of the pill and touch the last
    // letter, so it read as a glyph of the label rather than as a control.
    const { root } = await render(
      '<mds-mention label="mario.rossi" size="md" deletable></mds-mention>',
    );

    const host = root.getBoundingClientRect();
    const icon = root.shadowRoot!.querySelector('mds-icon')!.getBoundingClientRect();
    const button = root.shadowRoot!.querySelector('.action-remove')!.getBoundingClientRect();
    const text = root.shadowRoot!.querySelector('mds-text')!.getBoundingClientRect();

    expect(Math.round(host.right - button.right)).toBe(Math.round(icon.left - host.left));
    expect(Math.round(button.width)).toBe(Math.round(icon.width));
    expect(button.left).toBeGreaterThan(text.right);
  });
});

import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

describe('mds-input-switch', () => {
  const setup = async (html: string) => {
    const { root, waitForChanges } = await render<HTMLMdsInputSwitchElement>(html);
    const shadow = root.shadowRoot!;
    return {
      root,
      waitForChanges,
      input: shadow.querySelector<HTMLInputElement>('input.field')!,
      control: shadow.querySelector<HTMLElement>('.switch-container, .label-icon')!,
    };
  };

  it('renders', async () => {
    const { root } = await render('<mds-input-switch></mds-input-switch>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('exposes the native input as the labelled control, the label only draws it', async () => {
    const { input, control } = await setup('<mds-input-switch>Notifications</mds-input-switch>');

    expect(input).toEqualAttributes({ role: 'switch', 'aria-label': 'Select Notifications' });
    // `aria-label` is prohibited on a label, and two tab stops would announce the control twice
    expect(control).not.toHaveAttribute('aria-label');
    expect(control).not.toHaveAttribute('tabindex');
  });

  it('keeps the native checkbox and radio semantics', async () => {
    const { input } = await setup('<mds-input-switch type="checkbox"></mds-input-switch>');

    expect(input).not.toHaveAttribute('role');
    expect(input).toEqualAttributes({ type: 'checkbox', 'aria-label': 'Select element' });
  });

  it('toggles from the keyboard through the focused input', async () => {
    const { root, input, waitForChanges } = await setup(
      '<mds-input-switch>Notifications</mds-input-switch>',
    );

    input.focus();
    expect(root.shadowRoot!.activeElement).toBe(input);

    await userEvent.keyboard(' ');
    await waitForChanges();
    expect(root).toHaveAttribute('checked');
    expect(input).toEqualAttribute('aria-label', 'Deselect Notifications');

    await userEvent.keyboard('{Enter}');
    await waitForChanges();
    expect(root).not.toHaveAttribute('checked');
  });

  it('toggles when the drawn switch is clicked', async () => {
    const { root, control, waitForChanges } = await setup(
      '<mds-input-switch>Notifications</mds-input-switch>',
    );

    await userEvent.click(control);
    await waitForChanges();

    expect(root).toHaveAttribute('checked');
  });
});

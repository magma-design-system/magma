import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

/** The interactive label lives in the shadow root: it is the element that carries the role. */
const getLabel = (host: HTMLElement): HTMLElement => {
  const label = host.shadowRoot!.querySelector<HTMLElement>('.label');
  if (!label) throw new Error('Label not found');
  return label;
};

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

  it('wires a chip that arrives selectable from markup', async () => {
    // A @Watch does not fire for the value a prop is born with, so this used to stay
    // inert: the readme promises that selectable implies clickable.
    const { root } = await render('<mds-chip label="a" selectable></mds-chip>');

    expect(root).toHaveAttribute('clickable');
    expect(getLabel(root)).toHaveAttribute('role', 'button');
    expect(getLabel(root)).toHaveAttribute('tabindex', '0');
  });

  it('states the selected state through aria-pressed', async () => {
    const { root, waitForChanges } = await render('<mds-chip label="a" selectable></mds-chip>');

    expect(getLabel(root)).toHaveAttribute('aria-pressed', 'false');

    getLabel(root).click();
    await waitForChanges();

    expect(root).toHaveAttribute('selected');
    expect(getLabel(root)).toHaveAttribute('aria-pressed', 'true');

    getLabel(root).click();
    await waitForChanges();

    expect(root).not.toHaveAttribute('selected');
    expect(getLabel(root)).toHaveAttribute('aria-pressed', 'false');
  });

  it('states a chip selected from markup as pressed', async () => {
    const { root } = await render('<mds-chip label="a" selectable selected></mds-chip>');

    expect(getLabel(root)).toHaveAttribute('aria-pressed', 'true');
  });

  it('follows the keyboard toggle', async () => {
    const { root, waitForChanges } = await render('<mds-chip label="a" selectable></mds-chip>');

    getLabel(root).focus();
    await userEvent.keyboard('{Enter}');
    await waitForChanges();

    expect(root).toHaveAttribute('selected');
    expect(getLabel(root)).toHaveAttribute('aria-pressed', 'true');
  });

  it('leaves a merely clickable chip unpressed', async () => {
    // aria-pressed on a button that toggles nothing would announce a state that does
    // not exist; a clickable chip emits mdsChipClickLabel and stays as it is.
    const { root } = await render('<mds-chip label="a" clickable></mds-chip>');

    expect(getLabel(root)).toHaveAttribute('role', 'button');
    expect(getLabel(root)).not.toHaveAttribute('aria-pressed');
  });

  it('leaves a static chip without a role', async () => {
    const { root } = await render('<mds-chip label="a"></mds-chip>');

    expect(getLabel(root)).not.toHaveAttribute('role');
    expect(getLabel(root)).not.toHaveAttribute('aria-pressed');
  });
});

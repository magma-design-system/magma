import { render } from '@stencil/vitest';
import { themeLabelVariantDictionary } from '@type/variant';
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

  it('toggles with Space as with Enter, on the release of Space', async () => {
    const { root, waitForChanges } = await render('<mds-chip label="a" selectable></mds-chip>');

    getLabel(root).focus();
    await userEvent.keyboard('{Space>}');
    await waitForChanges();
    expect(root).not.toHaveAttribute('selected');

    await userEvent.keyboard('{/Space}');
    await waitForChanges();
    expect(root).toHaveAttribute('selected');
  });

  // disabled only dimmed the chip and only when written in the markup: the label stayed a tab
  // stop and Enter still emitted every event (#820)
  describe('disabled', () => {
    it('takes the label and the delete button out of the tab order', async () => {
      const { root } = await render(
        '<mds-chip label="a" selectable deletable disabled></mds-chip>',
      );

      expect(getLabel(root)).not.toHaveAttribute('tabindex');
      expect(getLabel(root)).toHaveAttribute('aria-disabled', 'true');
      expect(root.shadowRoot!.querySelector('.button-delete')).toHaveAttribute('disabled');
    });

    it('emits nothing from the keyboard or a script click', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(
        '<mds-chip label="a" selectable deletable disabled></mds-chip>',
      );
      const select = spyOnEvent('mdsChipSelect');
      const remove = spyOnEvent('mdsChipDelete');

      getLabel(root).focus();
      await userEvent.keyboard('{Enter}{Space}');
      getLabel(root).click();
      root.shadowRoot!.querySelector<HTMLElement>('.button-delete')!.click();
      await waitForChanges();

      expect(select).not.toHaveReceivedEvent();
      expect(remove).not.toHaveReceivedEvent();
      expect(root).not.toHaveAttribute('selected');
    });

    it('is styled when set by code, and works again once enabled', async () => {
      const { root, spyOnEvent, waitForChanges } = await render<HTMLMdsChipElement>(
        '<mds-chip label="a" clickable></mds-chip>',
      );
      const click = spyOnEvent('mdsChipClickLabel');

      (root as unknown as { disabled: boolean }).disabled = true;
      await waitForChanges();
      expect(root).toHaveAttribute('disabled');
      expect(getComputedStyle(root).pointerEvents).toBe('none');

      (root as unknown as { disabled: boolean }).disabled = false;
      await waitForChanges();
      getLabel(root).focus();
      await userEvent.keyboard('{Enter}');
      await waitForChanges();

      expect(click).toHaveReceivedEventTimes(1);
    });
  });

  it('turns the label into a button when it becomes clickable, and back', async () => {
    const { root, spyOnEvent, waitForChanges } = await render<HTMLMdsChipElement>(
      '<mds-chip label="a"></mds-chip>',
    );
    const click = spyOnEvent('mdsChipClickLabel');

    root.clickable = true;
    await waitForChanges();
    expect(getLabel(root)).toEqualAttributes({ role: 'button', tabindex: '0' });
    getLabel(root).focus();
    await userEvent.keyboard('{Enter}');
    await waitForChanges();
    expect(click).toHaveReceivedEventTimes(1);

    root.clickable = false;
    await waitForChanges();
    getLabel(root).click();
    await waitForChanges();
    expect(getLabel(root)).not.toHaveAttribute('role');
    expect(getLabel(root)).not.toHaveAttribute('tabindex');
    expect(click).toHaveReceivedEventTimes(1);
  });

  it('leaves a static chip without a role', async () => {
    const { root } = await render('<mds-chip label="a"></mds-chip>');

    expect(getLabel(root)).not.toHaveAttribute('role');
    expect(getLabel(root)).not.toHaveAttribute('aria-pressed');
  });
  describe('the label color variants', () => {
    /** The value that drives the paint; a variant with no block of its own never reaches it. */
    const painted = async (variant: string): Promise<string> => {
      const { root } = await render(
        `<mds-chip variant="${variant}" label="chip" icon="mi/baseline/palette"></mds-chip>`,
      );
      return getComputedStyle(root).getPropertyValue('--mds-chip-icon-background').trim();
    };

    it('paints every variant of the dictionary, none of them falling back', async () => {
      // red and purple were in the dictionary and in the tokens, but had no block here:
      // they painted the default, silently
      const fallback = await painted('there-is-no-such-variant');

      for (const variant of themeLabelVariantDictionary) {
        expect([variant, await painted(variant)]).not.toEqual([variant, fallback]);
      }
    });
  });
});

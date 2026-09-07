import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

const CONTROL_C = `
  <mds-keyboard try>
    <mds-keyboard-key name="control"></mds-keyboard-key>
    <mds-keyboard-key name="c"></mds-keyboard-key>
  </mds-keyboard>
`;

/**
 * Types a key combination into the focused `.shortcuts` area by dispatching the
 * same `keydown`/`keyup` sequence the component listens for. The trailing
 * `keyup` is what triggers the combination check.
 */
const typeCombination = async (
  host: HTMLElement,
  codes: string[],
  waitForChanges: () => Promise<void>,
): Promise<void> => {
  // Wait until the shortcuts area actually holds focus: a re-render between the
  // trigger click and the dispatch can blur it, which detaches the key
  // listeners and silently swallows the synthetic events.
  const shortcuts = await vi.waitFor(() => {
    const shortcutsEl = host.shadowRoot?.querySelector<HTMLElement>('.shortcuts');
    if (!shortcutsEl || host.shadowRoot?.activeElement !== shortcutsEl) {
      throw new Error('the shortcuts area is not focused');
    }
    return shortcutsEl;
  });
  codes.forEach((code) =>
    shortcuts.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true })),
  );
  shortcuts.dispatchEvent(
    new KeyboardEvent('keyup', { code: codes[codes.length - 1], bubbles: true }),
  );
  await waitForChanges();
};

describe('mds-keyboard', () => {
  it('renders', async () => {
    const { root } = await render('<mds-keyboard></mds-keyboard>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('does not render the combination checker without the `try` attribute', async () => {
    const { root } = await render(
      '<mds-keyboard><mds-keyboard-key name="control"></mds-keyboard-key></mds-keyboard>',
    );

    expect(root.shadowRoot!.querySelector('.combination-checker')).toBeNull();
  });

  it('renders the combination checker with the `try` attribute', async () => {
    const { root } = await render(CONTROL_C);

    expect(root.shadowRoot!.querySelector('.combination-checker')).not.toBeNull();
  });

  describe('with the combination checker', () => {
    let host: HTMLMdsKeyboardElement;
    let button: HTMLElement;
    let waitForChanges: () => Promise<void>;

    beforeEach(async () => {
      ({ root: host, waitForChanges } = await render<HTMLMdsKeyboardElement>(CONTROL_C));
      button = host.shadowRoot!.querySelector<HTMLElement>('.combination-checker')!;
    });

    const clickButton = async (): Promise<void> => {
      await userEvent.click(button);
      await waitForChanges();
    };

    it('starts the keyboard test when clicked', async () => {
      await clickButton();

      // `startKeyboardShortcutTest` makes the shortcuts area focusable and puts
      // the trigger button in its awaiting state.
      expect(host.shadowRoot!.querySelector('.shortcuts')).toEqualAttribute('tabindex', '0');
      expect(button).toHaveAttribute('await');
    });

    it('clears a previous result when restarted', async () => {
      host.test = 'pass';
      await waitForChanges();

      await clickButton();

      expect(host).not.toHaveAttribute('test');
    });

    it('passes when the typed combination matches', async () => {
      await clickButton();
      await typeCombination(host, ['ControlLeft', 'KeyC'], waitForChanges);

      expect(host).toEqualAttribute('test', 'pass');
    });

    it('fails when the typed combination does not match', async () => {
      await clickButton();
      await typeCombination(host, ['ControlLeft', 'KeyD'], waitForChanges);

      expect(host).toEqualAttribute('test', 'fail');
    });

    it('can be run again after a first check', async () => {
      await clickButton();
      await typeCombination(host, ['ControlLeft', 'KeyD'], waitForChanges);
      expect(host).toEqualAttribute('test', 'fail');

      await clickButton();
      await typeCombination(host, ['ControlLeft', 'KeyC'], waitForChanges);
      expect(host).toEqualAttribute('test', 'pass');
    });
  });
});

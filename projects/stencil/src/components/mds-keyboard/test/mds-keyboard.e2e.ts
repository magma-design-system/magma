import { E2EElement, E2EPage, newE2EPage } from '@stencil/core/testing';

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
const typeCombination = async (page: E2EPage, codes: string[]): Promise<void> => {
  await page.$eval(
    'mds-keyboard',
    (host: HTMLElement, keyCodes: string[]) => {
      const shortcuts = host.shadowRoot?.querySelector('.shortcuts') as HTMLElement;
      keyCodes.forEach((code) =>
        shortcuts.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true })),
      );
      shortcuts.dispatchEvent(
        new KeyboardEvent('keyup', { code: keyCodes[keyCodes.length - 1], bubbles: true }),
      );
    },
    codes,
  );
  await page.waitForChanges();
};

describe('mds-keyboard', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-keyboard></mds-keyboard>');

    const element = await page.find('mds-keyboard');
    expect(element).toHaveAttribute('hydrated');
  });

  it('does not render the combination checker without the `try` attribute', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<mds-keyboard><mds-keyboard-key name="control"></mds-keyboard-key></mds-keyboard>',
    );

    const button = await page.find('mds-keyboard >>> .combination-checker');
    expect(button).toBeNull();
  });

  it('renders the combination checker with the `try` attribute', async () => {
    const page = await newE2EPage();
    await page.setContent(CONTROL_C);

    const button = await page.find('mds-keyboard >>> .combination-checker');
    expect(button).not.toBeNull();
  });

  describe('combination checker button click', () => {
    let page: E2EPage;
    let button: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage();
      await page.setContent(CONTROL_C);
      button = await page.find('mds-keyboard >>> .combination-checker');
    });

    it('starts the keyboard test when clicked', async () => {
      await button.click();
      await page.waitForChanges();

      // `startKeyboardShortcutTest` makes the shortcuts area focusable and puts
      // the trigger button in its awaiting state.
      const shortcuts = await page.find('mds-keyboard >>> .shortcuts');
      expect(shortcuts).toEqualAttribute('tabindex', '0');
      expect(button).toHaveAttribute('await');
    });

    it('clears a previous result when restarted', async () => {
      await page.$eval('mds-keyboard', (host: HTMLMdsKeyboardElement) => {
        host.test = 'pass';
      });
      await page.waitForChanges();

      await button.click();
      await page.waitForChanges();

      const element = await page.find('mds-keyboard');
      expect(element).not.toHaveAttribute('test');
    });
  });

  describe('combination checking', () => {
    let page: E2EPage;
    let button: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage();
      await page.setContent(CONTROL_C);
      button = await page.find('mds-keyboard >>> .combination-checker');
    });

    it('passes when the typed combination matches', async () => {
      await button.click();
      await page.waitForChanges();

      await typeCombination(page, ['ControlLeft', 'KeyC']);

      const element = await page.find('mds-keyboard');
      expect(element).toEqualAttribute('test', 'pass');
    });

    it('fails when the typed combination does not match', async () => {
      await button.click();
      await page.waitForChanges();

      await typeCombination(page, ['ControlLeft', 'KeyD']);

      const element = await page.find('mds-keyboard');
      expect(element).toEqualAttribute('test', 'fail');
    });

    it('can be run again after a first check', async () => {
      await button.click();
      await page.waitForChanges();
      await typeCombination(page, ['ControlLeft', 'KeyD']);

      let element = await page.find('mds-keyboard');
      expect(element).toEqualAttribute('test', 'fail');

      await button.click();
      await page.waitForChanges();
      await typeCombination(page, ['ControlLeft', 'KeyC']);

      element = await page.find('mds-keyboard');
      expect(element).toEqualAttribute('test', 'pass');
    });
  });
});

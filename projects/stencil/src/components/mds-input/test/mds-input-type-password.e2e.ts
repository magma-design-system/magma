import { render } from '@stencil/vitest';

// type="password" (#1371): the mask that covers the native dots, from the start of the field up
// to the toggle, paints the fill of the field it covers and its ::before fades into it. A disabled
// field (its own disabled or a disabled fieldset, both disable the native input) paints the wash of
// .input:disabled, not --mds-input-background: the mask follows it, or the dots sit on the enabled
// fill with a band of the disabled one at the end.

let field: HTMLMdsInputElement;
let waitForChanges: () => Promise<void>;

/** Ends the transitions of the field, which fades its fill when it is disabled or enabled. */
const settle = async (): Promise<void> => {
  await waitForChanges();
  field
    .shadowRoot!.getAnimations()
    .filter((animation) => animation instanceof CSSTransition)
    .forEach((transition) => transition.finish());
};

/** Renders the markup and returns its root, the field or what holds it. */
const setup = async <T extends HTMLElement = HTMLElement>(html: string): Promise<T> => {
  const result = await render<T>(html);
  waitForChanges = result.waitForChanges;
  field = (
    result.root.matches('mds-input') ? result.root : result.root.querySelector('mds-input')
  ) as HTMLMdsInputElement;
  await settle();
  return result.root;
};

const fillOf = (selector: string): string =>
  getComputedStyle(field.shadowRoot!.querySelector(selector)!).backgroundColor;

/** The last colour of the fade of the mask, the one it reaches at the toggle. */
const fadeEnd = (): string => {
  const mask = field.shadowRoot!.querySelector('.password-mask')!;
  const colours = getComputedStyle(mask, '::before').backgroundImage.match(/rgba?\([^)]*\)/g);
  return colours?.at(-1) ?? '';
};

describe('the password mask', () => {
  it.each([
    ['an enabled', ''],
    ['a read-only', 'readonly'],
    ['a disabled', 'disabled'],
  ])('paints the fill of %s field and fades into it', async (_, attribute) => {
    await setup(`<mds-input type="password" value="secret" ${attribute}></mds-input>`);

    expect(fillOf('.password-mask')).toBe(fillOf('.input'));
    expect(fadeEnd()).toBe(fillOf('.input'));
  });

  it('paints the fill of a field in a disabled fieldset, and the enabled one once it is enabled', async () => {
    const root = await setup(
      '<form><fieldset disabled><mds-input type="password" value="secret"></mds-input></fieldset></form>',
    );
    const disabledFill = fillOf('.input');

    expect(fillOf('.password-mask')).toBe(disabledFill);
    expect(fadeEnd()).toBe(disabledFill);

    root.querySelector('fieldset')!.disabled = false;
    await settle();

    expect(fillOf('.input')).not.toBe(disabledFill);
    expect(fillOf('.password-mask')).toBe(fillOf('.input'));
    expect(fadeEnd()).toBe(fillOf('.input'));
  });
});

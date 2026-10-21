import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

const readField = (range: HTMLElement): HTMLInputElement =>
  range.shadowRoot!.querySelector<HTMLInputElement>('input.field')!;

const readProgress = (range: HTMLElement): string =>
  range
    .shadowRoot!.querySelector<HTMLElement>('.track-progress')!
    .style.getPropertyValue('--mds-input-range-progress');

describe('mds-input-range', () => {
  it('renders', async () => {
    const { root } = await render('<mds-input-range></mds-input-range>');

    expect(root).toHaveAttribute('hydrated');
  });
});

// As on a native input, a step that is not a positive number falls back to 1 (#822)
describe('step', () => {
  it.each([
    ['', 50],
    ['value="30"', 30],
  ])('keeps a number with step="0" at load (%s)', async (attributes, expected) => {
    const { root } = await render<HTMLMdsInputRangeElement>(
      `<mds-input-range step="0" ${attributes}></mds-input-range>`,
    );

    expect(root.value).toBe(expected);
  });

  it('falls back to 1 for a step set to 0 after load', async () => {
    const { root, waitForChanges } = await render<HTMLMdsInputRangeElement>(
      '<mds-input-range value="20"></mds-input-range>',
    );

    root.step = 0;
    await waitForChanges();
    root.value = 33.4;
    await waitForChanges();

    expect(root.value).toBe(33);
  });
});

// Like a native input, a form reset brings back the value of load, thumb included (#822)
describe('form reset', () => {
  it.each([
    ['value="30"', 30],
    ['', 50],
  ])('brings back the value of load (%s)', async (attributes, expected) => {
    const { root: form, waitForChanges } = await render<HTMLFormElement>(
      `<form><mds-input-range name="r" ${attributes}></mds-input-range></form>`,
    );
    const range = form.querySelector('mds-input-range')!;
    readField(range).focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await waitForChanges();
    expect(range.value).toBe(expected + 2);

    form.reset();
    await waitForChanges();

    expect(range.value).toBe(expected);
    expect(readField(range).value).toBe(String(expected));
    expect(readProgress(range)).toBe(String(expected));
    expect(new FormData(form).get('r')).toBe(String(expected));
  });
});

// A disabled fieldset disables the form controls in it. It disabled the host, so the value was
// left out of the form, but not the input in its shadow root, which stayed editable (#822)
describe('in a disabled fieldset', () => {
  it('is disabled like a native range input, until the fieldset is enabled', async () => {
    const { root, waitForChanges } = await render<HTMLFormElement>(
      '<form><fieldset disabled><mds-input-range name="r" value="5"></mds-input-range></fieldset></form>',
    );
    const field = root.querySelector('mds-input-range')!;
    const native = () => field.shadowRoot!.querySelector('input')!;

    await vi.waitFor(() => expect(native().disabled).toBe(true));
    expect(new FormData(root).has('r')).toBe(false);

    root.querySelector('fieldset')!.disabled = false;
    await waitForChanges();

    expect(native().disabled).toBe(false);
    expect(new FormData(root).get('r')).toBe('5');
  });
});

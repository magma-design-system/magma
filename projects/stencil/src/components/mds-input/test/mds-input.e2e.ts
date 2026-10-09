import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

let mdsInput: HTMLMdsInputElement;
let waitForChanges: () => Promise<void>;

/** Renders the markup and returns the sibling button used to blur the input. */
const setup = async (html: string): Promise<HTMLElement> => {
  const result = await render<HTMLMdsInputElement>(html);
  mdsInput = result.root;
  waitForChanges = result.waitForChanges;
  return mdsInput.parentElement!.querySelector('button')!;
};

const type = async (element: HTMLElement, text: string): Promise<void> => {
  await userEvent.click(element);
  await userEvent.keyboard(text);
};

/** Blurs the input by clicking elsewhere, which triggers the validation. */
const blur = async (button: HTMLElement): Promise<void> => {
  await userEvent.click(button);
  await waitForChanges();
};

describe('mds-input', () => {
  let input: HTMLInputElement;

  beforeEach(async () => {
    await setup('<mds-input></mds-input>');
    input = mdsInput.shadowRoot!.querySelector('input')!;
  });

  it('renders default', async () => {
    expect(mdsInput).toHaveAttribute('hydrated');
    expect(input).not.toBeNull();
  });

  it('default type propagation', async () => {
    mdsInput.type = 'tel';
    await waitForChanges();

    expect(mdsInput).toEqualAttribute('type', 'tel');
    expect(input).toEqualAttribute('type', 'tel');
  });

  it('test input typing', async () => {
    const textInput = 'abc';
    expect(mdsInput.value).toEqual('');
    expect(await mdsInput.getErrors()).toBeNull();

    await type(mdsInput, textInput);

    expect(await mdsInput.getErrors()).toBeNull();
    expect(mdsInput.value).toBe(textInput);
  });

  it('mds-input type cf', async () => {
    mdsInput.type = 'cf';
    await waitForChanges();

    expect(mdsInput).toHaveAttribute('type');
    expect(mdsInput).toEqualAttribute('type', 'cf');
    expect(mdsInput.value).toEqual('');
  });
});

describe('cf validation', () => {
  let button: HTMLElement;

  beforeEach(async () => {
    button = await setup(`
      <mds-input type='cf'></mds-input>
      <button><button>
    `);
  });

  it('input type cf validation', async () => {
    const cf = 'MRCRSS83B21D704L';

    await type(mdsInput, cf);
    await blur(button);

    expect(mdsInput).toEqualAttribute('variant', 'success');
    expect(mdsInput.value).toEqual(cf);
    expect(await mdsInput.getErrors()).toBeNull();
  });

  it('input type cf with invalid cf', async () => {
    const cf = 'abcdefghi';

    await type(mdsInput, cf);
    await blur(button);

    expect(mdsInput).toEqualAttribute('variant', 'error');
    expect(mdsInput.value).toEqual(cf);
    expect(await mdsInput.getErrors()).not.toBeNull();
  });
});

describe('isbn validation', () => {
  let button: HTMLElement;

  beforeEach(async () => {
    button = await setup(`
      <mds-input type='isbn'></mds-input>
      <button><button>
    `);
  });

  it('input type isbn validation', async () => {
    const isbn = '9788843025343';

    await type(mdsInput, isbn);
    await blur(button);

    expect(mdsInput).toEqualAttribute('variant', 'success');
    expect(mdsInput.value).toEqual(isbn);
    expect(await mdsInput.getErrors()).toBeNull();
  });

  it('input type isbn with invalid isbn', async () => {
    const isbn = 'abcdefghi';

    await type(mdsInput, isbn);
    await blur(button);

    expect(mdsInput).toEqualAttribute('variant', 'error');
    expect(mdsInput.value).toEqual(isbn);
    expect(await mdsInput.getErrors()).not.toBeNull();
  });
});

describe('custom validation', () => {
  let button: HTMLElement;

  beforeEach(async () => {
    button = await setup(`
      <mds-input></mds-input>
      <button><button>
    `);
  });

  it('test custom upper validation', async () => {
    const lower = 'abcd';
    const upper = 'ABCD';

    await mdsInput.addValidator((value: string) =>
      value.toUpperCase() === value ? null : { err: 'lower case' },
    );

    await type(mdsInput, lower);
    await blur(button);

    expect(await mdsInput.getErrors()).toEqual({ err: 'lower case' });
    expect(mdsInput).toEqualAttribute('variant', 'error');

    // simulate browser select so text can be replaced
    await userEvent.tripleClick(mdsInput);
    await userEvent.keyboard(upper);
    await blur(button);

    expect(await mdsInput.getErrors()).toBeNull();
    expect(mdsInput).toEqualAttribute('variant', 'success');
  });
});

describe('form submit', () => {
  it('check submit value', async () => {
    const { root: form } = await render<HTMLFormElement>(`
      <form>
        <mds-input id="i1" name="i1"></mds-input>
        <mds-input id="i2" name="i2"></mds-input>
        <button type="submit"><button>
      </form>
    `);
    const mdsInputField1 = form.querySelector<HTMLMdsInputElement>('#i1')!;
    const mdsInputField2 = form.querySelector<HTMLMdsInputElement>('#i2')!;

    const text1 = 'bella la bestia';
    const text2 = '90min';
    await type(mdsInputField1, text1);
    await type(mdsInputField2, text2);

    form.addEventListener('submit', (event) => event.preventDefault());
    await userEvent.click(form.querySelector('button')!);

    expect((form.elements.namedItem('i1') as HTMLMdsInputElement).value).toEqual(text1);
    expect((form.elements.namedItem('i2') as HTMLMdsInputElement).value).toEqual(text2);
  });
});

describe('password mask', () => {
  it('follows the corners of the input', async () => {
    // The mask paints the input background over the native dots: its outer corners must match
    // the input, otherwise the background sticks out of the rounded border while typing.
    await setup(
      '<mds-input type="password" value="secret" style="--mds-input-border-radius: 20px"></mds-input>',
    );
    const input = mdsInput.shadowRoot!.querySelector('input')!;
    const mask = mdsInput.shadowRoot!.querySelector<HTMLElement>('.password-mask')!;
    const inputStyle = getComputedStyle(input);
    const maskStyle = getComputedStyle(mask);

    expect(mask).not.toBeNull();
    expect(inputStyle.borderTopLeftRadius).toBe('20px');
    expect(maskStyle.borderTopLeftRadius).toBe(inputStyle.borderTopLeftRadius);
    expect(maskStyle.borderBottomLeftRadius).toBe(inputStyle.borderBottomLeftRadius);
    expect(maskStyle.borderTopRightRadius).toBe('0px');
    expect(maskStyle.borderBottomRightRadius).toBe('0px');
  });

  describe('accessible name', () => {
    it('names its native control after the aria-label of the host', async () => {
      await setup('<mds-input aria-label="Email"></mds-input><button></button>');

      expect(mdsInput.shadowRoot!.querySelector('input')).toEqualAttribute('aria-label', 'Email');
    });

    it('names a textarea the same way', async () => {
      await setup('<mds-input type="textarea" aria-label="Note"></mds-input><button></button>');

      expect(mdsInput.shadowRoot!.querySelector('textarea')).toEqualAttribute('aria-label', 'Note');
    });
  });
});

describe('required', () => {
  afterEach(() => {
    document.querySelectorAll('body > mds-input').forEach((input) => input.remove());
  });

  // Angular and Vue bind null for a missing value, before the first render
  it('shows the required state, not the success one, when the value is null', async () => {
    const input = document.createElement('mds-input');
    input.required = true;
    (input as { value: string | null }).value = null;
    document.body.appendChild(input);
    await vi.waitFor(() => expect(input).toHaveAttribute('hydrated'));

    const tip = input.shadowRoot!.querySelector('mds-input-tip-item[variant^="required"]');
    expect(tip).toEqualAttribute('variant', 'required');
  });
});

// The React wrappers under SSR set the props on an element that has already loaded (#786)
describe('rules set after load', () => {
  let button: HTMLElement;

  const requiredTip = (): Element | null =>
    mdsInput.shadowRoot!.querySelector('mds-input-tip-item[variant^="required"]');

  beforeEach(async () => {
    button = await setup(`
      <mds-input></mds-input>
      <button></button>
    `);
  });

  it('applies required: red tip, validator, error variant on blur', async () => {
    mdsInput.required = true;
    await waitForChanges();

    expect(requiredTip()).toEqualAttribute('variant', 'required');
    expect(await mdsInput.hasValidator()).toBe(true);

    await userEvent.click(mdsInput);
    await blur(button);

    expect(mdsInput).toEqualAttribute('variant', 'error');
    expect(await mdsInput.getErrors()).toEqual({ required: '' });

    await type(mdsInput, 'abc');
    await blur(button);

    expect(mdsInput).toEqualAttribute('variant', 'success');
    expect(requiredTip()).toEqualAttribute('variant', 'required-success');
  });

  it('goes back to the pristine look when required is removed from a field in error', async () => {
    mdsInput.required = true;
    await waitForChanges();
    await userEvent.click(mdsInput);
    await blur(button);
    expect(mdsInput).toEqualAttribute('variant', 'error');

    mdsInput.required = false;
    await waitForChanges();

    expect(mdsInput).toEqualAttribute('variant', 'primary');
    expect(requiredTip()).toBeNull();
    expect(await mdsInput.hasValidator()).toBe(false);
  });

  it('keeps the custom validators when a rule changes', async () => {
    const upperCase = (value: string) =>
      value.toUpperCase() === value ? null : { err: 'lower case' };
    await mdsInput.addValidator(upperCase);

    mdsInput.required = true;
    await waitForChanges();

    expect(await mdsInput.hasValidator(upperCase)).toBe(true);

    await type(mdsInput, 'abc');
    await blur(button);

    expect(await mdsInput.getErrors()).toEqual({ err: 'lower case' });
  });

  it('replaces a rule instead of stacking it', async () => {
    mdsInput.type = 'number';
    mdsInput.max = '10';
    await waitForChanges();
    mdsInput.max = '100';
    await waitForChanges();

    await type(mdsInput, '50');
    await blur(button);

    expect(await mdsInput.getErrors()).toBeNull();
    expect(mdsInput).toEqualAttribute('variant', 'success');
  });

  it('applies the validators of a type set after load', async () => {
    mdsInput.type = 'isbn';
    await waitForChanges();

    await type(mdsInput, 'abcdefghi');
    await blur(button);

    expect(mdsInput).toEqualAttribute('variant', 'error');
    expect(await mdsInput.getErrors()).not.toBeNull();
  });
});

describe('min and max', () => {
  it('checks min against its own value, not the one of max', async () => {
    const button = await setup(`
      <mds-input type="number" min="5" max="10"></mds-input>
      <button></button>
    `);

    await type(mdsInput, '7');
    await blur(button);

    expect(await mdsInput.getErrors()).toBeNull();
    expect(mdsInput).toEqualAttribute('variant', 'success');
  });

  it('rejects a value under min', async () => {
    const button = await setup(`
      <mds-input type="number" min="5" max="10"></mds-input>
      <button></button>
    `);

    await type(mdsInput, '3');
    await blur(button);

    expect(await mdsInput.getErrors()).toEqual({ min: 'valore minimo 5' });
    expect(mdsInput).toEqualAttribute('variant', 'error');
  });

  it('takes 0 as a bound', async () => {
    const button = await setup(`
      <mds-input type="number" min="0"></mds-input>
      <button></button>
    `);

    await type(mdsInput, '-2');
    await blur(button);

    expect(await mdsInput.getErrors()).toEqual({ min: 'valore minimo 0' });
  });
});

// Like a native control, an invalid field stops the submit of its form (#786)
describe('form validity', () => {
  let form: HTMLFormElement;
  let submitted: boolean;

  const setupForm = async (html: string): Promise<void> => {
    const result = await render<HTMLFormElement>(`<form>${html}<button>Send</button></form>`);
    form = result.root;
    waitForChanges = result.waitForChanges;
    mdsInput = form.querySelector('mds-input')!;
    submitted = false;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitted = true;
    });
  };

  it('stops the submit while a required field is empty', async () => {
    await setupForm('<mds-input name="email" required></mds-input>');

    expect(form.checkValidity()).toBe(false);
    expect(mdsInput.matches(':invalid')).toBe(true);

    form.requestSubmit();

    expect(submitted).toBe(false);
  });

  it('submits once the required field is filled', async () => {
    await setupForm('<mds-input name="email" required></mds-input>');

    await type(mdsInput, 'abc');

    expect(form.checkValidity()).toBe(true);
    form.requestSubmit();
    expect(submitted).toBe(true);
  });

  it('shows the error on the field a stopped submit points at', async () => {
    await setupForm('<mds-input name="email" required></mds-input>');

    form.requestSubmit();
    await waitForChanges();

    expect(mdsInput).toEqualAttribute('variant', 'error');
  });

  it('focuses the native input when a stopped submit points at the field', async () => {
    await setupForm('<mds-input name="email" required></mds-input>');

    form.requestSubmit();

    expect(document.activeElement).toBe(mdsInput);
    expect(mdsInput.shadowRoot!.activeElement).toBe(mdsInput.shadowRoot!.querySelector('input'));
  });

  it('follows a required set after load', async () => {
    await setupForm('<mds-input name="email"></mds-input>');
    expect(form.checkValidity()).toBe(true);

    mdsInput.required = true;

    expect(form.checkValidity()).toBe(false);
  });

  it('follows a value set by code, without waiting for a render', async () => {
    await setupForm('<mds-input name="email" required></mds-input>');

    mdsInput.value = 'abc';

    expect(form.checkValidity()).toBe(true);
  });

  it('stops the submit for the other rules too', async () => {
    await setupForm('<mds-input name="n" type="number" max="10" value="50"></mds-input>');

    expect(form.checkValidity()).toBe(false);

    mdsInput.value = '5';

    expect(form.checkValidity()).toBe(true);
  });

  it('stops the submit for a custom validator, and no more once it is removed', async () => {
    await setupForm('<mds-input name="code" value="abc"></mds-input>');
    const upperCase = (value: string) =>
      value.toUpperCase() === value ? null : { err: 'lower case' };

    await mdsInput.addValidator(upperCase);
    expect(form.checkValidity()).toBe(false);

    await mdsInput.removeValidator(upperCase);
    expect(form.checkValidity()).toBe(true);
  });

  it('does not stop the submit when disabled', async () => {
    await setupForm('<mds-input name="email" required disabled></mds-input>');

    expect(form.checkValidity()).toBe(true);
  });

  it('does not stop the submit when read-only, like a native input', async () => {
    await setupForm('<mds-input name="email" required readonly></mds-input>');

    expect(form.checkValidity()).toBe(true);
  });
});

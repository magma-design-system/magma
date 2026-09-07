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

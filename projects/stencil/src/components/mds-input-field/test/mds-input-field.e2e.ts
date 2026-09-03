import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

describe('mds-input-field', () => {
  const setup = async (html: string) => {
    const { root, waitForChanges } = await render(html);
    const mdsInput = root.querySelector<HTMLMdsInputElement>('mds-input')!;
    const label = root.shadowRoot!.querySelector('.label')!;
    const message = root.shadowRoot!.querySelector('.message')!;
    /** Types into the input, then blurs it by clicking the sibling button to trigger the validation. */
    const typeAndBlur = async (text: string): Promise<void> => {
      await userEvent.click(mdsInput);
      await userEvent.keyboard(text);
      await userEvent.click(root.parentElement!.querySelector('button')!);
      await waitForChanges();
    };
    return { element: root, mdsInput, label, message, typeAndBlur };
  };

  it('render default', async () => {
    const { element, label, message } = await setup(
      '<mds-input-field><mds-input><mds-input></mds-input-field>',
    );

    expect(element).toHaveAttribute('hydrated');
    expect(label).toBeTruthy();
    expect(label.textContent).toBe('');
    expect(message).toBeTruthy();
    expect(message.textContent).toBe('');
  });

  it('render error message on cf input type', async () => {
    const { element, message, typeAndBlur } = await setup(
      '<mds-input-field><mds-input type="cf"><mds-input></mds-input-field><button><button>',
    );

    const errorMessage = [
      'Codice fiscale inserito non corretto',
      'Codice fiscale deve essere lungo 16 caratteri',
    ];
    await typeAndBlur('abc');

    expect(element).toEqualAttribute('variant', 'error');
    expect(message).toBeTruthy();
    const errorsElement = Array.from(message.querySelectorAll('mds-text'));
    expect(errorsElement.length).toEqual(2);
    errorsElement.forEach((errorElement, index) => {
      expect(errorElement.textContent).toBe(errorMessage[index]);
    });
  });

  it('render variant success when input is valid', async () => {
    const { element, message, typeAndBlur } = await setup(
      '<mds-input-field><mds-input type="cf"><mds-input></mds-input-field><button><button>',
    );

    await typeAndBlur('MRCRSS83B21D704L');

    expect(element).toEqualAttribute('variant', 'success');
    expect(message).toBeTruthy();
    expect(message.textContent).toBe('');
  });

  it('render label', async () => {
    const { label } = await setup(
      '<mds-input-field label="codice fiscale"><mds-input type="cf"><mds-input></mds-input-field><button><button>',
    );

    expect(label.textContent).toBe('codice fiscale');
  });

  it('should not change message if there are no validator', async () => {
    const m = 'custom message that should not change';
    const { message, typeAndBlur } = await setup(
      `<mds-input-field label="Label" message="${m}"><mds-input><mds-input></mds-input-field><button><button>`,
    );

    await typeAndBlur('abc');

    expect(message.textContent).toBe(m);
  });
});

import { render } from '@stencil/vitest';
import { commands, userEvent } from 'vitest/browser';

declare module 'vitest/browser' {
  interface BrowserCommands {
    // defined in vitest.config.mts, run in Node
    compileTailwind: (css: string) => Promise<string>;
  }
}

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
      'The tax code entered is not correct',
      'The tax code must be 16 characters long',
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

  // #1072: the messages of mds-input were Italian literals, whatever the language of the page
  describe('in the language of the page', () => {
    afterEach(() => {
      document.documentElement.removeAttribute('lang');
    });

    it.each([
      ['en', 'Invalid email address'],
      ['it', 'indirizzo email non valido'],
      ['es', 'Dirección de correo electrónico no válida'],
      ['el', 'Μη έγκυρη διεύθυνση email'],
    ])('shows the validation message in %s', async (language, text) => {
      document.documentElement.lang = language;
      const { message, typeAndBlur } = await setup(
        '<mds-input-field label="Email"><mds-input type="email" required></mds-input></mds-input-field><button></button>',
      );

      await typeAndBlur('a');

      expect(Array.from(message.querySelectorAll('mds-text')).map((m) => m.textContent)).toEqual([
        text,
      ]);
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

  it('reads the validation of an input nested in the slotted element', async () => {
    const { root, waitForChanges } = await render(
      '<mds-input-field><mds-input-date-range><mds-input-date slot="start"></mds-input-date><mds-input-date slot="end"></mds-input-date></mds-input-date-range></mds-input-field>',
    );
    const start = root.querySelector<HTMLMdsInputDateElement>('mds-input-date[slot="start"]')!;

    // the range emits no validation of its own: the event bubbles from the date the user edited
    const input = start.shadowRoot!.querySelector('input')!;
    input.value = '2026-09-14';
    input.dispatchEvent(new Event('input'));
    await waitForChanges();

    expect(root).toEqualAttribute('variant', 'success');
  });

  it('should not change message if there are no validator', async () => {
    const m = 'custom message that should not change';
    const { message, typeAndBlur } = await setup(
      `<mds-input-field label="Label" message="${m}"><mds-input><mds-input></mds-input-field><button><button>`,
    );

    await typeAndBlur('abc');

    expect(message.textContent).toBe(m);
  });

  describe('accessible name', () => {
    it('passes its label down to the control it slots', async () => {
      const { mdsInput } = await setup(
        '<mds-input-field label="Password"><mds-input></mds-input></mds-input-field>',
      );

      expect(mdsInput).toEqualAttribute('aria-label', 'Password');
      expect(mdsInput.shadowRoot!.querySelector('input')).toEqualAttribute(
        'aria-label',
        'Password',
      );
    });

    it('leaves a name written on the control alone', async () => {
      const { mdsInput } = await setup(
        '<mds-input-field label="Password"><mds-input aria-label="Codice"></mds-input></mds-input-field>',
      );

      expect(mdsInput).toEqualAttribute('aria-label', 'Codice');
    });
  });

  // #1189 rhythm/label-control
  it('stands its label 12px from its control', async () => {
    const { mdsInput, label } = await setup(
      '<mds-input-field label="CAP"><mds-input></mds-input></mds-input-field>',
    );

    expect(mdsInput.getBoundingClientRect().top - label.getBoundingClientRect().bottom).toBeCloseTo(
      12,
      0,
    );
  });

  // #1189 widths/field: short states that the answer is short, the field-group of styles lays the
  // field out on half the column
  describe('short', () => {
    let sheet: HTMLStyleElement;

    const group = (width: number) =>
      render(`
        <fieldset class="field-group" style="width: ${width}px">
          <mds-input-field label="Via"><mds-input></mds-input></mds-input-field>
          <mds-input-field label="Numero civico" short><mds-input></mds-input></mds-input-field>
          <mds-input-field label="CAP" short><mds-input></mds-input></mds-input-field>
        </fieldset>`);
    const widths = (root: HTMLElement): number[] =>
      Array.from(root.querySelectorAll('mds-input-field')).map(
        (field) => field.getBoundingClientRect().width,
      );

    beforeAll(async () => {
      sheet = document.createElement('style');
      sheet.textContent = await commands.compileTailwind(
        [
          "@import 'tailwindcss/theme.css' layer(theme);",
          "@import '@maggioli-design-system/styles/dist/css/typography.css' layer(theme);",
          "@import '@maggioli-design-system/styles/dist/tailwind/theme.css';",
          "@import '@maggioli-design-system/styles/dist/tailwind/typography.css';",
          "@import '@maggioli-design-system/styles/dist/tailwind/utilities.css';",
          "@source inline('field-group');",
          '@tailwind utilities source(none);',
        ].join('\n'),
      );
      document.head.append(sheet);
    });

    afterAll(() => {
      sheet.remove();
    });

    it('reflects on its host, where the field-group reads it', async () => {
      const { root, waitForChanges } = await render<HTMLMdsInputFieldElement>(
        '<mds-input-field label="CAP"><mds-input></mds-input></mds-input-field>',
      );
      expect(root).not.toHaveAttribute('short');

      root.short = true;
      await waitForChanges();

      expect(root).toHaveAttribute('short');
    });

    it('pairs two short fields from 28rem, half the column each, the other field on the whole of it', async () => {
      const { root } = await group(448);
      const [street, number, postcode] = Array.from(root.querySelectorAll('mds-input-field'));

      expect(widths(root)).toEqual([448, 212, 212]);
      expect(number.getBoundingClientRect().top).toBe(postcode.getBoundingClientRect().top);
      expect(number.getBoundingClientRect().top).toBeGreaterThan(
        street.getBoundingClientRect().bottom,
      );
    });

    it('stacks them under 28rem, each on the whole column', async () => {
      const { root } = await group(447);

      expect(widths(root)).toEqual([447, 447, 447]);
    });
  });
});

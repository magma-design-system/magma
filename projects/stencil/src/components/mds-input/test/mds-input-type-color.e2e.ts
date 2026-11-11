import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

// type="color" (#1260): a text field where a colour code is typed and validated, with a swatch at
// its start that opens the colour picker of the platform. The value, in the event and in the
// form, is the colour as #rrggbb in lower case, or '' while the text names none.

const COLOR_MESSAGE = 'Enter a hex colour code, such as #2f6fd0';

let field: HTMLMdsInputElement;
let waitForChanges: () => Promise<void>;
let changes: (string | undefined)[];

/** Renders the markup, records the values of mdsInputChange and returns the root. */
const setup = async <T extends HTMLElement = HTMLElement>(html: string): Promise<T> => {
  const result = await render<T>(html);
  waitForChanges = result.waitForChanges;
  field = (
    result.root.matches('mds-input') ? result.root : result.root.querySelector('mds-input')
  ) as HTMLMdsInputElement;
  changes = [];
  field.addEventListener('mdsInputChange', (event) =>
    changes.push((event as CustomEvent<{ value?: string }>).detail.value as string | undefined),
  );
  return result.root;
};

const text = (): HTMLInputElement => field.shadowRoot!.querySelector<HTMLInputElement>('.input')!;
const swatch = (): HTMLButtonElement =>
  field.shadowRoot!.querySelector<HTMLButtonElement>('.swatch')!;
const picker = (): HTMLInputElement =>
  field.shadowRoot!.querySelector<HTMLInputElement>('.color-picker')!;

const typeText = async (value: string): Promise<void> => {
  await userEvent.click(text());
  await userEvent.keyboard(value);
  await waitForChanges();
};

/** Leaves the field for the button after it, which rewrites and validates it. */
const leave = async (): Promise<void> => {
  await userEvent.click(document.querySelector<HTMLElement>('button.after')!);
  await waitForChanges();
};

/** Picks a colour in the picker of the platform, as the browser does: its value, then input. */
const pick = async (hex: string): Promise<void> => {
  picker().value = hex;
  picker().dispatchEvent(new Event('input', { bubbles: true }));
  await waitForChanges();
};

describe('type color', () => {
  describe('the text', () => {
    it('is a text field, where the code is typed', async () => {
      await setup('<mds-input type="color"></mds-input>');

      expect(text().type).toBe('text');
      expect(text().spellcheck).toBe(false);
      expect(field.value).toBe('');
    });

    it.each([
      ['#2F6FD0', '#2f6fd0'],
      ['2f6fd0', '#2f6fd0'],
      ['#abc', '#aabbcc'],
      ['ABC', '#aabbcc'],
    ])('takes %s as %s, and writes it so when the field is left', async (typed, color) => {
      await setup('<div><mds-input type="color"></mds-input><button class="after"></button></div>');

      await typeText(typed);

      expect(field.value).toBe(color);
      // as typed, until the field is left
      expect(text().value).toBe(typed);

      await leave();

      expect(text().value).toBe(color);
      expect(field).toEqualAttribute('variant', 'success');
      expect(await field.getErrors()).toBeNull();
    });

    it('takes a code with the spaces a paste brings around it', async () => {
      await setup('<div><mds-input type="color"></mds-input><button class="after"></button></div>');

      await typeText(' #A89586 ');

      expect(field.value).toBe('#a89586');
      await leave();
      expect(text().value).toBe('#a89586');
    });

    it.each(['red', '#abcd', '#12345', '#aabbccdd', 'rgb(0 0 0)', '#ggg'])(
      'finds no colour in %s: an error, and the value empty',
      async (typed) => {
        await setup(
          '<div><mds-input type="color"></mds-input><button class="after"></button></div>',
        );

        await typeText(typed);
        await leave();

        expect(field.value).toBe('');
        // the text stays as typed, for the user to correct
        expect(text().value).toBe(typed);
        expect(field).toEqualAttribute('variant', 'error');
        expect(await field.getErrors()).toEqual({ color: COLOR_MESSAGE });
      },
    );

    it('shows the message in the language of the page', async () => {
      document.documentElement.lang = 'it';
      try {
        await setup(
          '<div><mds-input type="color"></mds-input><button class="after"></button></div>',
        );
        await typeText('rosso');
        await leave();

        expect(await field.getErrors()).toEqual({
          color: 'Inserisci un codice colore esadecimale, come #2f6fd0',
        });
      } finally {
        document.documentElement.removeAttribute('lang');
      }
    });

    it('turns green as soon as the text becomes a colour, once in error', async () => {
      await setup('<div><mds-input type="color"></mds-input><button class="after"></button></div>');
      await typeText('ab');
      await leave();
      expect(field).toEqualAttribute('variant', 'error');

      await typeText('c');

      expect(field.value).toBe('#aabbcc');
      expect(field).toEqualAttribute('variant', 'success');
    });

    it('accepts no pattern: the format of a colour is fixed', async () => {
      await setup(
        '<div><mds-input type="color" pattern="#0{6}"></mds-input><button class="after"></button></div>',
      );

      await typeText('#abcdef');
      await leave();

      expect(await field.getErrors()).toBeNull();
    });
  });

  describe('the value', () => {
    it('is written as #rrggbb when set by code, and shown in the text', async () => {
      await setup('<mds-input type="color" value="#ABC"></mds-input>');

      expect(field.value).toBe('#aabbcc');
      expect(text().value).toBe('#aabbcc');

      field.value = '2F6FD0';
      await waitForChanges();

      expect(field.value).toBe('#2f6fd0');
      expect(text().value).toBe('#2f6fd0');
      expect(changes.at(-1)).toBe('#2f6fd0');
    });

    it('shows a value set by code that is no colour, with the value empty', async () => {
      await setup('<mds-input type="color" value="#2f6fd0"></mds-input>');

      field.value = 'red';
      await waitForChanges();

      expect(field.value).toBe('');
      expect(text().value).toBe('red');
      expect(changes).toEqual(['']);
      expect(field.matches(':invalid')).toBe(true);
    });

    it('empties the text when set to an empty value by code', async () => {
      await setup('<mds-input type="color" value="#2f6fd0"></mds-input>');

      field.value = '';
      await waitForChanges();

      expect(text().value).toBe('');
      expect(field.matches(':invalid')).toBe(false);
    });

    it('is in the change event only as a colour, or empty when the text stops naming one', async () => {
      await setup('<mds-input type="color"></mds-input>');

      await typeText('a');
      await typeText('b');
      await typeText('c');
      await typeText('d');

      expect(changes).toEqual(['#aabbcc', '']);
    });
  });

  describe('in a form', () => {
    let form: HTMLFormElement;
    let submitted: boolean;

    const setupForm = async (html: string): Promise<void> => {
      form = await setup<HTMLFormElement>(
        `<form>${html}<button type="button" class="after">Blur</button></form>`,
      );
      submitted = false;
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        submitted = true;
      });
    };

    it('gives the form the colour as #rrggbb', async () => {
      await setupForm('<mds-input type="color" name="base"></mds-input>');

      await typeText('#ABC');

      expect(new FormData(form).get('base')).toBe('#aabbcc');
      expect(form.checkValidity()).toBe(true);
    });

    it('gives the form an empty value, and stops the submit, while the text names no colour', async () => {
      await setupForm('<mds-input type="color" name="base" value="#2f6fd0"></mds-input>');

      await userEvent.tripleClick(text());
      await userEvent.keyboard('blu');
      await waitForChanges();

      expect(new FormData(form).get('base')).toBe('');
      expect(form.checkValidity()).toBe(false);
      expect(field.matches(':invalid')).toBe(true);
      form.requestSubmit();
      expect(submitted).toBe(false);
      await waitForChanges();
      expect(field).toEqualAttribute('variant', 'error');
    });

    it('can stay empty when it is not required', async () => {
      await setupForm('<mds-input type="color" name="base"></mds-input>');

      await userEvent.click(text());
      await leave();

      expect(field).toEqualAttribute('variant', 'primary');
      expect(new FormData(form).get('base')).toBe('');
      form.requestSubmit();
      expect(submitted).toBe(true);
    });

    it('stops the submit while a required field is empty, and not once it holds a colour', async () => {
      await setupForm('<mds-input type="color" name="base" required></mds-input>');

      form.requestSubmit();
      expect(submitted).toBe(false);
      await waitForChanges();
      expect(await field.getErrors()).toEqual({ required: '' });

      await typeText('fff');
      form.requestSubmit();

      expect(submitted).toBe(true);
    });

    it('reports a required field with a text that names no colour as a bad colour, not as empty', async () => {
      await setupForm('<mds-input type="color" name="base" required></mds-input>');

      await typeText('xyz');
      await leave();

      expect(await field.getErrors()).toEqual({ color: COLOR_MESSAGE });
    });

    it('brings back the colour of load on reset, in the text and in the form', async () => {
      await setupForm('<mds-input type="color" name="base" value="#FFF"></mds-input>');
      await userEvent.tripleClick(text());
      await userEvent.keyboard('blu');
      await waitForChanges();
      await leave();
      expect(field).toEqualAttribute('variant', 'error');

      form.reset();
      await waitForChanges();

      expect(field.value).toBe('#ffffff');
      expect(text().value).toBe('#ffffff');
      expect(new FormData(form).get('base')).toBe('#ffffff');
      expect(field).toEqualAttribute('variant', 'primary');
      expect(form.checkValidity()).toBe(true);
    });

    it('brings back the text of load when it named no colour', async () => {
      await setupForm('<mds-input type="color" name="base"></mds-input>');
      await typeText('#abc');

      form.reset();
      await waitForChanges();

      expect(field.value).toBe('');
      expect(text().value).toBe('');
      expect(new FormData(form).get('base')).toBe('');
    });
  });

  describe('the swatch', () => {
    let showPicker: ReturnType<typeof vi.spyOn>;
    let opened: HTMLInputElement[];

    beforeEach(() => {
      opened = [];
      // the popup of the platform cannot be driven from a test: record which input opens it
      showPicker = vi.spyOn(HTMLInputElement.prototype, 'showPicker').mockImplementation(function (
        this: HTMLInputElement,
      ) {
        opened.push(this);
      });
    });

    afterEach(() => {
      showPicker.mockRestore();
    });

    it('draws the colour of the value, in a ring', async () => {
      await setup('<mds-input type="color" value="#2f6fd0"></mds-input>');

      const style = getComputedStyle(swatch());
      expect(style.backgroundColor).toBe('rgb(47, 111, 208)');
      expect(style.borderTopWidth).not.toBe('0px');
      expect(style.borderTopStyle).toBe('solid');
      expect(style.borderRadius).not.toBe('0px');
    });

    it('follows the text while it is typed, and is empty while the text names no colour', async () => {
      await setup('<mds-input type="color"></mds-input>');
      expect(getComputedStyle(swatch()).backgroundColor).toBe('rgba(0, 0, 0, 0)');

      await typeText('f00');
      expect(getComputedStyle(swatch()).backgroundColor).toBe('rgb(255, 0, 0)');

      await typeText('0');
      expect(getComputedStyle(swatch()).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      expect(getComputedStyle(swatch()).borderTopWidth).not.toBe('0px');
    });

    it('is a button named after what it does and the field it does it for', async () => {
      await setup('<mds-input type="color"></mds-input>');
      expect(swatch().tagName).toBe('BUTTON');
      expect(swatch()).toEqualAttribute('type', 'button');
      expect(swatch()).toEqualAttribute('aria-label', 'Choose a colour');

      field.setAttribute('aria-label', 'Base colour');
      await waitForChanges();

      expect(swatch()).toEqualAttribute('aria-label', 'Choose a colour for Base colour');
    });

    it('takes the label of mds-input-field in its name', async () => {
      const root = await setup(
        '<mds-input-field label="Colore di base"><mds-input type="color"></mds-input></mds-input-field>',
      );
      await vi.waitFor(() => expect(field).toEqualAttribute('aria-label', 'Colore di base'));
      await waitForChanges();

      expect(root.tagName).toBe('MDS-INPUT-FIELD');
      expect(swatch()).toEqualAttribute('aria-label', 'Choose a colour for Colore di base');
    });

    it('opens the picker of the platform, holding the colour of the value', async () => {
      await setup('<mds-input type="color" value="#2f6fd0"></mds-input>');

      await userEvent.click(swatch());

      expect(opened).toEqual([picker()]);
      expect(picker().type).toBe('color');
      expect(picker().value).toBe('#2f6fd0');
    });

    it('opens the picker on black when the field is empty, the default of the platform', async () => {
      await setup('<mds-input type="color"></mds-input>');

      await userEvent.click(swatch());

      expect(opened).toHaveLength(1);
      expect(picker().value).toBe('#000000');
    });

    it('opens from the keyboard', async () => {
      await setup('<mds-input type="color"></mds-input>');

      swatch().focus();
      await userEvent.keyboard('{Enter}');

      expect(opened).toHaveLength(1);
    });

    it('writes the colour picked in the text and the value, with the events of typing', async () => {
      const form = await setup<HTMLFormElement>(
        '<form><mds-input type="color" name="base" value="#2f6fd0"></mds-input></form>',
      );
      await userEvent.click(swatch());

      await pick('#a89586');

      expect(field.value).toBe('#a89586');
      expect(text().value).toBe('#a89586');
      expect(changes).toEqual(['#a89586']);
      expect(new FormData(form).get('base')).toBe('#a89586');
      expect(getComputedStyle(swatch()).backgroundColor).toBe('rgb(168, 149, 134)');
    });

    it('replaces a text that named no colour with the colour picked', async () => {
      await setup('<div><mds-input type="color"></mds-input><button class="after"></button></div>');
      await typeText('blu');
      await leave();
      expect(field).toEqualAttribute('variant', 'error');

      await pick('#0000ff');

      expect(text().value).toBe('#0000ff');
      expect(field).toEqualAttribute('variant', 'success');
    });

    it.each(['readonly', 'disabled'])('opens nothing on a %s field', async (attribute) => {
      await setup(`<mds-input type="color" value="#2f6fd0" ${attribute}></mds-input>`);

      expect(swatch().disabled).toBe(true);
      swatch().click();
      await pick('#ff0000');

      expect(opened).toEqual([]);
      expect(field.value).toBe('#2f6fd0');
      expect(changes).toEqual([]);
      // the colour stays in sight
      expect(getComputedStyle(swatch()).backgroundColor).toBe('rgb(47, 111, 208)');
    });

    it('hides the picker under it, out of reach of the keyboard and of assistive technologies', async () => {
      await setup('<mds-input type="color"></mds-input>');

      expect(picker()).toEqualAttribute('aria-hidden', 'true');
      expect(picker().tabIndex).toBe(-1);
      expect(getComputedStyle(picker()).opacity).toBe('0');
      expect(getComputedStyle(picker()).pointerEvents).toBe('none');
    });
  });

  describe('beside the other props', () => {
    /** The box of an element, relative to the box of the field. */
    const box = (element: Element) => {
      const outer = field.getBoundingClientRect();
      const inner = element.getBoundingClientRect();
      return {
        left: inner.left - outer.left,
        right: outer.right - inner.right,
        top: inner.top - outer.top,
        bottom: outer.bottom - inner.bottom,
        width: inner.width,
        height: inner.height,
      };
    };

    it.each([
      { size: 'lg', disc: 24 },
      { size: 'md', disc: 24 },
      { size: 'sm', disc: 16 },
    ])('draws the swatch as large as the glyph of an icon at $size', async ({ size, disc }) => {
      await setup(`<mds-input type="color" size="${size}" value="#2f6fd0"></mds-input>`);

      const { width, height, left, top, bottom } = box(swatch());
      expect(width).toBe(disc);
      expect(height).toBe(disc);
      expect(left).toBeGreaterThan(0);
      // centred in the height of the field
      expect(top).toBe(bottom);
      // the text starts after it
      expect(parseFloat(getComputedStyle(text()).paddingLeft)).toBeGreaterThan(left + width);
    });

    it('stands where the icon goes, and ignores icon', async () => {
      await setup('<mds-input type="color" icon="mi/baseline/pets"></mds-input>');

      expect(field.shadowRoot!.querySelector('mds-icon.icon')).toBeNull();
      expect(swatch()).not.toBeNull();
    });

    it('keeps out the icon of the ai variant', async () => {
      await setup('<mds-input type="color" variant="ai"></mds-input>');

      expect(field.shadowRoot!.querySelector('mds-icon.icon')).toBeNull();
    });

    it('stays while awaiting, the spinner at the end of the field', async () => {
      await setup('<mds-input type="color" value="#2f6fd0" await></mds-input>');

      const spinner = field.shadowRoot!.querySelector('.await')!;
      expect(swatch()).not.toBeNull();
      expect(box(spinner).right).toBe(box(swatch()).left);
      expect(text()).toHaveClass('has-right-icon');
      expect(parseFloat(getComputedStyle(text()).paddingRight)).toBeGreaterThan(
        box(spinner).right + box(spinner).width,
      );
    });

    it('ignores mic: a colour code is typed or picked', async () => {
      await setup('<mds-input type="color" mic></mds-input>');

      expect(field.shadowRoot!.querySelector('.mic-toggle-button')).toBeNull();
      expect(text()).not.toHaveClass('has-right-icon');
    });

    it('becomes a colour field when its type changes after load', async () => {
      await setup('<mds-input value="#ABC"></mds-input>');
      expect(swatch()).toBeNull();

      field.type = 'color';
      await waitForChanges();

      expect(field.value).toBe('#aabbcc');
      expect(text().value).toBe('#aabbcc');
      expect(text().type).toBe('text');
      expect(swatch()).not.toBeNull();
    });
  });

  describe('in mds-input-field', () => {
    it('shows the error message of a text that names no colour', async () => {
      const root = await setup(
        '<div><mds-input-field label="Colore"><mds-input type="color"></mds-input></mds-input-field><button class="after"></button></div>',
      );
      const wrapper = root.querySelector('mds-input-field')!;

      await typeText('blu');
      await leave();

      await vi.waitFor(() => expect(wrapper.message).toBe(COLOR_MESSAGE));
      expect(wrapper).toEqualAttribute('variant', 'error');
    });
  });
});

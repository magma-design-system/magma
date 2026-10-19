import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { childOpacityBeforeHydration, hostOpacityBeforeHydration } from '@test/fouc';

const readCells = (otp: HTMLElement): string[] =>
  Array.from(otp.shadowRoot!.querySelectorAll('mds-input')).map((cell) => cell.value ?? '');

describe('mds-input-otp', () => {
  it('renders', async () => {
    const { root } = await render('<mds-input-otp></mds-input-otp>');

    expect(root).toHaveAttribute('hydrated');
  });

  // its FOUC sheet was written and never imported (#1004): the host and the digits showed
  // unstyled until they hydrated
  it('stays hidden until it hydrates, and so does a digit', async () => {
    const { root } = await render('<mds-input-otp length="1"></mds-input-otp>');

    expect(await hostOpacityBeforeHydration(root)).toBe('0');
    expect(childOpacityBeforeHydration(root, 'mds-input')).toBe('0');
  });

  describe('accessible name', () => {
    it('announces each digit as a position inside the code', async () => {
      const { root } = await render('<mds-input-otp length="3"></mds-input-otp>');
      const digits = Array.from(root.shadowRoot!.querySelectorAll('mds-input'));

      expect(digits.map((digit) => digit.getAttribute('aria-label'))).toEqual([
        'Digit 1 of 3',
        'Digit 2 of 3',
        'Digit 3 of 3',
      ]);
    });

    it('puts the name of the code in front of each digit', async () => {
      const { root } = await render(
        '<mds-input-otp length="2" aria-label="Codice di verifica"></mds-input-otp>',
      );
      const [first] = Array.from(root.shadowRoot!.querySelectorAll('mds-input'));

      expect(first).toEqualAttribute('aria-label', 'Codice di verifica, Digit 1 of 2');
    });
  });
});

// The value fills the cells, and a form reset brings back the code of load (#822)
describe('value', () => {
  const setupForm = async (attributes: string) => {
    const { root: form, waitForChanges } = await render<HTMLFormElement>(
      `<form><mds-input-otp name="otp" length="4" ${attributes}></mds-input-otp></form>`,
    );
    return { form, otp: form.querySelector('mds-input-otp')!, waitForChanges };
  };

  it('puts the value of the markup in the cells and in the form', async () => {
    const { form, otp } = await setupForm('value="12"');

    expect(readCells(otp)).toEqual(['1', '2', '', '']);
    expect(new FormData(form).get('otp')).toBe('12');
  });

  it('puts a value set by code in the cells, as many digits as there are cells', async () => {
    const { form, otp, waitForChanges } = await setupForm('');

    otp.value = '345678';
    await waitForChanges();

    expect(readCells(otp)).toEqual(['3', '4', '5', '6']);
    expect(otp.value).toBe('3456');
    expect(new FormData(form).get('otp')).toBe('3456');
  });

  it('keeps a typed digit in its own cell', async () => {
    const { otp, waitForChanges } = await setupForm('');

    await userEvent.click(otp.shadowRoot!.querySelectorAll('mds-input')[2]);
    await userEvent.keyboard('7');
    await waitForChanges();

    expect(otp.value).toBe('7');
    expect(readCells(otp)).toEqual(['', '', '7', '']);
  });

  it.each([
    ['value="12"', ['1', '2', '', ''], '12'],
    ['', ['', '', '', ''], ''],
  ])('brings back the code of load on a form reset (%s)', async (attributes, cells, code) => {
    const { form, otp, waitForChanges } = await setupForm(attributes);
    await userEvent.click(otp.shadowRoot!.querySelectorAll('mds-input')[0]);
    await userEvent.keyboard('9876');
    await waitForChanges();
    expect(otp.value).toBe('9876');

    form.reset();
    await waitForChanges();

    expect(readCells(otp)).toEqual(cells);
    expect(otp.value).toBe(code);
    expect(new FormData(form).get('otp')).toBe(code);
  });
});

// Every key but Ctrl ones was cancelled: Tab could not leave the field, Backspace did not delete,
// Cmd+V did not paste and Space wrote a blank digit (#820)
describe('keyboard', () => {
  const setup = async (attributes = '') => {
    const { root, waitForChanges } = await render(
      `<div><button id="before">before</button><mds-input-otp length="3" ${attributes}></mds-input-otp><button id="after">after</button></div>`,
    );
    const otp = root.querySelector('mds-input-otp')!;
    const cells = Array.from(otp.shadowRoot!.querySelectorAll('mds-input'));
    return { root, otp, cells, waitForChanges };
  };

  // the cell that holds the focus, through the shadow roots of the otp and of the cell
  const focusedCell = (otp: HTMLElement) => otp.shadowRoot!.activeElement;

  it('leaves the field with Tab and Shift+Tab', async () => {
    const { root, otp, cells } = await setup();

    await userEvent.click(cells[2]);
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(root.querySelector('#after'));

    await userEvent.click(cells[0]);
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(document.activeElement).toBe(root.querySelector('#before'));
    expect(otp.value).toBe('');
  });

  it('empties a cell with Backspace, and the previous one from an empty cell', async () => {
    const { otp, cells, waitForChanges } = await setup('value="12"');

    await userEvent.click(cells[1]);
    await userEvent.keyboard('{Backspace}');
    await waitForChanges();
    expect(readCells(otp)).toEqual(['1', '', '']);
    expect(focusedCell(otp)).toBe(cells[1]);

    await userEvent.keyboard('{Backspace}');
    await waitForChanges();
    expect(readCells(otp)).toEqual(['', '', '']);
    expect(focusedCell(otp)).toBe(cells[0]);
    expect(otp.value).toBe('');
  });

  it('empties the cell with Delete', async () => {
    const { otp, cells, waitForChanges } = await setup('value="12"');

    await userEvent.click(cells[0]);
    await userEvent.keyboard('{Delete}');
    await waitForChanges();

    expect(readCells(otp)).toEqual(['', '2', '']);
  });

  it('writes nothing for Space or a letter', async () => {
    const { otp, cells, waitForChanges } = await setup();

    await userEvent.click(cells[0]);
    await userEvent.keyboard('{Space}a-');
    await waitForChanges();

    expect(readCells(otp)).toEqual(['', '', '']);
    expect(otp.value).toBe('');
    expect(focusedCell(otp)).toBe(cells[0]);
  });

  it('moves between the cells with the arrows', async () => {
    const { otp, cells } = await setup();

    await userEvent.click(cells[0]);
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(focusedCell(otp)).toBe(cells[2]);

    await userEvent.keyboard('{ArrowLeft}');
    expect(focusedCell(otp)).toBe(cells[1]);
  });

  it.each([
    ['Ctrl', { ctrlKey: true }],
    ['Cmd', { metaKey: true }],
  ])('leaves the paste shortcut with %s to the browser', async (_, modifier) => {
    const { cells } = await setup();
    const press = new KeyboardEvent('keydown', { key: 'v', cancelable: true, ...modifier });

    cells[0].dispatchEvent(press);

    expect(press.defaultPrevented).toBe(false);
  });
});

// A native input is disabled by its own disabled or by a disabled fieldset. The component had
// neither: in a disabled fieldset the cells stayed editable while the form left the code out (#852)
describe('disabled', () => {
  const readDisabled = (otp: HTMLElement): boolean[] =>
    Array.from(otp.shadowRoot!.querySelectorAll('mds-input')).map(
      (cell) => cell.shadowRoot!.querySelector('input')!.disabled,
    );

  it('disables every cell and leaves the code out of the form, until it is enabled', async () => {
    const { root: form, waitForChanges } = await render<HTMLFormElement>(
      '<form><mds-input-otp name="otp" length="2" value="12" disabled></mds-input-otp></form>',
    );
    const otp = form.querySelector('mds-input-otp')!;

    await vi.waitFor(() => expect(readDisabled(otp)).toEqual([true, true]));
    expect(new FormData(form).has('otp')).toBe(false);

    otp.disabled = false;
    await waitForChanges();

    expect(readDisabled(otp)).toEqual([false, false]);
    expect(new FormData(form).get('otp')).toBe('12');
  });

  it('is disabled by a disabled fieldset, until the fieldset is enabled', async () => {
    const { root: form, waitForChanges } = await render<HTMLFormElement>(
      '<form><fieldset disabled><mds-input-otp name="otp" length="2" value="12"></mds-input-otp></fieldset></form>',
    );
    const otp = form.querySelector('mds-input-otp')!;

    await vi.waitFor(() => expect(readDisabled(otp)).toEqual([true, true]));
    expect(new FormData(form).has('otp')).toBe(false);

    form.querySelector('fieldset')!.disabled = false;
    await waitForChanges();

    expect(readDisabled(otp)).toEqual([false, false]);
    expect(new FormData(form).get('otp')).toBe('12');
  });
});

// A paste that reached the last cell submitted from the cell after it, null, and threw (#825)
describe('paste', () => {
  const paste = (cell: Element, text: string): void => {
    const clipboardData = new DataTransfer();
    clipboardData.setData('text', text);
    cell.dispatchEvent(
      new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData }),
    );
  };

  const setup = async (attributes = '') => {
    const { root: form, waitForChanges } = await render<HTMLFormElement>(
      `<form><mds-input-otp name="otp" length="4" ${attributes}></mds-input-otp></form>`,
    );
    const otp = form.querySelector('mds-input-otp')!;
    const cells = Array.from(otp.shadowRoot!.querySelectorAll('mds-input'));
    return { form, otp, cells, waitForChanges };
  };

  it('fills the cells up to the last one and submits the complete code', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const { form, otp, cells, waitForChanges } = await setup('autosubmit');
    const submit = vi.fn((event: Event) => event.preventDefault());
    form.addEventListener('submit', submit);

    paste(cells[0], '123456');
    await waitForChanges();

    expect(consoleError).not.toHaveBeenCalled();
    expect(readCells(otp)).toEqual(['1', '2', '3', '4']);
    expect(submit).toHaveBeenCalledTimes(1);
    expect(new FormData(form).get('otp')).toBe('1234');
  });

  it('fills from the cell it lands on, without submitting a code still missing digits', async () => {
    const { form, otp, cells, waitForChanges } = await setup('autosubmit');
    const submit = vi.fn((event: Event) => event.preventDefault());
    form.addEventListener('submit', submit);

    paste(cells[2], '78');
    await waitForChanges();

    expect(readCells(otp)).toEqual(['', '', '7', '8']);
    expect(submit).not.toHaveBeenCalled();
  });

  it('takes a code with the spaces around it, and nothing that is not digits only', async () => {
    const { otp, cells, waitForChanges } = await setup();

    paste(cells[0], '1.5');
    await waitForChanges();
    expect(readCells(otp)).toEqual(['', '', '', '']);

    paste(cells[0], ' 42 ');
    await waitForChanges();
    expect(readCells(otp)).toEqual(['4', '2', '', '']);
  });
});

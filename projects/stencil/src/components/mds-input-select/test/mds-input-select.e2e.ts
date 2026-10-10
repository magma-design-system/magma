import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

/**
 * The arrow transitions its fill over --duration-200, and the transition does not exist yet
 * on the frame the component hydrates: a read taken right away catches the colour in flight,
 * a different blue every run. Sit out the transition, then poll until the painted value stops
 * moving - waiting on getAnimations() is not enough, the browser starts a second pass.
 */
const paintedFill = async (element: Element): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  let previous = '';
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const current = getComputedStyle(element).fill;
    if (current === previous) return current;
    previous = current;
  }

  return previous;
};

describe('mds-input-select', () => {
  it('renders', async () => {
    const { root } = await render('<mds-input-select></mds-input-select>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('the arrow', () => {
    it('is an mds-icon, like the rest of the input family', async () => {
      const { root } = await render('<mds-input-select></mds-input-select>');

      const arrow = root.shadowRoot!.querySelector('.icon')!;

      // it used to be an <i> with the svg inlined by hand, which sized and coloured
      // itself outside every convention the other inputs follow
      expect(arrow.tagName).toBe('MDS-ICON');
    });

    it('paints the same colour as the icon of mds-input-date, and nothing behind it', async () => {
      const { root } = await render(
        '<div><span id="park">.</span><mds-input-select id="select"></mds-input-select><mds-input-date id="date"></mds-input-date></div>',
      );

      const select = root.querySelector('#select') as HTMLElement;
      const date = root.querySelector('#date') as HTMLElement;
      const arrow = select.shadowRoot!.querySelector('.icon') as HTMLElement;
      const calendar = date.shadowRoot!.querySelector('.action-open-calendar') as HTMLElement;

      // the pointer stays where the last case left it, and :host(:hover) swaps the arrow to
      // its hover colour: park it on something inert before reading the resting state
      await userEvent.hover(root.querySelector('#park')!);

      const fill = await paintedFill(arrow);
      const arrowStyle = getComputedStyle(arrow);
      // one is a computed `fill` and the other the value of a custom property, so
      // the same colour arrives spelled `rgb(36, 103, 231)` on one side and
      // `rgb(36 103 231)` on the other
      const colore = (value: string) => value.replace(/[\s,]+/g, ' ').trim();

      // the date drives its own icon through --mds-button-color, so the comparison
      // is against the value that reaches the button, not against a literal
      expect(colore(fill)).toBe(
        colore(getComputedStyle(calendar).getPropertyValue('--mds-button-color')),
      );
      expect(arrowStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    });
  });

  // Angular and Vue bind null for a missing value, before the first render
  it('selects the first option, as without a placeholder, when the placeholder is null', async () => {
    const select = document.createElement('mds-input-select');
    (select as { placeholder?: string | null }).placeholder = null;
    select.innerHTML = '<option value="a">A</option><option value="b">B</option>';
    document.body.appendChild(select);
    await vi.waitFor(() => expect(select).toHaveAttribute('hydrated'));

    const native = select.shadowRoot!.querySelector('select')!;
    await vi.waitFor(() => expect(native.options).toHaveLength(2));
    expect(native.value).toBe('a');
    select.remove();
  });

  // the React wrapper clears the value when the placeholder arrives after load (#786)
  it('shows the required state, not the success one, when the value is null', async () => {
    const select = document.createElement('mds-input-select');
    select.required = true;
    select.placeholder = 'Choose';
    (select as { value?: string | null }).value = null;
    select.innerHTML = '<option value="a">A</option>';
    document.body.appendChild(select);
    await vi.waitFor(() => expect(select).toHaveAttribute('hydrated'));

    const tip = select.shadowRoot!.querySelector('mds-input-tip-item[variant^="required"]');
    expect(tip).toEqualAttribute('variant', 'required');
    select.remove();
  });

  describe('accessible name', () => {
    it('names the select after the aria-label of the host', async () => {
      const { root } = await render<HTMLMdsInputSelectElement>(
        '<mds-input-select aria-label="Film"><option value="1">First contact</option></mds-input-select>',
      );

      expect(root.shadowRoot!.querySelector('select')).toEqualAttribute('aria-label', 'Film');
    });
  });
});

// Like a native select, a required one left empty stops the submit of its form (#786)
describe('form validity', () => {
  it('stops the submit while a required select is empty', async () => {
    const { root: form, waitForChanges } = await render<HTMLFormElement>(`
      <form>
        <mds-input-select name="s" placeholder="Choose" required>
          <option value="a">A</option>
        </mds-input-select>
      </form>
    `);
    const select = form.querySelector('mds-input-select')!;

    expect(form.checkValidity()).toBe(false);
    expect(select.matches(':invalid')).toBe(true);

    await select.setValue('a');
    await waitForChanges();

    expect(form.checkValidity()).toBe(true);
  });

  it('does not stop the submit when the select is optional', async () => {
    const { root: form } = await render<HTMLFormElement>(`
      <form>
        <mds-input-select name="s" placeholder="Choose">
          <option value="a">A</option>
        </mds-input-select>
      </form>
    `);

    expect(form.checkValidity()).toBe(true);
  });
});

const setupSelectForm = async (attributes: string, options: string) => {
  const { root: form, waitForChanges } = await render<HTMLFormElement>(
    `<form><mds-input-select ${attributes}>${options}</mds-input-select></form>`,
  );
  const select = form.querySelector('mds-input-select')!;
  // the options reach the native select on slotchange, after the first render
  await vi.waitFor(() =>
    expect(select.shadowRoot!.querySelectorAll('option:not(.placeholder-option)').length).toBe(
      (options.match(/<option/g) ?? []).length,
    ),
  );
  return { form, select, native: select.shadowRoot!.querySelector('select')!, waitForChanges };
};

const abc = '<option value="a">A</option><option value="b">B</option><option value="c">C</option>';

// Like a native multiple select, every selected option is submitted (#822)
describe('multiple', () => {
  it('keeps every option the user selects and submits them all', async () => {
    const { form, select, native, waitForChanges } = await setupSelectForm(
      'name="s" multiple',
      abc,
    );
    const details: { value?: unknown; values: string[] }[] = [];
    select.addEventListener('mdsInputSelectChange', (event) => details.push(event.detail));

    await userEvent.selectOptions(native, ['a', 'c']);
    await waitForChanges();

    expect(Array.from(native.selectedOptions).map((option) => option.value)).toEqual(['a', 'c']);
    expect(new FormData(form).getAll('s')).toEqual(['a', 'c']);
    expect(select.value).toBe('a');
    expect(details.at(-1)).toEqual({ value: 'a', values: ['a', 'c'] });
  });

  it('keeps the options the markup selects', async () => {
    const { form } = await setupSelectForm(
      'name="s" multiple',
      '<option value="a">A</option><option value="b" selected>B</option><option value="c" selected>C</option>',
    );

    expect(new FormData(form).getAll('s')).toEqual(['b', 'c']);
  });

  it('selects one option alone for a value set by code, as select.value', async () => {
    const { form, select, native, waitForChanges } = await setupSelectForm(
      'name="s" multiple',
      abc,
    );
    await userEvent.selectOptions(native, ['a', 'c']);

    select.value = 'b';
    await waitForChanges();

    expect(new FormData(form).getAll('s')).toEqual(['b']);
  });
});

// Like a native select, a form reset brings back the selection of load (#822)
describe('form reset', () => {
  it('brings back the value of load', async () => {
    const { form, select, native, waitForChanges } = await setupSelectForm(
      'name="s" value="b"',
      abc,
    );
    await userEvent.selectOptions(native, 'c');
    expect(select.value).toBe('c');

    form.reset();
    await waitForChanges();

    expect(select.value).toBe('b');
    expect(native.value).toBe('b');
    expect(new FormData(form).get('s')).toBe('b');
  });

  it.each(['', 'required'])('brings back the placeholder (%s)', async (required) => {
    const { form, select, native, waitForChanges } = await setupSelectForm(
      `name="s" placeholder="Choose" ${required}`,
      abc,
    );
    await userEvent.selectOptions(native, 'a');

    form.reset();
    await waitForChanges();

    expect(select.value).toBe('');
    expect(native.selectedOptions[0]).toHaveClass('placeholder-option');
  });

  it('brings back the options the markup selects', async () => {
    const { form, native, waitForChanges } = await setupSelectForm(
      'name="s" multiple',
      '<option value="a">A</option><option value="b" selected>B</option><option value="c" selected>C</option>',
    );
    await userEvent.selectOptions(native, ['a']);

    form.reset();
    await waitForChanges();

    expect(new FormData(form).getAll('s')).toEqual(['b', 'c']);
  });
});

describe('placeholder set after load', () => {
  it('adds one placeholder option, at the top', async () => {
    const select = document.createElement('mds-input-select');
    document.body.appendChild(select);
    await vi.waitFor(() => expect(select).toHaveAttribute('hydrated'));

    select.placeholder = 'Choose';
    await vi.waitFor(() =>
      expect(select.shadowRoot!.querySelector('option')!.textContent).toBe('Choose'),
    );

    const native = select.shadowRoot!.querySelector('select')!;
    expect(Array.from(native.options).filter((option) => option.value === '')).toHaveLength(1);
    select.remove();
  });

  it('leaves alone an element of the page with the same class', async () => {
    const { root } = await render(
      '<div><span class="placeholder-option">page</span><mds-input-select></mds-input-select></div>',
    );
    const select = root.querySelector('mds-input-select')!;

    select.placeholder = 'Choose';
    await vi.waitFor(() =>
      expect(select.shadowRoot!.querySelector('option')!.textContent).toBe('Choose'),
    );

    expect(root.querySelector('span.placeholder-option')).not.toBeNull();
  });
});

// A disabled fieldset disables the form controls in it. It disabled the host, so the value was
// left out of the form, but not the select in its shadow root, which stayed editable (#822)
describe('in a disabled fieldset', () => {
  it('is disabled like a native select, until the fieldset is enabled', async () => {
    const { root, waitForChanges } = await render<HTMLFormElement>(
      '<form><fieldset disabled><mds-input-select name="s"><option value="a">A</option><option value="b" selected>B</option></mds-input-select></fieldset></form>',
    );
    const field = root.querySelector('mds-input-select')!;
    const native = () => field.shadowRoot!.querySelector('select')!;

    await vi.waitFor(() => expect(native().disabled).toBe(true));
    expect(new FormData(root).has('s')).toBe(false);

    root.querySelector('fieldset')!.disabled = false;
    await waitForChanges();

    expect(native().disabled).toBe(false);
    expect(new FormData(root).get('s')).toBe('b');
  });
});

import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

type Field = { host: HTMLMdsInputDateElement; waitForChanges: () => Promise<void> };

type DropdownMetrics = {
  calendarWidth: number;
  dropdownLeft: number;
  dropdownRight: number;
  hostLeft: number;
  hostRight: number;
  tracks: number[];
  transform: string;
};

const getDropdown = (host: HTMLElement): HTMLMdsDropdownElement =>
  host.shadowRoot!.querySelector<HTMLMdsDropdownElement>('mds-dropdown')!;

const readDropdownMetrics = (host: HTMLElement): DropdownMetrics => {
  const dropdown = getDropdown(host);
  const calendar = dropdown.querySelector<HTMLElement>('mds-calendar')!;
  const cells = calendar.shadowRoot!.querySelector<HTMLElement>('.month-view__cells')!;
  return {
    calendarWidth: calendar.offsetWidth,
    dropdownLeft: dropdown.getBoundingClientRect().left,
    dropdownRight: dropdown.getBoundingClientRect().right,
    hostLeft: host.getBoundingClientRect().left,
    hostRight: host.getBoundingClientRect().right,
    tracks: getComputedStyle(cells).gridTemplateColumns.split(' ').map(parseFloat),
    transform: getComputedStyle(dropdown).transform,
  };
};

// The dropdown animates in (scale transform) and floating-ui positions it asynchronously:
// wait until the opening transition has settled before measuring the geometry.
const waitForDropdownSettled = (host: HTMLElement): Promise<void> =>
  vi.waitFor(
    () => {
      const dropdown = getDropdown(host);
      const { transform } = getComputedStyle(dropdown);
      const settled =
        dropdown.hasAttribute('visible') &&
        (transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)');
      if (!settled) throw new Error('the dropdown is still opening');
    },
    { timeout: 5000 },
  );

const openCalendarDropdown = async ({ host, waitForChanges }: Field): Promise<void> => {
  await userEvent.click(host.shadowRoot!.querySelector('#calendar-dropdown')!);
  await waitForChanges();
  await waitForDropdownSettled(host);
};

const setupFieldInNarrowColumn = async (state = ''): Promise<Field> => {
  const { root, waitForChanges } = await render(`
    <div style="width: 420px; margin: 40px auto;">
      <mds-input-date name="d" ${state}></mds-input-date>
    </div>
  `);
  return { host: root.querySelector<HTMLMdsInputDateElement>('mds-input-date')!, waitForChanges };
};

describe('mds-input-date', () => {
  it('highlights today in its calendar', async () => {
    const { root } = await render<HTMLMdsInputDateElement>(
      '<mds-input-date name="d"></mds-input-date>',
    );
    const calendar = getDropdown(root).querySelector<HTMLMdsCalendarElement>('mds-calendar')!;

    expect(calendar.shadowRoot!.querySelector('mds-calendar-cell[today]')).not.toBeNull();
  });

  it('hides today in its calendar with hide-today', async () => {
    const { root } = await render<HTMLMdsInputDateElement>(
      '<mds-input-date name="d" hide-today></mds-input-date>',
    );
    const calendar = getDropdown(root).querySelector<HTMLMdsCalendarElement>('mds-calendar')!;

    expect(calendar.shadowRoot!.querySelector('mds-calendar-cell[today]')).toBeNull();
  });

  it('renders', async () => {
    const { root } = await render('<mds-input-date></mds-input-date>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('open-calendar button placement', () => {
    it.each(['', 'disabled'])(
      'centers the button on the field vertical axis and keeps it inside the field (%s)',
      async (state) => {
        const { host } = await setupFieldInNarrowColumn(state);
        const inputRect = host.shadowRoot!.querySelector('.input')!.getBoundingClientRect();
        const buttonRect = host
          .shadowRoot!.querySelector('.action-open-calendar')!
          .getBoundingClientRect();

        // mds-button aligns itself flex-start on its :host: without the align-self
        // re-centering the icon floats 6px above the field axis, and the old disabled
        // translate hack pushed it past the field right edge.
        expect(
          Math.abs(buttonRect.y + buttonRect.height / 2 - (inputRect.y + inputRect.height / 2)),
        ).toBeLessThanOrEqual(1);
        expect(buttonRect.right).toBeLessThanOrEqual(inputRect.right);
      },
    );
  });

  describe('calendar dropdown sizing', () => {
    it('sizes the calendar to the field width with evenly sized day cells', async () => {
      const field = await setupFieldInNarrowColumn();
      await openCalendarDropdown(field);

      const { calendarWidth, tracks } = readDropdownMetrics(field.host);

      // The calendar takes the field width (100cqw = 420px, below --mds-calendar-max-width 480px):
      // 420 - 2 * 16px padding - 6 * 2px gaps = 7 tracks of ~53.7px
      expect(calendarWidth).toBeLessThanOrEqual(420);
      expect(calendarWidth).toBeGreaterThanOrEqual(419);
      expect(tracks).toHaveLength(7);
      tracks.forEach((track) => {
        expect(track).toBeGreaterThanOrEqual(50);
        expect(track).toBeLessThanOrEqual(56);
      });
    });

    it('anchors the dropdown to the end of the field (placement bottom-end)', async () => {
      const field = await setupFieldInNarrowColumn();
      await openCalendarDropdown(field);

      // floating-ui repositions on its own autoUpdate ticks: give it a moment to converge.
      await vi
        .waitFor(
          () => {
            const { host } = field;
            const dropdownLeft = getDropdown(host).getBoundingClientRect().left;
            if (dropdownLeft < host.getBoundingClientRect().left) {
              throw new Error('the dropdown has not converged yet');
            }
          },
          { timeout: 3000 },
        )
        .catch(() => undefined);

      const { dropdownLeft, dropdownRight, hostLeft, hostRight } = readDropdownMetrics(field.host);

      // The dropdown must stay within the field on the left, and end at the field's right edge.
      // The `arrow` middleware may push it past the field by at most `arrow-padding` (24px) so that
      // the arrow tip keeps pointing at the center of the 48px calendar button.
      expect(dropdownLeft).toBeGreaterThanOrEqual(hostLeft);
      expect(dropdownRight).toBeGreaterThanOrEqual(hostRight - 1);
      expect(dropdownRight).toBeLessThanOrEqual(hostRight + 24);
    });

    it('keeps the same calendar width after closing and reopening the dropdown', async () => {
      const field = await setupFieldInNarrowColumn();
      await openCalendarDropdown(field);
      const first = readDropdownMetrics(field.host);

      getDropdown(field.host).visible = false;
      await field.waitForChanges();
      await openCalendarDropdown(field);
      const second = readDropdownMetrics(field.host);

      expect(second.calendarWidth).toBe(first.calendarWidth);
      expect(second.calendarWidth).toBeLessThanOrEqual(420);
    });
  });
});

// The React wrappers under SSR set the props on an element that has already loaded (#786)
describe('rules set after load', () => {
  it('applies required: red tip and errors, the variant waits for the field to be touched', async () => {
    const { root, waitForChanges } = await render<HTMLMdsInputDateElement>(
      '<mds-input-date></mds-input-date>',
    );

    root.required = true;
    await waitForChanges();

    const tip = root.shadowRoot!.querySelector('mds-input-tip-item[variant^="required"]');
    expect(tip).toEqualAttribute('variant', 'required');
    expect(root).toEqualAttribute('variant', 'primary');
    expect(await root.getErrors()).not.toBeNull();
  });

  it('checks the value against a min set after load', async () => {
    const { root, waitForChanges } = await render<HTMLMdsInputDateElement>(
      '<mds-input-date value="2026-01-10"></mds-input-date>',
    );
    expect(await root.getErrors()).toBeNull();

    root.min = '2026-02-01';
    await waitForChanges();

    expect(await root.getErrors()).not.toBeNull();
  });

  it('shows a min set after load on a touched field', async () => {
    const { root, waitForChanges } = await render<HTMLMdsInputDateElement>(
      '<mds-input-date value="2026-01-10"></mds-input-date>',
    );
    root.shadowRoot!.querySelector('input')!.dispatchEvent(new Event('blur'));
    await waitForChanges();

    root.min = '2026-02-01';
    await waitForChanges();

    expect(root).toEqualAttribute('variant', 'error');
  });

  it('snaps a reversed range set after load', async () => {
    const { root, waitForChanges } = await render<HTMLMdsInputDateElement>(
      '<mds-input-date min="2026-02-01"></mds-input-date>',
    );

    root.max = '2026-01-01';
    await waitForChanges();

    expect(root.max).toBe('2026-02-01');
  });
});

// Like a native control, an invalid date stops the submit of its form (#786)
describe('form validity', () => {
  const setupForm = async (attributes: string) => {
    const { root: form, waitForChanges } = await render<HTMLFormElement>(
      `<form><mds-input-date name="d" ${attributes}></mds-input-date></form>`,
    );
    return { form, date: form.querySelector('mds-input-date')!, waitForChanges };
  };

  it('stops the submit while a required date is empty', async () => {
    const { form, date } = await setupForm('required');

    expect(form.checkValidity()).toBe(false);
    expect(date.matches(':invalid')).toBe(true);

    await date.setValue('2026-01-10');

    expect(form.checkValidity()).toBe(true);
  });

  it('stops the submit for a date out of the range', async () => {
    const { form, date } = await setupForm('min="2026-02-01" max="2026-02-28"');

    await date.setValue('2026-03-10');
    expect(form.checkValidity()).toBe(false);

    await date.setValue('2026-02-10');
    expect(form.checkValidity()).toBe(true);
  });

  it('follows a required set after load', async () => {
    const { form, date, waitForChanges } = await setupForm('');
    expect(form.checkValidity()).toBe(true);

    date.required = true;
    await waitForChanges();

    expect(form.checkValidity()).toBe(false);
  });

  it('does not stop the submit when disabled', async () => {
    const { form } = await setupForm('required disabled');

    expect(form.checkValidity()).toBe(true);
  });
});

// Like :user-invalid, the error look waits for the user or a stopped submit (#822)
describe('validation look', () => {
  const setupForm = async (attributes: string) => {
    const { root: form, waitForChanges } = await render<HTMLFormElement>(
      `<form><mds-input-date name="d" ${attributes}></mds-input-date><button type="button">Blur</button></form>`,
    );
    return { form, date: form.querySelector('mds-input-date')!, waitForChanges };
  };

  it('does not start in error when required and empty', async () => {
    const { date } = await setupForm('required');

    expect(date).toEqualAttribute('variant', 'primary');
    expect(date.matches(':invalid')).toBe(true);
  });

  it('keeps the variant written in the markup until the field is touched', async () => {
    const { date } = await setupForm('variant="info" value="2026-01-10" min="2026-02-01"');

    expect(date).toEqualAttribute('variant', 'info');
    expect(date.matches(':invalid')).toBe(true);
  });

  it('shows the error once the user leaves the field', async () => {
    const { form, date, waitForChanges } = await setupForm('required');

    await userEvent.click(date.shadowRoot!.querySelector('input')!);
    await userEvent.click(form.querySelector('button')!);
    await waitForChanges();

    expect(date).toEqualAttribute('variant', 'error');
  });

  it('shows the error on the field a stopped submit points at', async () => {
    const { form, date, waitForChanges } = await setupForm('required');

    form.requestSubmit();
    await waitForChanges();

    expect(date).toEqualAttribute('variant', 'error');
  });
});

// Like a native input, a form reset brings back the value of load (#822)
describe('form reset', () => {
  it('brings back the value of load and the pristine look', async () => {
    const { root: form, waitForChanges } = await render<HTMLFormElement>(
      '<form><mds-input-date name="d" value="2026-01-10" min="2026-01-01"></mds-input-date></form>',
    );
    const date = form.querySelector('mds-input-date')!;
    const input = date.shadowRoot!.querySelector('input')!;
    input.value = '2025-12-01';
    input.dispatchEvent(new Event('input'));
    await waitForChanges();
    expect(date).toEqualAttribute('variant', 'error');

    form.reset();
    await waitForChanges();

    expect(date.value).toBe('2026-01-10');
    expect(input.value).toBe('2026-01-10');
    expect(new FormData(form).get('d')).toBe('2026-01-10');
    expect(date).toEqualAttribute('variant', 'primary');
  });

  it('clears a date typed in part', async () => {
    const { root: form, waitForChanges } = await render<HTMLFormElement>(
      '<form><mds-input-date name="d"></mds-input-date></form>',
    );
    const date = form.querySelector('mds-input-date')!;
    const input = date.shadowRoot!.querySelector('input')!;
    await userEvent.click(input);
    await userEvent.keyboard('1');
    expect(input.validity.badInput).toBe(true);

    form.reset();
    await waitForChanges();

    expect(input.validity.badInput).toBe(false);
    expect(date.matches(':invalid')).toBe(false);
  });
});

// Like a native input, a read-only date cannot be changed (#822)
describe('readonly', () => {
  it('reaches the native input and the calendar button', async () => {
    const { root } = await render<HTMLMdsInputDateElement>(
      '<mds-input-date readonly value="2026-01-10"></mds-input-date>',
    );

    expect(root.shadowRoot!.querySelector('input')!.readOnly).toBe(true);
    expect(root.shadowRoot!.querySelector('.action-open-calendar')).toHaveAttribute('disabled');
  });

  it('keeps the value when the user types', async () => {
    const { root, waitForChanges } = await render<HTMLMdsInputDateElement>(
      '<mds-input-date readonly value="2026-01-10"></mds-input-date>',
    );

    await userEvent.click(root.shadowRoot!.querySelector('input')!);
    await userEvent.keyboard('{ArrowUp}2');
    await waitForChanges();

    expect(root.value).toBe('2026-01-10');
  });
});

// A disabled fieldset disables the form controls in it. It disabled the host, so the value was
// left out of the form, but not the input in its shadow root, which stayed editable (#822)
describe('in a disabled fieldset', () => {
  it('is disabled like a native date input, until the fieldset is enabled', async () => {
    const { root, waitForChanges } = await render<HTMLFormElement>(
      '<form><fieldset disabled><mds-input-date name="d" value="2026-01-10"></mds-input-date></fieldset></form>',
    );
    const field = root.querySelector('mds-input-date')!;
    const native = () => field.shadowRoot!.querySelector('input')!;

    await vi.waitFor(() => expect(native().disabled).toBe(true));
    // the calendar would set a date the form leaves out
    expect(field.shadowRoot!.querySelector('.action-open-calendar')).toHaveAttribute('disabled');
    expect(new FormData(root).has('d')).toBe(false);

    root.querySelector('fieldset')!.disabled = false;
    await waitForChanges();

    expect(native().disabled).toBe(false);
    expect(new FormData(root).get('d')).toBe('2026-01-10');
  });
});

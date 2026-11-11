import { render, vi } from '@stencil/vitest';
import { useLanguage } from '@test/language';
import { userEvent } from 'vitest/browser';

type DateRangeDetail = {
  startDate: string;
  endDate: string;
};

type Range = { host: HTMLMdsInputDateRangeElement; waitForChanges: () => Promise<void> };

const SLOTTED_INPUTS = `
  <mds-input-date slot="start"></mds-input-date>
  <mds-input-date slot="end"></mds-input-date>
`;

const PRESELECTION = `
  <mds-input-date-range-preselection start="2026-06-02" end="2026-06-08">
    Questa settimana
  </mds-input-date-range-preselection>
`;

const setupRange = async (attributes = '', children = SLOTTED_INPUTS): Promise<Range> => {
  const { root, waitForChanges } = await render<HTMLMdsInputDateRangeElement>(
    `<mds-input-date-range ${attributes}>${children}</mds-input-date-range>`,
  );
  return { host: root, waitForChanges };
};

const getCalendars = (host: HTMLElement): HTMLMdsCalendarElement[] =>
  Array.from(host.shadowRoot!.querySelectorAll<HTMLMdsCalendarElement>('mds-calendar'));

// The dropdown animates in (scale transform): wait until the opening transition has settled
// before measuring the geometry.
const waitForDropdownSettled = (host: HTMLElement): Promise<void> =>
  vi.waitFor(
    () => {
      const dropdown = host.shadowRoot!.querySelector('mds-dropdown')!;
      const { transform } = getComputedStyle(dropdown);
      const settled =
        dropdown.hasAttribute('visible') &&
        (transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)');
      if (!settled) throw new Error('the dropdown is still opening');
    },
    { timeout: 5000 },
  );

const openCalendar = async ({ host, waitForChanges }: Range): Promise<void> => {
  await userEvent.click(host.shadowRoot!.querySelector('.action-open-calendar')!);
  await waitForChanges();
  await waitForDropdownSettled(host);
};

const clickPreselection = async ({ host, waitForChanges }: Range): Promise<void> => {
  host
    .querySelector('mds-input-date-range-preselection')!
    .shadowRoot!.querySelector<HTMLElement>('.action')!
    .click();
  await waitForChanges();
};

const dispatch = (target: EventTarget, name: string, detail: unknown): void => {
  target.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail }));
};

const focusOut = (host: HTMLElement): void => {
  host.dispatchEvent(
    new FocusEvent('focusout', { bubbles: true, composed: true, relatedTarget: document.body }),
  );
};

const valueChanges = (spy: { events: CustomEvent[] }): DateRangeDetail[] =>
  spy.events.map((event) => event.detail as DateRangeDetail);

describe('mds-input-date-range', () => {
  it('renders', async () => {
    const { root } = await render('<mds-input-date-range></mds-input-date-range>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('is form-associated and sets form value', async () => {
    const { root: form } = await render<HTMLFormElement>(`
      <form>
        <mds-input-date-range name="period" start-date="2026-01-01" end-date="2026-01-10">
          ${SLOTTED_INPUTS}
        </mds-input-date-range>
      </form>
    `);
    const element = form.querySelector('mds-input-date-range')!;

    const isFormAssociated =
      (element.constructor as typeof HTMLElement & { formAssociated?: boolean }).formAssociated ===
      true;
    expect(isFormAssociated).toBe(true);

    const formValue = new FormData(form).get('period');
    expect(formValue).toBe(JSON.stringify({ startDate: '2026-01-01', endDate: '2026-01-10' }));
  });

  it('centers the open-calendar button on the field vertical axis, inside the field', async () => {
    const { root } = await render(`
      <div style="width: 560px; margin: 40px auto;">
        <mds-input-date-range name="period">${SLOTTED_INPUTS}</mds-input-date-range>
      </div>
    `);
    const element = root.querySelector('mds-input-date-range')!;
    const hostRect = element.getBoundingClientRect();
    const buttonRect = element
      .shadowRoot!.querySelector('.action-open-calendar')!
      .getBoundingClientRect();

    // mds-button aligns itself flex-start on its :host: without the align-self
    // re-centering the icon floats above the field axis.
    expect(
      Math.abs(buttonRect.y + buttonRect.height / 2 - (hostRect.y + hostRect.height / 2)),
    ).toBeLessThanOrEqual(1);
    expect(buttonRect.right).toBeLessThanOrEqual(hostRect.right);
  });

  it('renders a single calendar by default', async () => {
    const { host } = await setupRange();

    expect(getCalendars(host)).toHaveLength(1);
  });

  it('highlights today in its calendar', async () => {
    const { host } = await setupRange();
    const [calendar] = getCalendars(host);

    expect(calendar.shadowRoot!.querySelector('mds-calendar-cell[today]')).not.toBeNull();
  });

  it('hides today in its calendar with hide-today', async () => {
    const { host } = await setupRange('hide-today');
    const [calendar] = getCalendars(host);

    expect(calendar.shadowRoot!.querySelector('mds-calendar-cell[today]')).toBeNull();
  });

  it('keeps a usable width for the single calendar when opened', async () => {
    const range = await setupRange();
    await openCalendar(range);

    const calendarWidth = getCalendars(range.host)[0]?.getBoundingClientRect().width ?? 0;
    expect(calendarWidth).toBeGreaterThan(250);
  });

  it('shows and applies preselection values when a preselection is clicked', async () => {
    const range = await setupRange('', SLOTTED_INPUTS + PRESELECTION);
    const { host } = range;
    await openCalendar(range);

    const calendar = getCalendars(host)[0];
    const panel = host.shadowRoot!.querySelector('.calendar-preselection-panel');
    const preselection = calendar.shadowRoot!.querySelector('.calendar-preselection');
    const panelRect = panel?.getBoundingClientRect();
    const calendarRect = calendar.getBoundingClientRect();

    expect(panel).not.toBeNull();
    expect(
      preselection?.classList.contains('calendar-preselection--has-preselection') ?? false,
    ).toBe(false);
    expect(calendarRect.width).toBeGreaterThan(250);
    expect(calendarRect.width).toBeLessThan(400);
    expect(panelRect !== undefined && panelRect.right <= calendarRect.left).toBe(true);

    await clickPreselection(range);

    expect({
      startDate: host.querySelector('mds-input-date[slot="start"]')?.getAttribute('value') ?? '',
      endDate: host.querySelector('mds-input-date[slot="end"]')?.getAttribute('value') ?? '',
    }).toEqual({
      startDate: '2026-06-02',
      endDate: '2026-06-08',
    });
  });

  it('renders dual calendar preselection outside the first calendar without shrinking the calendars', async () => {
    const range = await setupRange('dual-calendar="true"', SLOTTED_INPUTS + PRESELECTION);
    const { host } = range;
    await openCalendar(range);

    const calendars = getCalendars(host);
    const calendarWidths = calendars.map((calendar) => calendar.getBoundingClientRect().width);
    const firstCalendarPreselection =
      calendars[0]?.shadowRoot?.querySelector('.calendar-preselection');

    expect(host.shadowRoot!.querySelector('.calendar-preselection-panel')).not.toBeNull();
    expect(calendarWidths).toHaveLength(2);
    expect(calendarWidths[0]).toBeGreaterThan(250);
    expect(calendarWidths[1]).toBeGreaterThan(250);
    expect(
      firstCalendarPreselection?.classList.contains('calendar-preselection--has-preselection') ??
        false,
    ).toBe(false);
  });

  it('keeps the visible months anchored when the first selection starts in the last visible calendar', async () => {
    const { host, waitForChanges } = await setupRange('dual-calendar="true"');
    const viewDates = (): (string | null)[] =>
      getCalendars(host).map((calendar) => calendar.getAttribute('view-date'));

    dispatch(getCalendars(host)[0], 'mdsCalendarNavigate', { currentDate: '2026-06-01' });
    await waitForChanges();

    expect(viewDates()).toEqual(['2026-06-01', '2026-07-01']);

    dispatch(getCalendars(host)[1], 'mdsCalendarChange', { startDate: '2026-07-24' });
    await waitForChanges();

    expect(viewDates()).toEqual(['2026-06-01', '2026-07-01']);
  });

  // Angular and Vue bind null for a missing value, before the first render
  it('previews the range on hover when the end date is null', async () => {
    const host = document.createElement('mds-input-date-range');
    host.startDate = '2026-06-10';
    (host as { endDate: string | null }).endDate = null;
    host.innerHTML = SLOTTED_INPUTS;
    document.body.appendChild(host);
    await vi.waitFor(() => expect(host).toHaveAttribute('hydrated'));

    dispatch(getCalendars(host)[0], 'mdsCalendarHover', { hoverDate: '2026-06-15' });

    await vi.waitFor(() =>
      expect(getCalendars(host)[0]).toEqualAttribute('hover-date', '2026-06-15'),
    );
    host.remove();
  });

  // a day before the start, while the end is picked, would become the new start: it is previewed
  // alone, not as the start of a range drawn backwards to the old start (#341)
  it('previews a day before the start, in the first visible calendar, as a new start', async () => {
    const { host, waitForChanges } = await setupRange('dual-calendar="true"');

    dispatch(getCalendars(host)[0], 'mdsCalendarNavigate', { currentDate: '2026-06-01' });
    dispatch(getCalendars(host)[1], 'mdsCalendarChange', { startDate: '2026-07-24' });
    await waitForChanges();

    dispatch(getCalendars(host)[0], 'mdsCalendarHover', { hoverDate: '2026-06-02' });
    await waitForChanges();

    const [firstCalendar, secondCalendar] = getCalendars(host);
    const hovered = firstCalendar.shadowRoot!.querySelector(
      'mds-calendar-cell[date="2026-06-02"]',
    )!;
    const start = secondCalendar.shadowRoot!.querySelector('mds-calendar-cell[date="2026-07-24"]')!;

    await vi.waitFor(() => {
      expect(hovered).toHaveAttribute('selection', 'single');
      expect(hovered).toHaveAttribute('preview');
    });
    expect(start).toHaveAttribute('selection', 'single');
    expect(start).not.toHaveAttribute('preview');
    expect(
      firstCalendar.shadowRoot!.querySelector('mds-calendar-cell[date="2026-06-10"]'),
    ).not.toHaveAttribute('selection');
  });

  it('does not emit selected range when a preselection contains invalid dates', async () => {
    const { root, spyOnEvent, waitForChanges } = await render<HTMLMdsInputDateRangeElement>(`
      <mds-input-date-range>
        ${SLOTTED_INPUTS}
        <mds-input-date-range-preselection start="invalid-date" end="2026-06-08">
          Intervallo non valido
        </mds-input-date-range-preselection>
      </mds-input-date-range>
    `);
    const range = { host: root, waitForChanges };
    const valueChange = spyOnEvent('mdsInputDateRangeValueChange');

    await openCalendar(range);
    await clickPreselection(range);

    expect(valueChanges(valueChange)).toEqual([]);
  });

  it('does not emit value change when the calendar change contains invalid dates', async () => {
    const { root, spyOnEvent, waitForChanges } = await render<HTMLMdsInputDateRangeElement>(
      `<mds-input-date-range>${SLOTTED_INPUTS}</mds-input-date-range>`,
    );
    const range = { host: root, waitForChanges };
    const valueChange = spyOnEvent('mdsInputDateRangeValueChange');

    await openCalendar(range);

    dispatch(getCalendars(root)[0], 'mdsCalendarChange', {
      startDate: 'invalid-date',
      endDate: '2026-06-08',
    });
    await waitForChanges();

    expect(valueChanges(valueChange)).toEqual([]);
  });

  it('renders its calendar when the start date is invalid', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { root } = await render<HTMLMdsInputDateRangeElement>(
      `<mds-input-date-range start-date="invalid-date" end-date="2026-06-08">${SLOTTED_INPUTS}</mds-input-date-range>`,
    );
    const calendars = getCalendars(root);

    expect(calendars).toHaveLength(1);
    expect(calendars[0]).toHaveAttribute('hydrated');
  });

  it('does not emit value change on focusout when the range is invalid', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { root, spyOnEvent, waitForChanges } = await render<HTMLMdsInputDateRangeElement>(
      `<mds-input-date-range start-date="invalid-date" end-date="2026-06-08">${SLOTTED_INPUTS}</mds-input-date-range>`,
    );
    const valueChange = spyOnEvent('mdsInputDateRangeValueChange');

    focusOut(root);
    await waitForChanges();

    expect(valueChanges(valueChange)).toEqual([]);
  });

  it('emits mdsInputDateRangeValueChange only once for the same range after selection and focusout', async () => {
    const { root, spyOnEvent, waitForChanges } = await render<HTMLMdsInputDateRangeElement>(
      `<mds-input-date-range>${SLOTTED_INPUTS}${PRESELECTION}</mds-input-date-range>`,
    );
    const range = { host: root, waitForChanges };
    const valueChange = spyOnEvent('mdsInputDateRangeValueChange');

    await openCalendar(range);
    await clickPreselection(range);

    focusOut(root);
    await waitForChanges();

    expect(valueChanges(valueChange)).toEqual([
      {
        startDate: '2026-06-02',
        endDate: '2026-06-08',
      },
    ]);
  });

  describe('accessible name', () => {
    it('names each slotted field after the end of the range it covers', async () => {
      const { host } = await setupRange();

      expect(host.querySelector('[slot="start"]')).toEqualAttribute('aria-label', 'Start date');
      expect(host.querySelector('[slot="end"]')).toEqualAttribute('aria-label', 'End date');
    });

    it('puts the name of the range in front of both', async () => {
      const { host } = await setupRange('aria-label="Periodo"');

      expect(host.querySelector('[slot="start"]')).toEqualAttribute(
        'aria-label',
        'Periodo, Start date',
      );
    });

    it('leaves a name written on the field alone', async () => {
      const { host } = await setupRange(
        '',
        '<mds-input-date slot="start" aria-label="Arrivo"></mds-input-date><mds-input-date slot="end"></mds-input-date>',
      );

      expect(host.querySelector('[slot="start"]')).toEqualAttribute('aria-label', 'Arrivo');
    });
  });
});

const typeDate = async (field: HTMLMdsInputDateElement, date: string): Promise<void> => {
  const input = field.shadowRoot!.querySelector('input')!;
  input.value = date;
  input.dispatchEvent(new Event('input'));
  input.dispatchEvent(new Event('blur'));
};

// The range bounds both fields, as its JSDoc promises (#822)
describe('min and max', () => {
  const fields = (host: HTMLElement) => ({
    start: host.querySelector<HTMLMdsInputDateElement>('mds-input-date[slot="start"]')!,
    end: host.querySelector<HTMLMdsInputDateElement>('mds-input-date[slot="end"]')!,
  });

  it('reach the slotted fields, also when they change after load', async () => {
    const { host, waitForChanges } = await setupRange('min="2026-01-01" max="2026-01-31"');
    const { start, end } = fields(host);

    expect([start.min, start.max, end.min, end.max]).toEqual([
      '2026-01-01',
      '2026-01-31',
      '2026-01-01',
      '2026-01-31',
    ]);

    host.max = '2026-02-28';
    await waitForChanges();

    expect([start.max, end.max]).toEqual(['2026-02-28', '2026-02-28']);
  });

  it('leave alone a bound written on a field when the range sets none', async () => {
    const { host } = await setupRange(
      '',
      '<mds-input-date slot="start" min="2026-03-01"></mds-input-date><mds-input-date slot="end"></mds-input-date>',
    );

    expect(fields(host).start.min).toBe('2026-03-01');
  });

  it('stop the submit and the event for a date typed outside them', async () => {
    const {
      root: form,
      waitForChanges,
      spyOnEvent,
    } = await render<HTMLFormElement>(
      `<form><mds-input-date-range name="period" min="2026-01-01" max="2026-01-31">${SLOTTED_INPUTS}</mds-input-date-range></form>`,
    );
    const host = form.querySelector('mds-input-date-range')!;
    const valueChange = spyOnEvent('mdsInputDateRangeValueChange');
    const { start, end } = fields(host);

    await typeDate(start, '2025-12-15');
    await typeDate(end, '2026-01-10');
    focusOut(host);
    await waitForChanges();

    expect(valueChanges(valueChange)).toEqual([]);
    expect(start.matches(':invalid')).toBe(true);
    expect(form.checkValidity()).toBe(false);
  });
});

// A native input is disabled by its own disabled or by a disabled fieldset. The range had neither:
// in a disabled fieldset its fields followed the fieldset, its calendar button did not (#852)
describe('disabled', () => {
  const readControls = (host: HTMLElement) => ({
    calendar:
      !!host.shadowRoot!.querySelector<HTMLMdsButtonElement>('.action-open-calendar')!.disabled,
    fields: Array.from(host.querySelectorAll('mds-input-date')).map(
      (field) => field.shadowRoot!.querySelector('input')!.disabled,
    ),
  });

  const setupForm = async (markup: string) => {
    const { root: form, waitForChanges } = await render<HTMLFormElement>(`<form>${markup}</form>`);
    return { form, host: form.querySelector('mds-input-date-range')!, waitForChanges };
  };

  const RANGE = 'name="period" start-date="2026-01-01" end-date="2026-01-10"';

  it('disables the calendar and the fields and leaves the dates out of the form, until it is enabled', async () => {
    const { form, host, waitForChanges } = await setupForm(
      `<mds-input-date-range ${RANGE} disabled>${SLOTTED_INPUTS}</mds-input-date-range>`,
    );

    await vi.waitFor(() =>
      expect(readControls(host)).toEqual({ calendar: true, fields: [true, true] }),
    );
    expect(new FormData(form).has('period')).toBe(false);

    host.disabled = false;
    await waitForChanges();

    expect(readControls(host)).toEqual({ calendar: false, fields: [false, false] });
    expect(new FormData(form).has('period')).toBe(true);
  });

  it('leaves alone a field disabled on its own when the range is not disabled', async () => {
    const { host } = await setupRange(
      '',
      '<mds-input-date slot="start" disabled></mds-input-date><mds-input-date slot="end"></mds-input-date>',
    );

    await vi.waitFor(() => expect(readControls(host).fields).toEqual([true, false]));
  });

  it('is disabled by a disabled fieldset, until the fieldset is enabled', async () => {
    const { form, host, waitForChanges } = await setupForm(
      `<fieldset disabled><mds-input-date-range ${RANGE}>${SLOTTED_INPUTS}</mds-input-date-range></fieldset>`,
    );

    await vi.waitFor(() =>
      expect(readControls(host)).toEqual({ calendar: true, fields: [true, true] }),
    );
    expect(new FormData(form).has('period')).toBe(false);

    form.querySelector('fieldset')!.disabled = false;
    await waitForChanges();

    expect(readControls(host)).toEqual({ calendar: false, fields: [false, false] });
    expect(new FormData(form).has('period')).toBe(true);
  });

  it('closes a calendar left open', async () => {
    const range = await setupRange();
    await openCalendar(range);

    range.host.disabled = true;
    await range.waitForChanges();

    expect(range.host.shadowRoot!.querySelector('mds-dropdown')).not.toHaveAttribute('visible');
  });
});

describe('preselections', () => {
  it('snaps the end of a preset that ends before it starts', async () => {
    const { root, spyOnEvent, waitForChanges } = await render<HTMLMdsInputDateRangeElement>(`
      <mds-input-date-range>
        ${SLOTTED_INPUTS}
        <mds-input-date-range-preselection start="2026-06-08" end="2026-06-02">
          Intervallo rovesciato
        </mds-input-date-range-preselection>
      </mds-input-date-range>
    `);
    const range = { host: root, waitForChanges };
    const valueChange = spyOnEvent('mdsInputDateRangeValueChange');

    await openCalendar(range);
    await clickPreselection(range);

    expect(valueChanges(valueChange)).toEqual([{ startDate: '2026-06-08', endDate: '2026-06-08' }]);
    expect(root.querySelector<HTMLMdsInputDateElement>('[slot="end"]')!.value).toBe('2026-06-08');
  });

  it('shows selected at load the preset that matches the dates of load', async () => {
    const { host } = await setupRange(
      'start-date="2026-06-02" end-date="2026-06-08"',
      `${SLOTTED_INPUTS}${PRESELECTION}`,
    );

    expect(host.querySelector('mds-input-date-range-preselection')).toHaveAttribute('selected');
  });
});

/** Whether the box of `inner` lies within the box of `outer`. */
const isInside = (inner: Element, outer: Element): boolean => {
  const a = inner.getBoundingClientRect();
  const b = outer.getBoundingClientRect();
  return a.top >= b.top && a.bottom <= b.bottom && a.left >= b.left && a.right <= b.right;
};

describe('size', () => {
  // one height for every field, 48px, where mds-button has sm 28px, md 36px and lg 48px
  it.each([
    { size: undefined, height: 48 },
    { size: 'lg', height: 48 },
    { size: 'md', height: 36 },
    { size: 'sm', height: 28 },
  ])('is $height px tall with the size $size', async ({ size, height }) => {
    const { root } = await render(
      `<mds-input-date-range${size ? ` size="${size}"` : ''}></mds-input-date-range>`,
    );

    expect(root.getBoundingClientRect().height).toBe(height);
  });

  it('fits an sm calendar button in an sm field', async () => {
    const { root } = await render('<mds-input-date-range size="sm"></mds-input-date-range>');
    const button = root.shadowRoot!.querySelector('.action-open-calendar')!;

    expect(button).toEqualAttribute('size', 'sm');
    expect(isInside(button, root)).toBe(true);
  });
});

// #937: the calendar toggle is an icon-only button
describe('mds-input-date-range calendar toggle', () => {
  useLanguage('it');

  it('is a button named in the current language', async () => {
    const { root } = await render('<mds-input-date-range></mds-input-date-range>');

    expect(root.shadowRoot!.querySelector('.action-open-calendar')).toEqualAttributes({
      role: 'button',
      'aria-label': 'Apri il calendario',
    });
  });
});

// #341: the calendar picks the end of the field the user is in, shown by the header of the panel
describe('the end the calendar picks', () => {
  // the days of the month shown when the range has no date: the current one
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const day = (n: number): string => `${month}-${String(n).padStart(2, '0')}`;

  const fieldOf = (host: HTMLElement, end: 'start' | 'end'): HTMLMdsInputDateElement =>
    host.querySelector<HTMLMdsInputDateElement>(`mds-input-date[slot="${end}"]`)!;

  // the field draws its native input in its own shadow root, which is what a click reaches
  const inputOf = (host: HTMLElement, end: 'start' | 'end'): HTMLInputElement =>
    fieldOf(host, end).shadowRoot!.querySelector('input')!;

  const voiceOf = (host: HTMLElement, end: 'start' | 'end'): HTMLMdsTabItemElement =>
    host.shadowRoot!.querySelector<HTMLMdsTabItemElement>(`mds-tab-item[value="${end}"]`)!;

  const dropdownOf = (host: HTMLElement): HTMLMdsDropdownElement =>
    host.shadowRoot!.querySelector<HTMLMdsDropdownElement>('mds-dropdown')!;

  /** The end the calendars pick, as the range tells them and as its header shows. */
  const activeEnd = (host: HTMLElement) => ({
    calendars: getCalendars(host).map((calendar) => calendar.getAttribute('active-end')),
    header: voiceOf(host, 'start').selected ? 'start' : voiceOf(host, 'end').selected && 'end',
  });

  const expectActive = async (host: HTMLElement, end: 'start' | 'end'): Promise<void> =>
    vi.waitFor(() =>
      expect(activeEnd(host)).toEqual({
        calendars: getCalendars(host).map(() => end),
        header: end,
      }),
    );

  /** The dates of the two fields. */
  const dates = (host: HTMLElement): [string, string] => [
    fieldOf(host, 'start').value ?? '',
    fieldOf(host, 'end').value ?? '',
  ];

  const pick = async (range: Range, date: string): Promise<void> => {
    const cell = getCalendars(range.host)
      .map((calendar) =>
        calendar.shadowRoot!.querySelector<HTMLElement>(
          `mds-calendar-cell[date="${date}"][month="current"]`,
        ),
      )
      .find((found) => found !== null)!;
    await userEvent.click(cell);
    await range.waitForChanges();
  };

  const setup = async (attributes = '') => {
    const { root, spyOnEvent, waitForChanges } = await render<HTMLMdsInputDateRangeElement>(
      `<mds-input-date-range delay="0" ${attributes}>${SLOTTED_INPUTS}</mds-input-date-range>`,
    );
    return {
      range: { host: root, waitForChanges },
      valueChange: spyOnEvent('mdsInputDateRangeValueChange'),
    };
  };

  it('picks the start first, then passes to the end by itself', async () => {
    const { range } = await setup();
    await openCalendar(range);
    await expectActive(range.host, 'start');

    await pick(range, day(10));

    await vi.waitFor(() => expect(dates(range.host)).toEqual([day(10), '']));
    await expectActive(range.host, 'end');

    await pick(range, day(14));

    await vi.waitFor(() => expect(dates(range.host)).toEqual([day(10), day(14)]));
  });

  it('picks the end of the field the user goes into', async () => {
    const { range } = await setup(`start-date="${day(10)}" end-date="${day(20)}"`);
    await expectActive(range.host, 'start');

    await userEvent.click(inputOf(range.host, 'end'));
    await expectActive(range.host, 'end');
    await openCalendar(range);
    await pick(range, day(15));

    await vi.waitFor(() => expect(dates(range.host)).toEqual([day(10), day(15)]));

    await userEvent.click(inputOf(range.host, 'start'));
    await expectActive(range.host, 'start');
  });

  it('starts on the end the range lacks', async () => {
    const { range } = await setup(`start-date="${day(10)}"`);

    await expectActive(range.host, 'end');
  });

  it('changes only the active end of a complete range, and leaves the panel open for the end', async () => {
    const { range, valueChange } = await setup(`start-date="${day(10)}" end-date="${day(20)}"`);
    await openCalendar(range);

    await pick(range, day(5));

    await vi.waitFor(() => expect(dates(range.host)).toEqual([day(5), day(20)]));
    await expectActive(range.host, 'end');

    await pick(range, day(25));

    await vi.waitFor(() => expect(dates(range.host)).toEqual([day(5), day(25)]));
    expect(valueChanges(valueChange)).toEqual([
      { startDate: day(5), endDate: day(20) },
      { startDate: day(5), endDate: day(25) },
    ]);
  });

  it('makes a day before the start the new start while the end is picked, the end still to pick', async () => {
    const { range } = await setup(`start-date="${day(10)}" end-date="${day(20)}"`);
    await userEvent.click(inputOf(range.host, 'end'));
    await openCalendar(range);

    await pick(range, day(3));

    await vi.waitFor(() => expect(dates(range.host)).toEqual([day(3), '']));
    await expectActive(range.host, 'end');
  });

  it('makes a day after the end the new start while the start is picked, the end emptied', async () => {
    const { range } = await setup(`start-date="${day(10)}" end-date="${day(15)}"`);
    await openCalendar(range);

    await pick(range, day(20));

    await vi.waitFor(() => expect(dates(range.host)).toEqual([day(20), '']));
    await expectActive(range.host, 'end');
  });

  it('closes the panel after the click that picks the end, not after the one that picks the start', async () => {
    const { root, waitForChanges } = await render<HTMLMdsInputDateRangeElement>(
      `<mds-input-date-range delay="50">${SLOTTED_INPUTS}</mds-input-date-range>`,
    );
    const range = { host: root, waitForChanges };
    await openCalendar(range);

    await pick(range, day(10));
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(dropdownOf(root)).toHaveAttribute('visible');

    await pick(range, day(14));
    await vi.waitFor(() => expect(dropdownOf(root)).not.toHaveAttribute('visible'));
  });

  describe('the header', () => {
    it('shows each end with its date, or asks for one', async () => {
      const { range } = await setup('start-date="2026-03-10"');

      expect(voiceOf(range.host, 'start')).toEqualAttribute('label', 'Start: Mar 10, 2026');
      expect(voiceOf(range.host, 'end')).toEqualAttribute('label', 'End: Pick a date');
    });

    it('leaves the end out of reach until the range has a start', async () => {
      const { range } = await setup();

      expect(voiceOf(range.host, 'end')).toHaveAttribute('disabled');

      await openCalendar(range);
      await pick(range, day(10));

      await vi.waitFor(() => expect(voiceOf(range.host, 'end')).not.toHaveAttribute('disabled'));
    });

    it('changes the end the calendar picks with a click on a voice', async () => {
      const { range } = await setup(`start-date="${day(10)}" end-date="${day(20)}"`);
      await openCalendar(range);

      await userEvent.click(voiceOf(range.host, 'end'));
      await expectActive(range.host, 'end');

      await userEvent.click(voiceOf(range.host, 'start'));
      await expectActive(range.host, 'start');

      await pick(range, day(12));
      await vi.waitFor(() => expect(dates(range.host)).toEqual([day(12), day(20)]));
    });

    it('changes it from the keyboard, Enter or Space on a voice', async () => {
      const { range } = await setup(`start-date="${day(10)}" end-date="${day(20)}"`);
      await openCalendar(range);
      const button = (end: 'start' | 'end'): HTMLElement =>
        voiceOf(range.host, end).shadowRoot!.querySelector<HTMLElement>('mds-button')!;

      button('end').focus();
      await userEvent.keyboard('{Enter}');
      await expectActive(range.host, 'end');

      button('start').focus();
      await userEvent.keyboard(' ');
      await expectActive(range.host, 'start');
    });

    it('keeps its change inside the range', async () => {
      const { range } = await setup(`start-date="${day(10)}"`);
      const changes: Event[] = [];
      const listen = (event: Event): number => changes.push(event);
      document.addEventListener('mdsTabChange', listen);
      await openCalendar(range);

      await userEvent.click(voiceOf(range.host, 'start'));
      await expectActive(range.host, 'start');
      document.removeEventListener('mdsTabChange', listen);

      expect(changes).toEqual([]);
    });
  });

  it('warns nothing when a click in the second calendar moves the start past the end', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { range } = await setup(`dual-calendar start-date="${day(10)}" end-date="${day(14)}"`);
    await openCalendar(range);

    const next = new Date(now.getFullYear(), now.getMonth() + 1, 5);
    const nextDay = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-05`;
    await pick(range, nextDay);

    await vi.waitFor(() => expect(dates(range.host)).toEqual([nextDay, '']));
    const [first] = getCalendars(range.host);
    await vi.waitFor(() =>
      expect(
        first.shadowRoot!.querySelector('mds-calendar-cell[month="current"][selection]'),
      ).toBeNull(),
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it('leaves no preview behind after the click that empties the end', async () => {
    const { range } = await setup(`start-date="${day(10)}"`);
    await openCalendar(range);
    const [calendar] = getCalendars(range.host);
    const cellOf = (date: string) =>
      calendar.shadowRoot!.querySelector<HTMLElement>(
        `mds-calendar-cell[date="${date}"][month="current"]`,
      )!;

    await userEvent.hover(cellOf(day(14)));
    await vi.waitFor(() => expect(cellOf(day(12))).toHaveAttribute('preview'));
    await pick(range, day(14));
    await userEvent.hover(cellOf(day(3)));
    await pick(range, day(3));

    await vi.waitFor(() => expect(dates(range.host)).toEqual([day(3), '']));
    await vi.waitFor(() =>
      expect(calendar.shadowRoot!.querySelectorAll('mds-calendar-cell[preview]')).toHaveLength(0),
    );
    expect(cellOf(day(3))).toHaveAttribute('selection', 'single');
  });

  it('submits the range as the same JSON string', async () => {
    const { root: form, waitForChanges } = await render<HTMLFormElement>(
      `<form><mds-input-date-range name="period" delay="0">${SLOTTED_INPUTS}</mds-input-date-range></form>`,
    );
    const range = { host: form.querySelector('mds-input-date-range')!, waitForChanges };
    await openCalendar(range);

    await pick(range, day(10));
    await pick(range, day(14));

    await vi.waitFor(() =>
      expect(new FormData(form).get('period')).toBe(
        JSON.stringify({ startDate: day(10), endDate: day(14) }),
      ),
    );
  });

  it('aligns the grids of two calendars, a month of five weeks next to one of six', async () => {
    const range = await setupRange('dual-calendar start-date="2026-03-25" end-date="2026-04-08"');
    await openCalendar(range);

    const tops = getCalendars(range.host).map(
      (calendar) =>
        calendar.shadowRoot!.querySelector('.month-view__cells')!.getBoundingClientRect().top,
    );

    expect(tops[0]).toBeCloseTo(tops[1], 0);
  });
});

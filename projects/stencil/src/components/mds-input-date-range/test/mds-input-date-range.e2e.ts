import { render, vi } from '@stencil/vitest';
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

  it('treats the first click in the last visible calendar as the end date when hovering left', async () => {
    const { host, waitForChanges } = await setupRange('dual-calendar="true"');

    dispatch(getCalendars(host)[0], 'mdsCalendarNavigate', { currentDate: '2026-06-01' });
    dispatch(getCalendars(host)[1], 'mdsCalendarChange', { startDate: '2026-07-24' });
    await waitForChanges();

    dispatch(getCalendars(host)[0], 'mdsCalendarHover', { hoverDate: '2026-06-02' });
    await waitForChanges();

    const [firstCalendar, secondCalendar] = getCalendars(host);
    const startCell = firstCalendar.shadowRoot!.querySelector(
      'mds-calendar-cell[date="2026-06-02"]',
    );
    const endCell = secondCalendar.shadowRoot!.querySelector(
      'mds-calendar-cell[date="2026-07-24"]',
    );

    expect({
      startSelection: startCell?.getAttribute('selection'),
      startPreview: startCell?.hasAttribute('preview'),
      endSelection: endCell?.getAttribute('selection'),
      endPreview: endCell?.hasAttribute('preview'),
    }).toEqual({
      startSelection: 'start',
      startPreview: true,
      endSelection: 'end',
      endPreview: true,
    });
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

  it('does not emit value change on focusout when the range is invalid', async () => {
    // The inner mds-calendar throws a RangeError for the invalid start date (the Stencil test
    // runner hid it as a page error): render without waitForReady so that the lifecycle error
    // of the child is not re-thrown, the guard under test lives in mds-input-date-range.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { root, spyOnEvent, waitForChanges } = await render<HTMLMdsInputDateRangeElement>(
      `<mds-input-date-range start-date="invalid-date" end-date="2026-06-08">${SLOTTED_INPUTS}</mds-input-date-range>`,
      { waitForReady: false },
    );
    await waitForChanges();
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
});

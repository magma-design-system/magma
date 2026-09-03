import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

describe('mds-calendar', () => {
  it('renders', async () => {
    const { root } = await render('<mds-calendar></mds-calendar>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('renders and selects adjacent month days', async () => {
    const { root, waitForChanges } = await render(
      '<mds-calendar view-date="2026-08-01"></mds-calendar>',
    );

    const shadow = root.shadowRoot!;
    const calendarCells = shadow.querySelectorAll('mds-calendar-cell');
    const otherMonthCell = shadow.querySelector<HTMLElement>('mds-calendar-cell[month="other"]')!;

    expect(calendarCells.length).toBeGreaterThan(31);
    expect(otherMonthCell).not.toBeNull();
    expect(otherMonthCell.getAttribute('month')).toBe('other');

    await userEvent.click(otherMonthCell);
    await waitForChanges();

    expect(otherMonthCell.getAttribute('selection')).toBe('single');
  });

  it('updates the visible range when end date is set after the start date', async () => {
    const { root, waitForChanges } = await render(
      '<mds-calendar view-date="2026-06-01" start-date="2026-06-02"></mds-calendar>',
    );

    root.setAttribute('end-date', '2026-07-24');
    await waitForChanges();

    const shadow = root.shadowRoot!;
    const juneLastDay = shadow.querySelector('mds-calendar-cell[date="2026-06-30"]')!;
    const julyVisibleDay = shadow.querySelector('mds-calendar-cell[date="2026-07-05"]')!;

    expect(juneLastDay.getAttribute('selection')).toBe('middle');
    expect(julyVisibleDay.getAttribute('selection')).toBe('middle');
  });

  it('previews the full visible range when hovering into the next month', async () => {
    const { root } = await render(
      '<mds-calendar view-date="2026-06-01" start-date="2026-06-02" hover-date="2026-07-24"></mds-calendar>',
    );

    const shadow = root.shadowRoot!;
    const juneLastDay = shadow.querySelector('mds-calendar-cell[date="2026-06-30"]')!;
    const julyVisibleDay = shadow.querySelector('mds-calendar-cell[date="2026-07-05"]')!;

    expect(juneLastDay).toHaveAttribute('preview');
    expect(juneLastDay.getAttribute('selection')).toBe('middle');
    expect(julyVisibleDay).toHaveAttribute('preview');
    expect(julyVisibleDay.getAttribute('selection')).toBe('middle');
  });

  it('switches to month selection when clicking the month action by default', async () => {
    const { root, waitForChanges } = await render(
      '<mds-calendar view-date="2026-06-01"></mds-calendar>',
    );

    await userEvent.click(root.shadowRoot!.querySelector('.action-month')!);
    await waitForChanges();

    expect(root.shadowRoot!.querySelector('.month-selection')).not.toBeNull();
  });

  it('switches to year selection when clicking the year action by default', async () => {
    const { root, waitForChanges } = await render(
      '<mds-calendar view-date="2026-06-01"></mds-calendar>',
    );

    await userEvent.click(root.shadowRoot!.querySelector('.action-year')!);
    await waitForChanges();

    expect(root.shadowRoot!.querySelector('.year-selection')).not.toBeNull();
  });

  it('does not switch view when month or year selection is disabled', async () => {
    const { root, waitForChanges } = await render(
      '<mds-calendar view-date="2026-06-01" disable-month-year-selection="true"></mds-calendar>',
    );
    const shadow = root.shadowRoot!;

    await userEvent.click(shadow.querySelector('.action-month')!);
    await userEvent.click(shadow.querySelector('.action-year')!);
    await waitForChanges();

    expect(shadow.querySelector('.month-view')).not.toBeNull();
    expect(shadow.querySelector('.month-selection')).toBeNull();
    expect(shadow.querySelector('.year-selection')).toBeNull();
  });
});

describe('mds-calendar sizing', () => {
  const setupInContainer = async (containerStyle: string, calendarStyle = '') => {
    const { root } = await render(`
      <div style="${containerStyle}">
        <mds-calendar view-date="2026-08-01" style="${calendarStyle}"></mds-calendar>
      </div>
    `);
    return root.querySelector<HTMLElement>('mds-calendar')!;
  };

  it('fills its container up to --mds-calendar-max-width', async () => {
    const calendar = await setupInContainer('width: 800px;');

    expect(calendar.offsetWidth).toBe(480);
  });

  it('shrinks with a narrower container', async () => {
    const calendar = await setupInContainer('width: 400px;');

    expect(calendar.offsetWidth).toBe(400);
  });

  it('does not let the week-day header inflate its intrinsic width beyond max-width', async () => {
    // `min-width: max-content` is what mds-input-date used to apply: it must not blow the calendar
    // past its own max-width, otherwise the used min-width wins over max-width.
    const calendar = await setupInContainer('display: inline-block;', 'min-width: max-content;');

    expect(calendar.offsetWidth).toBeLessThanOrEqual(480);
  });

  it('sizes the week-day header cells from the grid track', async () => {
    const calendar = await setupInContainer('width: 800px;');
    const header = calendar.shadowRoot!.querySelector<HTMLElement>('.week-day-name')!;
    const cell = calendar.shadowRoot!.querySelector<HTMLElement>('mds-calendar-cell')!;

    // 480 - 2 * 16px padding - 6 * 2px gaps = 7 tracks of ~62px; the header keeps a fixed 48px height
    expect(header.offsetHeight).toBe(48);
    expect(header.offsetWidth).toBe(cell.offsetWidth);
    expect(cell.offsetWidth).toBeGreaterThanOrEqual(62);
    expect(cell.offsetWidth).toBeLessThanOrEqual(63);
  });

  it('stretches the day button over the whole cell, keeping the number centered', async () => {
    const calendar = await setupInContainer('width: 800px;');
    const cell = calendar.shadowRoot!.querySelector<HTMLElement>(
      'mds-calendar-cell[date="2026-08-12"]',
    )!;
    const action = cell.shadowRoot!.querySelector<HTMLElement>('.action')!;
    const cellRect = cell.getBoundingClientRect();
    const actionRect = action.getBoundingClientRect();

    // mds-button places itself flex-start on its :host; without place-self: stretch the
    // absolutely positioned button shrinks to its label and the day number sticks to the
    // top-left corner of the cell instead of covering it.
    expect(actionRect.left).toBeLessThanOrEqual(cellRect.left);
    expect(actionRect.right).toBeGreaterThanOrEqual(cellRect.right);
    expect(
      Math.abs(actionRect.x + actionRect.width / 2 - (cellRect.x + cellRect.width / 2)),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(actionRect.y + actionRect.height / 2 - (cellRect.y + cellRect.height / 2)),
    ).toBeLessThanOrEqual(1);
  });
});

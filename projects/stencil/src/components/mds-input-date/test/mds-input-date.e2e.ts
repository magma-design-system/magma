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

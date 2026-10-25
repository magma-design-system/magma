import { render } from '@stencil/vitest';
import colors from '../../../../../styles/dist/css/colors-rgb.css?raw';
import globals from '../../../../../styles/dist/css/globals.css?raw';
import semantic from '../../../../../styles/dist/css/semantic.css?raw';

const background = (cell: Element, part: string): string =>
  getComputedStyle(cell.shadowRoot!.querySelector(part)!).backgroundColor;

describe('mds-calendar-cell', () => {
  it('renders', async () => {
    const { root } = await render('<mds-calendar-cell></mds-calendar-cell>');

    expect(root).toHaveAttribute('hydrated');
  });

  it.each(['current', 'other'])(
    'paints selection="none" as a cell of the %s month without selection',
    async (month) => {
      const { root } = await render(`<div>
        <mds-calendar-cell label="1" month="${month}"></mds-calendar-cell>
        <mds-calendar-cell label="2" month="${month}" selection="none"></mds-calendar-cell>
        <mds-calendar-cell label="3" month="${month}" selection="middle"></mds-calendar-cell>
      </div>`);
      const [unselected, none, selected] = Array.from(root.querySelectorAll('mds-calendar-cell'));

      expect(background(none, '.area-background')).toBe(background(unselected, '.area-background'));
      expect(background(none, '.inner-dot')).toBe(background(unselected, '.inner-dot'));
      // what a selection paints, so the comparison above means something
      expect(background(selected, '.area-background')).not.toBe(
        background(unselected, '.area-background'),
      );
    },
  );

  // #1142: inside a range the weekend kept the muted text of the weekend on the band of the
  // selection: 3.15:1 in light, 2.16:1 in dark
  describe('a weekend day inside a range', () => {
    let sheet: HTMLStyleElement | undefined;

    afterEach(() => {
      sheet?.remove();
      document.documentElement.removeAttribute('data-magma-pref');
      document.documentElement.classList.remove('pref-mode-dark');
    });

    const luminance = (color: string): number =>
      color
        .match(/\d+(\.\d+)?/g)!
        .slice(0, 3)
        .map((channel) => {
          const value = Number(channel) / 255;
          return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        })
        .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);

    it.each(['light', 'dark'])(
      'reads the text of the selection on the band, in %s',
      async (mode) => {
        // the palette of the page: the roles resolve to their values in the mode, not to the
        // fallbacks the components carry; the store follows <html> after a tick
        sheet = document.createElement('style');
        sheet.textContent = [colors, globals, semantic].join('\n');
        document.head.append(sheet);
        document.documentElement.setAttribute('data-magma-pref', '');
        document.documentElement.classList.toggle('pref-mode-dark', mode === 'dark');
        await new Promise((resolve) => setTimeout(resolve, 50));
        // a week: the sixth and the seventh cell are the weekend
        const { root } = await render(
          `<div>${Array.from(
            { length: 7 },
            (_, day) =>
              `<mds-calendar-cell label="${day + 8}" month="current" selection="middle"></mds-calendar-cell>`,
          ).join('')}</div>`,
        );
        const saturday = root.querySelectorAll('mds-calendar-cell')[5];
        const band = luminance(background(saturday, '.area-background'));
        const text = luminance(
          getComputedStyle(saturday.shadowRoot!.querySelector('.action')!).color,
        );

        expect(
          (Math.max(band, text) + 0.05) / (Math.min(band, text) + 0.05),
        ).toBeGreaterThanOrEqual(4.5);
      },
    );
  });
});

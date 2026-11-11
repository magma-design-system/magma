import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';

export default {
  title: 'UI / Forms / Input Date Range',
  id: 'form-input-date-range',
  argTypes: {
    delay: {
      type: { name: 'number' },
      description: 'Specifies the delay in milliseconds before closing the calendar dropdown',
    },
    'start-date': {
      type: { name: 'string' },
      description: 'Specifies the start date of the range',
    },
    'end-date': {
      type: { name: 'string' },
      description: 'Specifies the end date of the range',
    },
    min: {
      type: { name: 'string' },
      description: 'Specifies the min date of the range, user cannot set dates before this date',
    },
    max: {
      type: { name: 'string' },
      description: 'Specifies the max date of the range, user cannot set dates after this date',
    },
    'dual-calendar': {
      type: { name: 'boolean' },
      description: 'Enables the linked dual-calendar range picker behavior',
    },
    disabled: {
      type: { name: 'boolean' },
      description:
        'Disables the range, its calendar and the two fields: the dates are left out of the form',
    },
  },
};

const formatDate = (date = new Date()) => {
  // Format: YYYY-MM-DD
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMonthBounds = (date = new Date()) => {
  // Primo giorno del mese
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

  // Ultimo giorno del mese
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    startOfMonth: formatDate(firstDay),
    endOfMonth: formatDate(lastDay),
  };
};

const getWeekBounds = (date = new Date()) => {
  // Clona la data per non modificarla
  const currentDate = new Date(date);

  // Ottiene il giorno della settimana (0 = domenica, 1 = lunedì, ..., 6 = sabato)
  const day = currentDate.getDay();

  // Calcola differenza dal lunedì
  const diffToMonday = day === 0 ? -6 : 1 - day;

  // Primo giorno (lunedì)
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() + diffToMonday);

  // Ultimo giorno (domenica)
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // Ritorna date pulite (solo anno-mese-giorno)
  return {
    startOfWeek: monday.toISOString().split('T')[0],
    endOfWeek: sunday.toISOString().split('T')[0],
  };
};

const getDate = (offsetDays: number = 0): string => {
  const today = new Date();
  today.setDate(today.getDate() + offsetDays);

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const Template = (args) => (
  <mds-input-date-range {...args} class="max-w-[400px]">
    <mds-input-date slot="start"></mds-input-date>
    <mds-input-date slot="end"></mds-input-date>
  </mds-input-date-range>
);

const TemplateMinMax = (args) => (
  <div class="grid gap-400 max-w-[400px]">
    <mds-input-date-range {...args}>
      <mds-input-date slot="start"></mds-input-date>
      <mds-input-date slot="end"></mds-input-date>
    </mds-input-date-range>
    <div class="inline-flex gap-400">
      <mds-text>Min date {args.min}</mds-text>
      <mds-text>Max date {args.max}</mds-text>
    </div>
  </div>
);

const TemplatePreselection = (args) => {
  const { startOfWeek, endOfWeek } = getWeekBounds();
  const { startOfMonth, endOfMonth } = getMonthBounds();
  return (
    <div class="grid gap-400 max-w-[400px]">
      <mds-input-date-range {...args}>
        <mds-input-date slot="start"></mds-input-date>
        <mds-input-date slot="end"></mds-input-date>
        <mds-input-date-range-preselection start={startOfWeek} end={endOfWeek}>
          Questa settimana
        </mds-input-date-range-preselection>
        <mds-input-date-range-preselection start={startOfMonth} end={endOfMonth}>
          Questo mese
        </mds-input-date-range-preselection>
      </mds-input-date-range>
    </div>
  );
};

export const Default = {
  render: Template,
};

export const InvalidDates = {
  render: Template,

  args: {
    'start-date': getDate(-3),
    'end-date': getDate(4),
  },
};

export const MinMax = {
  render: TemplateMinMax,

  args: {
    'start-date': getDate(-3),
    'end-date': getDate(4),
    min: getDate(-30),
    max: getDate(30),
  },
};

export const Preselection = {
  render: TemplatePreselection,
};

// The flow of #341, walked by the play of the stories below: the calendar picks the start, passes
// to the end by itself, picks the end; then the voice of the start in the header changes the start
// alone. delay 0 keeps the panel open, so that the a11y check audits the header and the calendar.
const pad = (value: number): string => String(value).padStart(2, '0');

const dayOfMonth = (n: number): string => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(n)}`;
};

const walkTheRange = async ({ canvasElement, userEvent }) => {
  const host = canvasElement.querySelector('mds-input-date-range') as HTMLMdsInputDateRangeElement;
  await host.componentOnReady();
  const root = host.shadowRoot as ShadowRoot;
  const dropdown = root.querySelector('mds-dropdown') as HTMLMdsDropdownElement;
  await dropdown.componentOnReady();

  const cell = (date: string): HTMLElement =>
    Array.from(root.querySelectorAll('mds-calendar'))
      .map((calendar) =>
        calendar.shadowRoot?.querySelector<HTMLElement>(
          `mds-calendar-cell[date="${date}"][month="current"]`,
        ),
      )
      .find((found) => found != null) as HTMLElement;
  const voice = (end: 'start' | 'end'): HTMLMdsTabItemElement =>
    root.querySelector(`mds-tab-item[value="${end}"]`) as HTMLMdsTabItemElement;
  const dates = (): string[] =>
    ['start', 'end'].map(
      (end) => (host.querySelector(`[slot="${end}"]`) as HTMLMdsInputDateElement).value ?? '',
    );

  await userEvent.click(root.querySelector('#calendar-dropdown') as HTMLElement);
  await waitFor(() => expect(dropdown).toHaveAttribute('visible'), { timeout: 5000 });
  await waitFor(() => expect(voice('start')).toHaveAttribute('selected'));

  await userEvent.click(cell(dayOfMonth(10)));
  await waitFor(() => expect(dates()).toEqual([dayOfMonth(10), '']));
  await waitFor(() => expect(voice('end')).toHaveAttribute('selected'));

  await userEvent.click(cell(dayOfMonth(14)));
  await waitFor(() => expect(dates()).toEqual([dayOfMonth(10), dayOfMonth(14)]));

  // the voice listens on its inner button, which a synthetic click on the host never reaches
  await userEvent.click(voice('start').shadowRoot?.querySelector('mds-button') as HTMLElement);
  await waitFor(() => expect(voice('start')).toHaveAttribute('selected'));

  await userEvent.click(cell(dayOfMonth(5)));
  await waitFor(() => expect(dates()).toEqual([dayOfMonth(5), dayOfMonth(14)]));
  await waitFor(() => expect(voice('end')).toHaveAttribute('selected'));
};

// The palette flips on the classes of <html>, which the components watch: the dark stories set
// the mode for themselves and give the previous one back when they end.
const inDarkMode = () => {
  const html = document.documentElement;
  const previous = Array.from(html.classList).filter((name) => name.startsWith('pref-mode-'));
  const previousVariable = html.style.getPropertyValue('--magma-pref-mode');
  html.classList.remove(...previous);
  html.classList.add('pref-mode-dark');
  html.style.setProperty('--magma-pref-mode', 'dark');
  return () => {
    html.classList.remove('pref-mode-dark');
    html.classList.add(...previous);
    if (previousVariable !== '') html.style.setProperty('--magma-pref-mode', previousVariable);
    else html.style.removeProperty('--magma-pref-mode');
  };
};

export const PickARange = {
  render: Template,

  args: {
    delay: 0,
  },

  play: walkTheRange,
};

export const PickARangeDark = {
  render: Template,

  args: {
    delay: 0,
  },

  beforeEach: inDarkMode,
  play: walkTheRange,
};

export const DualCalendar = {
  render: Template,

  args: {
    'dual-calendar': true,
    delay: 0,
  },

  play: walkTheRange,
};

export const DualCalendarDark = {
  render: Template,

  args: {
    'dual-calendar': true,
    delay: 0,
  },

  beforeEach: inDarkMode,
  play: walkTheRange,
};

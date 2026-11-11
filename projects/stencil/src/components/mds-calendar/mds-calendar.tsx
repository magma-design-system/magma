import {
  Component,
  Host,
  Method,
  Prop,
  State,
  h,
  Element,
  Watch,
  EventEmitter,
  Event,
} from '@stencil/core';
import miBaselineForwardIos from '@icon/mi/baseline/arrow-forward-ios.svg';
import miBaselineBackIosNew from '@icon/mi/baseline/arrow-back-ios-new.svg';
import { DateTime } from 'luxon';
import { preferenceStore } from '@common/preference';
import { sanitizeISO8601Date } from '@common/date';
import { hasChildWithSlot } from '@common/slot';
import clsx from 'clsx';
import { Locale } from '@common/locale';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';
import { CalendarRangeEndType } from './meta/types';
import { CalendarCellSelectionPositionType } from '@component/mds-calendar-cell/meta/types';

/** How a day cell draws the selection. */
interface CellMark {
  selection: CalendarCellSelectionPositionType;
  preview: boolean;
}

const isSet = (value: string | null | undefined): value is string =>
  value !== null && value !== undefined && value !== '';

/** An ISO date as the midnight that starts it, the time of the days of the grid. */
const toDay = (iso: string): DateTime => DateTime.fromISO(iso).startOf('day');

/**
 * @slot preselection - Add `HTML elements` or `components` shown in the calendar preselection area.
 * @category forms
 */
@Component({
  tag: 'mds-calendar',
  styleUrl: 'mds-calendar.css',
  shadow: true,
})
export class MdsCalendar {
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });

  @Element() private host: HTMLMdsCalendarElement;

  @State() hasPreselection: boolean = false;
  @State() currentDate: DateTime = DateTime.now();
  @State() weekDaysinMonth: DateTime[] = [];
  @State() weekdays: string[] = [];
  @State() currentView: 'calendar' | 'years' | 'months' = 'calendar';
  @State() selectedYear: number = this.currentDate.year;

  /**
   * If set, the component selects a single date instead of a date range (start and end date).
   */
  @Prop() readonly singlePicker: boolean = false;

  /**
   * If set, the component hides the previous navigation button in the calendar header.
   */
  @Prop() readonly hidePreviousButton: boolean = false;

  /**
   * If set, the component hides the next navigation button in the calendar header.
   */
  @Prop() readonly hideNextButton: boolean = false;

  /**
   * Disables switching to month or year selection views from the calendar header.
   */
  @Prop() readonly disableMonthYearSelection: boolean = false;

  /**
   * If set, the component hides the preselection area above the calendar view even when the
   * `preselection` slot has content.
   */
  @Prop() readonly hidePreselection: boolean = false;

  /**
   * Hides the highlight on today's date in the calendar view.
   */
  @Prop() readonly hideToday: boolean = false;

  /**
   * Specifies the date used to determine the visible month without changing the selection.
   * @description It's in ISO format (YYYY-MM-DD).
   * @example '2023-10-01'
   */
  @Prop({ reflect: true }) readonly viewDate: string | null = null;

  /**
   * Specifies the date used to preview the range selection across multiple visible calendars.
   * @description It's in ISO format (YYYY-MM-DD).
   * @example '2023-10-15'
   */
  @Prop({ reflect: true }) readonly hoverDate: string | null = null;

  /**
   * Specifies the start date of the selection
   * @description It's in ISO format (YYYY-MM-DD).
   * @example '2023-10-01'
   */
  @Prop({ reflect: true }) readonly startDate: string | null = null;

  /**
   * Specifies the end date of the selection
   * @description It's in ISO format (YYYY-MM-DD).
   * @example '2023-10-01'
   */
  @Prop({ reflect: true }) readonly endDate: string | null = null;

  /**
   * Specifies the end of the range the next click picks, `start` or `end`, for a parent that
   * lets the user choose it, as `mds-input-date-range` does from its fields and from the header
   * of its panel. A click never puts the range backwards: a day after the end, picked as the
   * start, becomes the new start and empties the end; a day before the start, picked as the end,
   * becomes the new start and leaves the end to pick. With no start, a click picks the start.
   * Left unset, the calendar picks the start, then the end, and a click on a complete range
   * starts a new one.
   */
  @Prop({ reflect: true }) readonly activeEnd?: CalendarRangeEndType;

  /**
   * Specifies the minimum date of the selection
   * @description It's in ISO format (YYYY-MM-DD).
   * @example '2023-10-01'
   */
  @Prop({ reflect: true }) readonly min: string | null = null;

  /**
   * Specifies the minimum date of the selection
   * @description It's in ISO format (YYYY-MM-DD).
   * @example '2023-10-01'
   */
  @Prop({ reflect: true }) readonly max: string | null = null;
  @State() internalStartDate: string | null = this.startDate;
  @State() internalEndDate: string | null = this.endDate;

  /**
   * Emitted when the selected date or date range changes.
   */
  @Event({ eventName: 'mdsCalendarChange' }) datesEmitter: EventEmitter<{
    startDate: string;
    endDate?: string;
  }>;
  /**
   * Emitted when the user navigates to a different month or year.
   */
  @Event({ eventName: 'mdsCalendarNavigate' }) navigationEmitter: EventEmitter<{
    currentDate: string;
    delta: number;
  }>;
  /**
   * Emitted when the user hovers over a day, used to preview a range selection.
   */
  @Event({ eventName: 'mdsCalendarHover' }) hoverEmitter: EventEmitter<{
    hoverDate: string | null;
  }>;
  /**
   * Emitted when the calendar's preselection options need to be re-evaluated.
   */
  @Event({ eventName: 'mdsCalendarPreselect' }) checkPreselectionsEmitter: EventEmitter<void>;

  @Watch('startDate')
  handleStartDate(): void {
    this.queueRangeProps('start');
  }

  @Watch('endDate')
  handleEndDate(): void {
    this.queueRangeProps('end');
  }

  @Watch('viewDate')
  handleViewDate(newValue: string | null): void {
    if (newValue !== null && newValue !== '') {
      const viewDate = DateTime.fromISO(newValue.toString());

      if (viewDate.isValid) {
        this.currentDate = viewDate;
        this.updateCalendar().then(() => {
          requestAnimationFrame(() => this.setDates());
        });
      }
    }
  }

  @Watch('hoverDate')
  @Watch('activeEnd')
  handleHoverDate(): void {
    requestAnimationFrame(() => this.setDates());
  }

  /** The ends whose prop changed since the range was last read from the props. */
  private pendingRangeProps = new Set<CalendarRangeEndType>();

  /**
   * A parent sets `start-date` and `end-date` one after the other: the range is read once both
   * have arrived, in a microtask. Read at the first of the two, a start moved past the old end
   * looked like a range given backwards, and the calendar swapped the new start with the old end
   * and warned (the second calendar of `mds-input-date-range`, #341).
   */
  private queueRangeProps(end: CalendarRangeEndType): void {
    if (this.pendingRangeProps.size === 0) queueMicrotask(this.applyRangeProps);
    this.pendingRangeProps.add(end);
  }

  private readonly applyRangeProps = (): void => {
    const pending = this.pendingRangeProps;
    this.pendingRangeProps = new Set();

    if (pending.has('start')) {
      this.internalStartDate = this.parseDateProp(this.startDate, 'start-date');
    }

    if (pending.has('end')) {
      if (this.singlePicker) {
        if (isSet(this.endDate)) console.warn('singlePicker is enabled, endDate cannot be set');
        this.internalEndDate = null;
      } else {
        this.internalEndDate = this.parseDateProp(this.endDate, 'end-date');
      }
    }

    this.orderRange();
    this.updateDates();
  };

  /**
   * A range given backwards, a start after its end, is put in order. The warning always said
   * the values were swapped, but the calendar kept the dates it was given and drew nothing new,
   * and at load the order was not checked at all.
   */
  private orderRange(): void {
    const { internalStartDate: start, internalEndDate: end } = this;
    if (!isSet(start) || !isSet(end) || toDay(start) <= toDay(end)) return;
    console.warn('mds-calendar: startDate is after endDate, swapping values');
    this.internalStartDate = end;
    this.internalEndDate = start;
  }

  /**
   * Normalizes a date prop to an ISO 8601 date, treating an empty or invalid value as unset
   * (`null`). An invalid value is reported with a warning instead of breaking the component
   * lifecycle.
   */
  private parseDateProp(value: string | null, name: 'start-date' | 'end-date'): string | null {
    if (value === null || value === '') {
      return null;
    }

    const date = sanitizeISO8601Date(value.toString());

    if (date === null || !DateTime.fromISO(date).isValid) {
      console.warn(`mds-calendar: ignoring the invalid ${name} "${value}"`);
      return null;
    }

    return DateTime.fromISO(date).toISODate();
  }

  /** The day under the pointer in this calendar, while a range waits for its end. */
  private internalHoverDate: string | null = null;

  @State() currentMonth: string = '';
  private currentMonthNumber!: number;
  @State() currentYear: string = '';

  componentWillLoad(): void {
    this.internalStartDate = this.parseDateProp(this.internalStartDate, 'start-date');
    this.internalEndDate = this.parseDateProp(this.internalEndDate, 'end-date');

    if (this.singlePicker && this.internalEndDate !== null) {
      console.warn('singlePicker is enabled, endDate cannot be set');
      this.internalEndDate = null;
    }
    this.orderRange();

    if (this.viewDate !== null && this.viewDate !== '') {
      const viewDate = DateTime.fromISO(this.viewDate.toString());

      if (viewDate.isValid) {
        this.currentDate = viewDate;
      }
    } else if (this.internalStartDate !== null) {
      this.currentDate = DateTime.fromISO(this.internalStartDate);
    }

    this.updateCalendar();
  }

  // The area shows what the preselection slot holds, added after load too. It used to wait for a
  // `date-preselection--has-preselection` marker class, looked up once on load (#826); the class
  // still shows it, for the pages written that way.
  private readonly updatePreselection = (): void => {
    this.hasPreselection =
      hasChildWithSlot(this.host, 'preselection') ||
      this.host.querySelector('.date-preselection--has-preselection') !== null;
  };

  componentDidLoad(): void {
    this.updatePreselection();

    this.host?.shadowRoot?.addEventListener('mouseover', this.handleMouseOver);
    this.host?.addEventListener('mouseleave', this.handleMouseLeave);

    this.setDates();
  }

  disconnectedCallback(): void {
    this.host?.shadowRoot?.removeEventListener('mouseover', this.handleMouseOver);
    this.host?.removeEventListener('mouseleave', this.handleMouseLeave);
  }

  /**
   * Sets the calendar's current date and re-renders the calendar accordingly.
   * @param date the date to display, in ISO format (YYYY-MM-DD)
   */
  @Method() async updateCurrentDate(date: string): Promise<void> {
    this.currentDate = DateTime.fromISO(date);
    await this.updateCalendar();
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        this.setDates();
        resolve();
      });
    });
    return Promise.resolve();
  }

  /** A range with its start and still without its end, the one a pointer previews. */
  private waitsForEnd(): boolean {
    return !this.singlePicker && isSet(this.internalStartDate) && !isSet(this.internalEndDate);
  }

  private readonly handleMouseOver = (event: Event): void => {
    const target = event.target as HTMLElement;

    if (!target.matches('mds-calendar-cell') || !this.waitsForEnd()) {
      return;
    }

    const hoverDate = target.getAttribute('date');
    if (hoverDate !== null && hoverDate !== '') {
      if (hoverDate !== this.internalHoverDate) {
        this.internalHoverDate = hoverDate;
        requestAnimationFrame(() => this.setDates());
      }
      this.hoverEmitter.emit({ hoverDate });
    }
  };

  private readonly handleMouseLeave = (): void => {
    const hadInternalHover = this.internalHoverDate !== null;
    this.internalHoverDate = null;

    if (!this.waitsForEnd()) {
      return;
    }

    if (hadInternalHover) {
      requestAnimationFrame(() => this.setDates());
    }

    if (this.hoverDate !== null && this.hoverDate !== '') {
      this.hoverEmitter.emit({ hoverDate: null });
    }
  };

  /**
   * The date previewed on hover: a `hover-date` set by a parent wins over the cell hovered in
   * this calendar, so that the parent can spread the preview across several visible calendars.
   */
  private resolveHoverDate(): string | null {
    if (this.hoverDate !== null && this.hoverDate !== '') {
      return this.hoverDate;
    }

    return this.internalHoverDate;
  }

  /**
   * The end the next click picks: the one the parent names in `active-end`, the start while the
   * range has none, and otherwise the end, then a new range, as two clicks alternate.
   */
  private resolveActiveEnd(): CalendarRangeEndType | 'new' {
    if (!isSet(this.internalStartDate)) return 'start';
    if (this.activeEnd === 'start' || this.activeEnd === 'end') return this.activeEnd;
    return isSet(this.internalEndDate) ? 'new' : 'end';
  }

  /**
   * The range a click on `day` leaves. Criterion (#341, decided with vittorio on 2026-11-11): a
   * click changes the end being picked and never puts the range backwards, nor swaps its ends.
   * Picking the end, a day before the start becomes the new start and the end is still to pick.
   * Picking the start, a day after the end becomes the new start and the end is emptied, the
   * symmetric case: the day clicked is the one the user wants, and it can only be a start.
   */
  private nextRange(day: DateTime): { start: string; end: string | null } {
    const clicked = day.toISODate() as string;
    const start = this.internalStartDate as string;
    const end = isSet(this.internalEndDate) ? this.internalEndDate : null;

    switch (this.resolveActiveEnd()) {
      case 'end':
        return day < toDay(start) ? { start: clicked, end: null } : { start, end: clicked };
      case 'start':
        return end !== null && day > toDay(end)
          ? { start: clicked, end: null }
          : { start: clicked, end };
      default:
        return { start: clicked, end: null };
    }
  }

  private updateDates(): void {
    this.updateCalendar().then(() => {
      requestAnimationFrame(() => this.setDates());
    });
  }

  private async updateCalendar(): Promise<void> {
    try {
      const startOfWeek = this.currentDate.startOf('week');
      this.weekdays = Array.from({ length: 7 }).map((_, index) =>
        startOfWeek.setLocale(preferenceStore.state.language).plus({ days: index }).toFormat('ccc'),
      );
      this.calculateWeekDaysInMonth();
      this.currentMonth = this.currentDate
        .setLocale(preferenceStore.state.language)
        .toFormat('MMMM');
      this.currentMonthNumber = this.currentDate.month;
      this.currentYear = this.currentDate.toFormat('yyyy');
    } catch (error) {
      console.error('Error while updating the calendar:', error);
    }
  }

  /**
   * Draws the selection on the day cells. A chosen day, either end of a range or the day of a
   * single picker, is `start`, `end` or `single` with no `preview`; the days between the ends are
   * `middle`. While a range waits for its end, the day under the pointer is previewed: when a
   * click there would pick the end, the band from the start to that day is drawn as a `preview`,
   * the start still drawn as chosen; when it would pick a new start, that day alone is a
   * `single` `preview` and the start keeps its mark.
   */
  private setDates(): void {
    const shadowRoot = this.host?.shadowRoot;
    if (!shadowRoot) return;

    const markOf = this.singlePicker ? this.singleMark : this.rangeMark();

    shadowRoot.querySelectorAll('mds-calendar-cell').forEach((cell) => {
      const date = cell.getAttribute('date');
      const mark = date !== null && date !== '' ? markOf(date) : null;

      if (mark === null) {
        cell.removeAttribute('selection');
        cell.removeAttribute('preview');
        return;
      }

      cell.setAttribute('selection', mark.selection);
      if (mark.preview) cell.setAttribute('preview', 'true');
      else cell.removeAttribute('preview');
    });
  }

  private readonly singleMark = (date: string): CellMark | null =>
    date === this.internalStartDate ? { selection: 'single', preview: false } : null;

  private rangeMark(): (date: string) => CellMark | null {
    const start = this.internalStartDate;
    const end = this.internalEndDate;

    if (!isSet(start)) return () => null;

    if (isSet(end)) {
      return (date) => {
        if (date === start) return { selection: date === end ? 'single' : 'start', preview: false };
        if (date === end) return { selection: 'end', preview: false };
        return date > start && date < end ? { selection: 'middle', preview: false } : null;
      };
    }

    const hovered = this.resolveHoverDate();
    const hover = hovered !== null ? DateTime.fromISO(hovered).toISODate() : null;

    if (hover === null || hover === start) {
      return (date) => (date === start ? { selection: 'single', preview: false } : null);
    }

    // a click on the day under the pointer would end the range there: preview the band
    if (this.resolveActiveEnd() === 'end' && hover > start) {
      return (date) => {
        if (date === start) return { selection: 'start', preview: true };
        if (date === hover) return { selection: 'end', preview: true };
        return date > start && date < hover ? { selection: 'middle', preview: true } : null;
      };
    }

    // it would make that day the new start: preview it alone, the start keeps its mark
    return (date) => {
      if (date === start) return { selection: 'single', preview: false };
      return date === hover ? { selection: 'single', preview: true } : null;
    };
  }

  private changeMonth(delta: number): void {
    this.currentDate = this.currentDate.plus({ months: delta });
    this.updateCalendar().then(() => {
      requestAnimationFrame(() => this.setDates());
    });
    this.navigationEmitter.emit({
      currentDate: this.currentDate.toISODate(),
      delta,
    });
  }

  private readonly handleMonthActionClick = (event: MouseEvent): void => {
    event.stopPropagation();

    if (this.disableMonthYearSelection) {
      event.preventDefault();
      return;
    }

    this.currentView = this.currentView === 'months' ? 'calendar' : 'months';
    requestAnimationFrame(() => {
      this.updateCalendar().then(() => this.setDates());
    });
  };

  private readonly handleYearActionClick = (event: MouseEvent): void => {
    event.stopPropagation();

    if (this.disableMonthYearSelection) {
      event.preventDefault();
      return;
    }

    this.currentView = this.currentView === 'years' ? 'calendar' : 'years';
    requestAnimationFrame(() => {
      this.updateCalendar().then(() => this.setDates());
    });
  };

  private calculateWeekDaysInMonth(): void {
    const startOfMonth = this.currentDate.startOf('month');
    const endOfMonth = this.currentDate.endOf('month');
    const allDays: { date: DateTime; isCurrentMonth: boolean }[] = [];

    const startWeekday = startOfMonth.weekday;
    const daysFromPrevMonth = startWeekday - 1;
    const startOfPrevMonth = startOfMonth.minus({ days: daysFromPrevMonth });

    for (let day = startOfPrevMonth; day < startOfMonth; day = day.plus({ days: 1 })) {
      allDays.push({ date: day, isCurrentMonth: false });
    }

    for (let day = startOfMonth; day <= endOfMonth; day = day.plus({ days: 1 })) {
      allDays.push({ date: day, isCurrentMonth: true });
    }

    const endWeekday = endOfMonth.weekday;
    const daysFromNextMonth = 7 - endWeekday;
    const startOfNextMonth = endOfMonth.plus({ days: 1 });

    for (
      let day = startOfNextMonth;
      day < startOfNextMonth.plus({ days: daysFromNextMonth });
      day = day.plus({ days: 1 })
    ) {
      allDays.push({ date: day, isCurrentMonth: false });
    }

    this.weekDaysinMonth = allDays;
  }

  /**
   * Picks an end of the range with a click on `day`, as `nextRange` decides, and redraws it: a
   * standalone calendar has no parent echoing the range through start-date / end-date, so
   * nothing else would mark the two ends. The preview left by the pointer is dropped with the
   * old range: it starts again from the next day the pointer reaches.
   */
  private handleRange(day: DateTime): void {
    const { start, end } = this.nextRange(day);
    this.internalStartDate = start;
    this.internalEndDate = end;
    this.internalHoverDate = null;
    requestAnimationFrame(() => this.setDates());

    if (end === null) {
      this.datesEmitter.emit({ startDate: start });
      return;
    }

    this.datesEmitter.emit({ startDate: start, endDate: end });
    this.checkPreselectionsEmitter.emit();
  }

  private handleSingleSelection(day: DateTime): void {
    this.internalStartDate = day.toISODate();
    requestAnimationFrame(() => this.setDates());
    this.datesEmitter.emit({ startDate: this.internalStartDate as string });
  }

  private handlePrev = (event: PointerEvent) => {
    if (this.currentView === 'calendar') {
      event.stopPropagation();
      this.changeMonth(-1);
    } else if (this.currentView === 'years') {
      event.stopPropagation();
      this.selectedYear -= 10;
    } else {
      event.stopPropagation();
    }
  };

  private handleNext = (event: PointerEvent) => {
    if (this.currentView === 'calendar') {
      event.stopPropagation();
      this.changeMonth(1);
    } else if (this.currentView === 'years') {
      event.stopPropagation();
      this.selectedYear += 10;
    } else {
      event.stopPropagation();
    }
  };

  private isDateDisabled(date: DateTime): boolean | undefined {
    if (this.min !== null && this.min !== '' && date < DateTime.fromISO(this.min)) {
      return true;
    }
    if (this.max !== null && this.max !== '' && date > DateTime.fromISO(this.max)) {
      return true;
    }
    return undefined;
  }

  private readonly handleCellClick =
    (dayInfo: DateTime) =>
    (event: MouseEvent): void => {
      event.stopPropagation();
      if (this.singlePicker) this.handleSingleSelection(dayInfo);
      else this.handleRange(dayInfo);
    };

  private readonly handleMonthSelect =
    (month: number) =>
    (event: MouseEvent): void => {
      event.stopPropagation();
      this.currentDate = this.currentDate.set({ month });
      this.currentMonth = this.currentDate.toFormat('MMMM');
      this.currentView = 'calendar';
      this.updateCalendar().then(() => {
        requestAnimationFrame(() => this.setDates());
      });
    };

  private readonly handleYearSelect =
    (year: number) =>
    (event: MouseEvent): void => {
      event.stopPropagation();
      this.currentDate = this.currentDate.set({ year });
      this.currentYear = year.toString();
      this.currentView = 'calendar';
      this.updateCalendar().then(() => {
        requestAnimationFrame(() => this.setDates());
      });
    };

  render() {
    return (
      <Host>
        <div
          class={clsx(
            'calendar-preselection',
            this.hasPreselection &&
              !this.hidePreselection &&
              'calendar-preselection--has-preselection',
          )}
        >
          <slot name="preselection" onSlotchange={this.updatePreselection}></slot>
        </div>
        <div class="calendar-view">
          {/* named after the month it shows: two calendars side by side are two navigation
              landmarks, which need a name each (#341) */}
          <nav aria-label={`${this.currentMonth} ${this.currentYear}`}>
            {!this.hidePreviousButton && (
              <mds-button
                aria-label={this.t.get(
                  this.currentView === 'years' ? 'previousYears' : 'previousMonth',
                )}
                class="action-back"
                // the months view has nothing to move back or forward to
                disabled={this.currentView === 'months'}
                icon={miBaselineBackIosNew}
                variant="dark"
                tone="text"
                onClick={this.handlePrev}
              ></mds-button>
            )}
            <div class="select-month-or-year">
              {(this.currentView === 'calendar' || this.currentView === 'months') && (
                <mds-button
                  class="action-month"
                  truncate="none"
                  variant="dark"
                  tone="text"
                  label={this.currentMonth}
                  onClick={this.handleMonthActionClick}
                ></mds-button>
              )}
              {(this.currentView === 'calendar' || this.currentView === 'years') && (
                <mds-button
                  class="action-year"
                  truncate="none"
                  variant="dark"
                  tone="text"
                  label={this.currentYear}
                  onClick={this.handleYearActionClick}
                ></mds-button>
              )}
            </div>
            {!this.hideNextButton && (
              <mds-button
                aria-label={this.t.get(this.currentView === 'years' ? 'nextYears' : 'nextMonth')}
                class="action-forward"
                disabled={this.currentView === 'months'}
                icon={miBaselineForwardIos}
                variant="dark"
                tone="text"
                onClick={this.handleNext}
              ></mds-button>
            )}
          </nav>
          {this.currentView === 'calendar' && (
            <section class="month-view">
              <header class="month-view__days-names">
                {this.weekdays.map((day) => (
                  <mds-button
                    class="week-day-name"
                    variant="dark"
                    tone="text"
                    label={day}
                  ></mds-button>
                ))}
              </header>
              <div class="month-view__cells">
                {this.weekDaysinMonth.map((dayInfo, index) => (
                  <mds-calendar-cell
                    key={index}
                    today={
                      !this.hideToday &&
                      DateTime.now().toFormat('yyyy-MM-dd') === dayInfo.date.toFormat('yyyy-MM-dd')
                    }
                    date={dayInfo.date.toFormat('yyyy-MM-dd')}
                    month={dayInfo.isCurrentMonth ? 'current' : 'other'}
                    disabled={this.isDateDisabled(dayInfo.date)}
                    onClick={this.handleCellClick(dayInfo.date)}
                    title={dayInfo.date
                      .setLocale(preferenceStore.state.language)
                      .toFormat('cccc d LLLL')
                      .replace(/^./, (char) => char.toUpperCase())}
                    label={dayInfo.date.toFormat('dd')}
                  ></mds-calendar-cell>
                ))}
              </div>
            </section>
          )}

          {this.currentView === 'months' && (
            <section class="month-selection">
              <header class="month-view__month-names">
                {Array.from({ length: 12 }).map((_, index) => {
                  const monthName = DateTime.local()
                    .set({ month: index + 1 })
                    .setLocale(preferenceStore.state.language)
                    .toFormat('MMMM');
                  return (
                    <mds-button
                      class="action"
                      variant="dark"
                      tone="text"
                      label={monthName}
                      onClick={this.handleMonthSelect(index + 1)}
                    ></mds-button>
                  );
                })}
              </header>
            </section>
          )}

          {this.currentView === 'years' && (
            <section class="year-selection">
              <header class="month-view__years">
                {Array.from({ length: 12 }).map((_, index) => {
                  const year = this.selectedYear + index;
                  return (
                    <mds-button
                      class="action"
                      variant="dark"
                      tone="text"
                      label={`${year}`}
                      onClick={this.handleYearSelect(year)}
                    ></mds-button>
                  );
                })}
              </header>
            </section>
          )}
        </div>
      </Host>
    );
  }
}

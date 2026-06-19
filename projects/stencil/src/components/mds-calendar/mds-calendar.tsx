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
import { Locale } from '@common/locale';
import { ISO8601Date } from '@type/date';
import { sanitizeISO8601Date } from '@common/date';
import clsx from 'clsx';

@Component({
  tag: 'mds-calendar',
  styleUrl: 'mds-calendar.css',
  shadow: true,
})
export class MdsCalendar {
  @Element() private host: HTMLMdsCalendarElement;

  @State() hasPreselection: boolean = false;
  @State() currentDate: DateTime = DateTime.now();
  @State() weekDaysinMonth: DateTime[] = [];
  @State() weekdays: string[] = [];
  @State() startDateIdentifier: string | null = null;
  @State() endDateIdentifier: string | null = null;
  @State() isFirstClick: boolean = true;
  @State() currentView: 'calendar' | 'years' | 'months' = 'calendar';
  @State() selectedYear: number = this.currentDate.year;

  private readonly t: Locale = new Locale({
    it: {},
    en: {},
    es: {},
    el: {},
  });
  @State() language: string;
  @Method()
  async updateLang(): Promise<void> {
    this.language = this.t.lang(this.host);
  }

  @Prop() readonly rangePicker: boolean = true;

  /**
   * Shows the previous navigation button in the calendar header.
   */
  @Prop() readonly showPreviousButton: boolean = true;

  /**
   * Shows the next navigation button in the calendar header.
   */
  @Prop() readonly showNextButton: boolean = true;

  /**
   * Disables switching to month or year selection views from the calendar header.
   */
  @Prop() readonly disableMonthYearSelection: boolean = false;

  /**
   * Shows the preselection area above the calendar view.
   */
  @Prop() readonly showPreselection: boolean = false;

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

  @Event({ eventName: 'mdsCalendarChange' }) datesEmitter: EventEmitter<{
    startDate: string;
    endDate?: string;
  }>;
  @Event({ eventName: 'mdsCalendarNavigate' }) navigationEmitter: EventEmitter<{
    currentDate: string;
    delta: number;
  }>;
  @Event({ eventName: 'mdsCalendarHover' }) hoverEmitter: EventEmitter<{
    hoverDate: string | null;
  }>;
  @Event({ eventName: 'mdsCalendarPreselect' }) checkPreselectionsEmitter: EventEmitter<void>;

  @Watch('startDate')
  handleStartDate(newValue: ISO8601Date | null): void {
    if (newValue !== null && newValue !== '') {
      this.internalStartDate = sanitizeISO8601Date(newValue?.toString()) as ISO8601Date;
      this.startDateTime = DateTime.fromISO(this.internalStartDate);
      this.startDateIdentifier = this.startDateTime.toISODate();

      if (this.internalEndDate) {
        const endDateTime = DateTime.fromISO(this.internalEndDate);

        if (this.startDateTime > endDateTime) {
          console.warn('startDate is after endDate, swapping values');
          return;
        }
      } else if (this.rangePicker) {
        this.isFirstClick = false;
      }

      this.updateDates();
    } else if (newValue === null || newValue === '') {
      this.internalStartDate = null;
      this.startDateIdentifier = null;
      this.startDateTime = null;
      this.isFirstClick = true;
      this.updateDates();
    }
  }

  @Watch('endDate')
  handleEndDate(newValue: ISO8601Date | null): void {
    if (!this.rangePicker) {
      console.warn('rangePicker is disabled, endDate cannot be set');
      this.internalEndDate = null;
    } else if (newValue !== null && newValue !== '') {
      this.internalEndDate = sanitizeISO8601Date(newValue?.toString()) as ISO8601Date;
      this.endDateTime = DateTime.fromISO(this.internalEndDate);
      this.endDateIdentifier = this.endDateTime.toISODate();

      if (this.internalStartDate) {
        const startDateTime = DateTime.fromISO(this.internalStartDate);

        if (startDateTime > this.endDateTime) {
          console.warn('startDate is after endDate, swapping values');
          return;
        }
      }

      this.updateDates();
    } else if (newValue === null || newValue === '') {
      this.internalEndDate = null;
      this.endDateIdentifier = null;
      this.endDateTime = null;
      this.updateDates();
    }
  }

  @Watch('viewDate')
  handleViewDate(newValue: ISO8601Date | null): void {
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
  handleHoverDate(): void {
    requestAnimationFrame(() => this.setDates());
  }

  startDateTime: DateTime;
  endDateTime: DateTime;

  @State() currentMonth: string = '';
  currentMonthNumber!: number;
  @State() currentYear: string = '';

  componentWillLoad(): void {
    this.language = this.t.lang(this.host);

    if (this.viewDate) {
      const viewDate = DateTime.fromISO(this.viewDate.toString());

      if (viewDate.isValid) {
        this.currentDate = viewDate;
      }
    } else if (this.internalStartDate) {
      this.internalStartDate = sanitizeISO8601Date(
        this.internalStartDate?.toString(),
      ) as ISO8601Date;
      this.startDateTime = DateTime.fromISO(this.internalStartDate);
      if (this.startDateTime.isValid) {
        this.currentDate = this.startDateTime;
      }
    }

    if (this.internalEndDate) {
      this.internalEndDate = sanitizeISO8601Date(this.internalEndDate?.toString()) as ISO8601Date;
      this.endDateTime = DateTime.fromISO(this.internalEndDate);
    }

    this.updateCalendar();
  }

  componentDidLoad(): void {
    this.hasPreselection =
      this.host?.querySelector('.date-preselection--has-preselection') !== null;

    this.host?.shadowRoot?.addEventListener('mouseover', this.handleMouseOver);
    this.host?.shadowRoot?.addEventListener('mouseleave', this.handleMouseLeave);

    this.setDates();
  }

  disconnectedCallback(): void {
    this.host?.shadowRoot?.removeEventListener('mouseover', this.handleMouseOver);
    this.host?.shadowRoot?.removeEventListener('mouseleave', this.handleMouseLeave);
  }

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

  private readonly handleMouseOver = (event: Event): void => {
    const target = event.target as HTMLElement;

    if (
      !target.matches('mds-calendar-cell') ||
      !this.rangePicker ||
      !this.internalStartDate ||
      this.internalEndDate
    ) {
      return;
    }

    const hoverDate = target.getAttribute('date');
    if (hoverDate) {
      this.hoverEmitter.emit({ hoverDate });
    }
  };

  private readonly handleMouseLeave = (): void => {
    if (!this.rangePicker || !this.internalStartDate || this.internalEndDate || !this.hoverDate) {
      return;
    }

    this.hoverEmitter.emit({ hoverDate: null });
  };

  private updateDates(): void {
    this.updateCalendar().then(() => {
      requestAnimationFrame(() => this.setDates());
    });
  }

  async updateCalendar(): Promise<void> {
    try {
      const startOfWeek = this.currentDate.startOf('week');
      this.weekdays = Array.from({ length: 7 }).map((_, index) =>
        startOfWeek.setLocale(this.language).plus({ days: index }).toFormat('ccc'),
      );
      this.calculateWeekDaysInMonth();
      this.currentMonth = this.currentDate.setLocale(this.language).toFormat('MMMM');
      this.currentMonthNumber = this.currentDate.month;
      this.currentYear = this.currentDate.toFormat('yyyy');
    } catch (error) {
      console.error('Error while updating the calendar:', error);
    }
  }

  setDates(): void {
    const calendar: HTMLMdsCalendarElement = this.host;
    if (!calendar) return;

    const { shadowRoot } = calendar;

    if (!shadowRoot) return;

    const calendarCells = shadowRoot.querySelectorAll(
      'mds-calendar-cell[selection], mds-calendar-cell[preview]',
    );

    if (this.rangePicker) {
      if (this.hoverDate && !this.internalEndDate) {
        this.setHoverSelection(calendarCells, shadowRoot);
      } else {
        this.setRangeSelection(calendarCells, shadowRoot);
      }
    } else {
      this.setSingleSelection(calendarCells, shadowRoot);
    }
  }
  private clearSelectionState(calendarCells: NodeListOf<Element>): void {
    calendarCells.forEach((day) => {
      day.removeAttribute('selection');
      day.removeAttribute('preview');
    });
  }

  private setRangeSelection(calendarCells: NodeListOf<Element>, shadowRoot: ShadowRoot): void {
    this.clearSelectionState(calendarCells);

    if (!this.internalStartDate) return;

    this.startDateTime = DateTime.fromISO(this.internalStartDate.toString());

    if (!this.internalEndDate) {
      this.startDateIdentifier = this.startDateTime.toISODate();
      this.isFirstClick = false;

      const cells = shadowRoot.querySelectorAll('mds-calendar-cell');
      cells.forEach((cell) => {
        if (cell.getAttribute('date') === this.startDateTime.toFormat('yyyy-MM-dd')) {
          cell.setAttribute('selection', 'single');
          cell.setAttribute('preview', 'true');
        }
      });
      return;
    }

    this.endDateTime = DateTime.fromISO(this.internalEndDate.toString());
    this.startDateIdentifier = this.startDateTime.toISODate();
    this.endDateIdentifier = this.endDateTime.toISODate();

    const cells = shadowRoot.querySelectorAll('mds-calendar-cell');
    if (cells) {
      let isBetweenDates: boolean;

      for (let i = 0; i < cells.length; i++) {
        const cellDate = cells[i].getAttribute('date');

        if (cellDate) {
          const currentDate = DateTime.fromISO(cellDate);

          if (currentDate.toFormat('yyyy-MM-dd') === this.startDateTime.toFormat('yyyy-MM-dd')) {
            cells[i].setAttribute('selection', 'start');
          }

          if (currentDate.toFormat('yyyy-MM-dd') === this.endDateTime.toFormat('yyyy-MM-dd')) {
            if (this.startDateTime.equals(this.endDateTime)) {
              cells[i].setAttribute('selection', 'single');
            } else {
              cells[i].setAttribute('selection', 'end');
            }
          }

          isBetweenDates = currentDate > this.startDateTime && currentDate < this.endDateTime;
          if (isBetweenDates) {
            cells[i].setAttribute('selection', 'middle');
          }
        }
      }
    }
  }

  private setHoverSelection(calendarCells: NodeListOf<Element>, shadowRoot: ShadowRoot): void {
    this.clearSelectionState(calendarCells);

    if (!this.internalStartDate || !this.hoverDate) {
      this.setRangeSelection(calendarCells, shadowRoot);
      return;
    }

    const startDate = DateTime.fromISO(this.internalStartDate);
    const hoverDate = DateTime.fromISO(this.hoverDate);

    if (!startDate.isValid || !hoverDate.isValid) {
      this.setRangeSelection(calendarCells, shadowRoot);
      return;
    }

    const isForwardSelection = startDate <= hoverDate;
    const cells = Array.from(
      shadowRoot.querySelectorAll('mds-calendar-cell'),
    ) as HTMLMdsCalendarCellElement[];

    cells.forEach((cell) => {
      const cellDateString = cell.getAttribute('date');
      if (!cellDateString) return;

      const cellDate = DateTime.fromISO(cellDateString);
      if (!cellDate.isValid) return;

      const isInRange = isForwardSelection
        ? cellDate >= startDate && cellDate <= hoverDate
        : cellDate >= hoverDate && cellDate <= startDate;

      if (!isInRange) return;

      cell.setAttribute('preview', 'true');

      let selectionType = 'middle';
      if (startDate.equals(hoverDate) && cellDate.equals(startDate)) {
        selectionType = 'single';
      } else if (cellDate.equals(startDate)) {
        selectionType = isForwardSelection ? 'start' : 'end';
      } else if (cellDate.equals(hoverDate)) {
        selectionType = isForwardSelection ? 'end' : 'start';
      }

      cell.setAttribute('selection', selectionType);
    });
  }

  private setSingleSelection(calendarCells: NodeListOf<Element>, shadowRoot: ShadowRoot) {
    this.clearSelectionState(calendarCells);

    if (!this.internalStartDate) return;

    this.startDateTime = DateTime.fromISO(this.internalStartDate.toString());
    const cells = shadowRoot.querySelectorAll('mds-calendar-cell');

    if (cells) {
      for (let i = 0; i < cells.length; i++) {
        const cellDate = cells[i].getAttribute('date');

        if (cellDate) {
          const currentDate = DateTime.fromISO(cellDate);

          if (currentDate.toFormat('yyyy-MM-dd') === this.startDateTime.toFormat('yyyy-MM-dd')) {
            cells[i].setAttribute('selection', 'single');
          }
        }
      }
    }
  }

  changeMonth(delta: number): void {
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

  calculateWeekDaysInMonth(): void {
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

  private handleRange(element: HTMLElement, dayInfo: DateTime): void {
    const pendingStartDate = this.startDate || this.host.getAttribute('start-date');

    if (
      this.rangePicker &&
      pendingStartDate &&
      !this.endDate &&
      !this.internalEndDate &&
      this.isFirstClick
    ) {
      this.internalStartDate = sanitizeISO8601Date(pendingStartDate.toString()) as ISO8601Date;
      this.startDateTime = DateTime.fromISO(this.internalStartDate);
      this.startDateIdentifier = this.startDateTime.toISODate();
      this.isFirstClick = false;
    }

    const resetSelection = (): void => {
      this.internalStartDate = null;
      this.internalEndDate = null;
      this.startDateIdentifier = null;
      this.startDateTime = null;
      this.endDateIdentifier = null;
      this.endDateTime = null;
      this.isFirstClick = true;

      const calendar: HTMLMdsCalendarElement = this.host;
      requestAnimationFrame(() => {
        calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell[selection]').forEach((day) => {
          day.removeAttribute('selection');
          day.removeAttribute('preview');
        });
      });
    };

    if (this.startDateIdentifier && this.endDateIdentifier) {
      resetSelection();
    }

    if (this.isFirstClick) {
      this.startDateIdentifier = dayInfo.toISODate();
      this.startDateTime = dayInfo;
      this.internalStartDate = this.startDateTime.toISO().split('T')[0];
      this.isFirstClick = false;
      const calendar: HTMLMdsCalendarElement = this.host;

      requestAnimationFrame(() => {
        calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell[selection]').forEach((day) => {
          day.removeAttribute('selection');
        });
      });

      requestAnimationFrame(() => {
        element.setAttribute('selection', 'single');
        element.setAttribute('preview', 'true');
      });

      this.datesEmitter.emit({ startDate: this.internalStartDate as string });

      return;
    }

    const calendar: HTMLMdsCalendarElement = this.host;
    const mdsCalendarCellElements = calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell');
    const startDateElementIndex = Array.from(mdsCalendarCellElements ?? []).findIndex(
      (cell: HTMLMdsCalendarCellElement) => cell.getAttribute('date') === this.startDateIdentifier,
    );
    const elementIndex = Array.from(mdsCalendarCellElements ?? []).indexOf(
      element as HTMLMdsCalendarCellElement,
    );

    if (
      this.startDateIdentifier &&
      DateTime.fromISO(this.startDateIdentifier) <
        DateTime.fromISO(element.getAttribute('date') as string)
    ) {
      this.endDateIdentifier = element.getAttribute('date');
      this.endDateTime = dayInfo;
      this.internalEndDate = this.endDateTime.toISO().split('T')[0];
    } else {
      this.endDateIdentifier = this.startDateIdentifier;
      this.endDateTime = this.startDateTime;
      this.internalEndDate = this.internalStartDate;
      this.startDateIdentifier = element.getAttribute('date');
      this.startDateTime = dayInfo;
      this.internalStartDate = this.startDateTime.toISO().split('T')[0];
    }

    calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell[preview]').forEach((day) => {
      day.removeAttribute('preview');
    });

    if (mdsCalendarCellElements && startDateElementIndex !== -1) {
      for (let i = startDateElementIndex + 1; i < elementIndex; i++) {
        mdsCalendarCellElements[i].setAttribute('selection', 'middle');
      }
    }

    if (this.internalStartDate && this.internalEndDate) {
      this.datesEmitter.emit({ startDate: this.internalStartDate, endDate: this.internalEndDate });
      this.checkPreselectionsEmitter.emit();
    }
  }

  private handleSingleSelection(element: HTMLElement, dayInfo: DateTime): void {
    const calendar: HTMLMdsCalendarElement = this.host;

    calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell[selection]').forEach((day) => {
      day.removeAttribute('selection');
    });
    this.startDateIdentifier = element.getAttribute('date');
    this.startDateTime = dayInfo;
    this.internalStartDate = this.startDateTime.toISO().split('T')[0];
    this.isFirstClick = false;
    element.setAttribute('selection', 'single');

    if (this.internalStartDate) {
      this.datesEmitter.emit({ startDate: this.internalStartDate });
    }
  }

  render() {
    return (
      <Host>
        <div
          class={clsx(
            'calendar-preselection',
            (this.showPreselection || this.hasPreselection) &&
              'calendar-preselection--has-preselection',
          )}
        >
          <slot name="preselection"></slot>
        </div>
        <div class="calendar-view">
          <nav>
            {this.showPreviousButton && (
              <mds-button
                class="action-back"
                icon={miBaselineBackIosNew}
                variant="dark"
                tone="text"
                onClick={(event) => {
                  if (this.currentView === 'calendar') {
                    event.stopPropagation();
                    this.changeMonth(-1);
                  } else if (this.currentView === 'years') {
                    event.stopPropagation();
                    this.selectedYear -= 10;
                  } else {
                    event.stopPropagation();
                  }
                }}
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
            {this.showNextButton && (
              <mds-button
                class="action-forward"
                icon={miBaselineForwardIos}
                variant="dark"
                tone="text"
                onClick={(event) => {
                  if (this.currentView === 'calendar') {
                    event.stopPropagation();
                    this.changeMonth(1);
                  } else if (this.currentView === 'years') {
                    event.stopPropagation();
                    this.selectedYear += 10;
                  } else {
                    event.stopPropagation();
                  }
                }}
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
                      DateTime.now().toFormat('yyyy-MM-dd') === dayInfo.date.toFormat('yyyy-MM-dd')
                    }
                    date={dayInfo.date.toFormat('yyyy-MM-dd')}
                    month={dayInfo.isCurrentMonth ? 'current' : 'other'}
                    disabled={(() => {
                      if (
                        this.min &&
                        this.min !== '' &&
                        dayInfo.date < DateTime.fromISO(this.min)
                      ) {
                        return true;
                      }
                      if (
                        this.max &&
                        this.max !== '' &&
                        dayInfo.date > DateTime.fromISO(this.max)
                      ) {
                        return true;
                      }
                      return undefined;
                    })()}
                    onClick={(event) => {
                      event.stopPropagation();
                      const target = event.currentTarget as HTMLElement;
                      if (this.rangePicker) this.handleRange(target, dayInfo.date);
                      else this.handleSingleSelection(target, dayInfo.date);
                    }}
                    title={dayInfo.date
                      .setLocale(this.language)
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
                    .setLocale(this.language)
                    .toFormat('MMMM');
                  return (
                    <mds-button
                      class="action"
                      variant="dark"
                      tone="text"
                      label={monthName}
                      onClick={(event) => {
                        event.stopPropagation();
                        this.currentDate = this.currentDate.set({ month: index + 1 });
                        this.currentMonth = this.currentDate.toFormat('MMMM');
                        this.currentView = 'calendar';
                        this.updateCalendar().then(() => {
                          requestAnimationFrame(() => this.setDates());
                        });
                      }}
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
                      onClick={(event) => {
                        event.stopPropagation();
                        this.currentDate = this.currentDate.set({ year });
                        this.currentYear = year.toString();
                        this.currentView = 'calendar';
                        this.updateCalendar().then(() => {
                          requestAnimationFrame(() => this.setDates());
                        });
                      }}
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

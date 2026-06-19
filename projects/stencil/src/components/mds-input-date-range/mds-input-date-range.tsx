import {
  Component,
  Element,
  Host,
  h,
  Prop,
  State,
  Event,
  EventEmitter,
  Method,
  Watch,
  AttachInternals,
} from '@stencil/core';
import miBaselineCalendarToday from '@icon/mi/baseline/calendar-today.svg';
import { DateTime } from 'luxon';
import clsx from 'clsx';
import { Locale } from '@common/locale';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

export interface EventDate {
  caller: HTMLMdsInputDateRangePreselectionElement;
  start: string;
  end?: string;
}

/**
 * @slot calendar-preselection - Add `HTML elements` or `components` to this slot.
 * @slot start - Add `HTML elements` or `components` to this slot.
 * @slot end - Add `HTML elements` or `components` to this slot.
 */
@Component({
  tag: 'mds-input-date-range',
  styleUrl: 'mds-input-date-range.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInputDateRange {
  @Element() host: HTMLMdsInputDateRangeElement;
  @AttachInternals() internals: ElementInternals;

  @State() calendarKey: number = 0;
  @State() internalStartDate: string = '';
  @State() internalEndDate: string = '';
  @State() visibleCalendarDate: string = '';
  @State() dropdownRef?: HTMLMdsDropdownElement;
  @State() hasPreselection: boolean = false;
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });
  @State() language: string;
  /**
   * Updates the component's texts to the locale currently set on the host element.
   */
  @Method()
  async updateLang(): Promise<void> {
    this.language = this.t.lang(this.host);
  }

  /**
   * Specifies the start date of the range
   * @description It's in ISO format (YYYY-MM-DD).
   */
  @Prop({ reflect: true }) startDate: string = '';

  /**
   * Specifies the end date of the range
   * @description It's in ISO format (YYYY-MM-DD).
   */
  @Prop({ reflect: true }) endDate: string = '';

  /**
   * Specifies the min date of the range, user cannot set dates before this date
   * @description It's in ISO format (YYYY-MM-DD).
   */
  @Prop({ reflect: true }) min: string | null = null;

  /**
   * Specifies the max date of the range, user cannot set dates after this date
   * @description It's in ISO format (YYYY-MM-DD).
   */
  @Prop({ reflect: true }) max: string | null = null;

  /**
   * Specifies the delay in milliseconds before closing the calendar dropdown, if the value is 0 the dropdown will not close
   * @description Default is 500
   */
  @Prop({ reflect: true }) readonly delay: number = 500;

  /**
   * Enables the linked dual-calendar range picker behavior.
   */
  @Prop({ reflect: true }) readonly dualCalendar: boolean = false;

  /**
   * Is needed to reference the form data after the form is submitted
   */
  @Prop({ reflect: true }) readonly name?: string;

  private togglePreselection: HTMLMdsInputDateRangePreselectionElement[];
  private lastEmittedStartDate: string | null = null;
  private lastEmittedEndDate: string | null = null;
  private initialStartDate: string = '';
  private initialEndDate: string = '';
  private hoveredCalendarDate: string | null = null;
  private syncingInputSlots: Set<'start' | 'end'> = new Set();

  private getCalendars(): HTMLMdsCalendarElement[] {
    return Array.from(this.host.shadowRoot?.querySelectorAll('mds-calendar') ?? []);
  }

  private resolveVisibleCalendarDate(startDate?: string, endDate?: string): string {
    const initialDates = [startDate, endDate]
      .map((value) => DateTime.fromISO(value ?? ''))
      .filter((date) => date.isValid);

    const initialVisibleDate = initialDates[0] ?? DateTime.now();
    return initialVisibleDate.startOf('month').toISODate();
  }

  private getCalendarViewDate(monthOffset: number = 0): string {
    const visibleCalendarDate = DateTime.fromISO(this.visibleCalendarDate);
    const startDate = DateTime.fromISO(this.internalStartDate);
    let baseDate = DateTime.now();

    if (visibleCalendarDate.isValid) {
      baseDate = visibleCalendarDate;
    } else if (startDate.isValid) {
      baseDate = startDate;
    }

    return baseDate.startOf('month').plus({ months: monthOffset }).toISODate();
  }

  private setVisibleCalendarDate(date: string): void {
    const visibleCalendarDate = DateTime.fromISO(date);

    if (visibleCalendarDate.isValid) {
      this.visibleCalendarDate = visibleCalendarDate.startOf('month').toISODate();
    }
  }

  private closeDropdownAfterSelection(): void {
    if (this.delay === 0) return;
    const { dropdownRef } = this;

    if (dropdownRef) {
      setTimeout(() => {
        dropdownRef.visible = false;
      }, this.delay);
    }
  }

  private syncCalendarsSelectionAttributes(): void {
    this.host.shadowRoot?.querySelectorAll('mds-calendar').forEach((calendar) => {
      if (this.internalStartDate !== '') {
        calendar.setAttribute('start-date', this.internalStartDate);
      } else {
        calendar.removeAttribute('start-date');
      }

      if (this.internalEndDate !== '') {
        calendar.setAttribute('end-date', this.internalEndDate);
      } else {
        calendar.removeAttribute('end-date');
      }
    });

    this.syncCalendarsHoverAttributes();
  }

  private syncCalendarsHoverAttributes(): void {
    this.host.shadowRoot?.querySelectorAll('mds-calendar').forEach((calendar) => {
      if (this.hoveredCalendarDate !== null && this.hoveredCalendarDate !== '') {
        calendar.setAttribute('hover-date', this.hoveredCalendarDate);
      } else {
        calendar.removeAttribute('hover-date');
      }
    });
  }

  private clearHoverPreview(): void {
    if (this.hoveredCalendarDate === null) return;

    this.hoveredCalendarDate = null;
    this.syncCalendarsHoverAttributes();
  }

  /**
   * Emitted when the selected start or end date changes.
   */
  @Event({ eventName: 'mdsInputDateRangeValueChange' }) valueChanged: EventEmitter<{
    startDate: string;
    endDate: string;
  }>;

  private getEmittableDateRangeDetail(): { startDate: string; endDate: string } | null {
    const startDate = DateTime.fromISO(this.internalStartDate);
    const endDate = DateTime.fromISO(this.internalEndDate);

    if (!startDate.isValid || !endDate.isValid) {
      return null;
    }

    return {
      startDate: this.internalStartDate,
      endDate: this.internalEndDate,
    };
  }

  private emitValueChanged(): boolean {
    const detail = this.getEmittableDateRangeDetail();

    if (!detail) return false;

    if (
      detail.startDate === this.lastEmittedStartDate &&
      detail.endDate === this.lastEmittedEndDate
    ) {
      return false;
    }

    this.valueChanged.emit(detail);
    this.lastEmittedStartDate = detail.startDate;
    this.lastEmittedEndDate = detail.endDate;
    return true;
  }

  @Watch('startDate')
  handleStartDateChange(newValue: string): void {
    this.syncExternalDate('start', newValue);
  }

  @Watch('endDate')
  handleEndDateChange(newValue: string): void {
    this.syncExternalDate('end', newValue);
  }

  componentWillLoad(): void {
    this.language = this.t.lang(this.host);
    this.internalStartDate = this.startDate;
    this.internalEndDate = this.endDate;
    this.initialStartDate = this.startDate;
    this.initialEndDate = this.endDate;
    this.visibleCalendarDate = this.resolveVisibleCalendarDate(
      this.internalStartDate,
      this.internalEndDate,
    );

    // Se max è precedente a min, imposto max uguale a min
    if (this.min !== null && this.min !== '' && this.max !== null && this.max !== '') {
      const minDate = DateTime.fromISO(this.min);
      const maxDate = DateTime.fromISO(this.max);
      if (maxDate < minDate) {
        this.max = this.min;
      }
    }
    this.syncFormValue();
  }

  disconnectedCallback(): void {
    this.host.removeEventListener('focusout', this.handleFocusOut);
    this.host.shadowRoot?.removeEventListener(
      'mdsCalendarHover',
      this.handleCalendarHover as EventListener,
    );
  }

  /**
   * Applies the given preselection range to the input.
   * @param event the preselection range to apply
   */
  @Method() async preselect(event: EventDate): Promise<void> {
    if (this.togglePreselection == null) {
      this.togglePreselection = Array.from(
        this.host.querySelectorAll('mds-input-date-range-preselection'),
      );
    }

    this.togglePreselection.forEach((element: HTMLMdsInputDateRangePreselectionElement) => {
      element.selected = false;
    });

    event.caller.selected = true;
    this.clearHoverPreview();

    const startDate = DateTime.fromISO(event.start);

    if (startDate.isValid) {
      this.internalStartDate = event.start;
      this.setVisibleCalendarDate(this.internalStartDate);
      this.updateInputValue('start', this.internalStartDate);
    }

    if (event.end !== undefined) {
      const endDate = DateTime.fromISO(event.end);
      if (endDate.isValid) {
        this.internalEndDate = event.end;
      }
    } else {
      this.internalEndDate = event.start;
    }
    this.updateInputValue('end', this.internalEndDate);
    this.syncFormValue();

    const calendars = this.getCalendars();

    if (calendars.length !== 0) {
      await Promise.all(
        calendars.map((calendar, index) =>
          calendar.updateCurrentDate(this.getCalendarViewDate(index)),
        ),
      );
      this.closeDropdownAfterSelection();
    }

    this.emitValueChanged();
    return Promise.resolve();
  }

  private handleFocusOut = (event: FocusEvent) => {
    if (!this.host.contains(event.relatedTarget as Node)) {
      const startValid = DateTime.fromISO(this.internalStartDate).isValid;
      const endValid = DateTime.fromISO(this.internalEndDate).isValid;

      if (startValid && endValid) {
        this.validateDateRange();
        this.syncFormValue();
        this.checkPreselections();
        this.emitValueChanged();
      }
    }
  };

  private focusInput = (element: HTMLMdsInputDateElement): void => {
    element.focusInput();
  };

  private focusDateInput = (ev: MouseEvent): void => {
    if (ev.target !== this.host) {
      return;
    }
    this.focusStartDateInput(ev);
  };

  private focusStartDateInput = (ev: MouseEvent): void => {
    ev.preventDefault();
    ev.stopPropagation();
    this.focusInput(
      this.host.querySelector('mds-input-date[slot="start"]') as HTMLMdsInputDateElement,
    );
  };

  private focusEndDateInput = (ev: MouseEvent): void => {
    ev.preventDefault();
    ev.stopPropagation();
    this.focusInput(
      this.host.querySelector('mds-input-date[slot="end"]') as HTMLMdsInputDateElement,
    );
  };

  componentDidLoad(): void {
    this.updateInputListeners();
    this.updateInputValue('start', this.internalStartDate);
    this.updateInputValue('end', this.internalEndDate);
    this.syncFormValue();
    this.host.addEventListener('focusout', this.handleFocusOut);
    this.host.shadowRoot?.addEventListener(
      'mdsCalendarHover',
      this.handleCalendarHover as EventListener,
    );
  }

  formResetCallback(): void {
    this.clearHoverPreview();
    this.internalStartDate = this.initialStartDate;
    this.internalEndDate = this.initialEndDate;
    this.visibleCalendarDate = this.resolveVisibleCalendarDate(
      this.initialStartDate,
      this.initialEndDate,
    );
    this.updateInputValue('start', this.internalStartDate);
    this.updateInputValue('end', this.internalEndDate);
    this.checkPreselections();
    this.syncFormValue();
  }

  private syncExternalDate(slotName: 'start' | 'end', newValue: string): void {
    const normalizedValue = newValue ?? '';
    this.clearHoverPreview();

    if (slotName === 'start') {
      if (normalizedValue === this.internalStartDate) return;
      this.internalStartDate = normalizedValue;
      this.setVisibleCalendarDate(this.internalStartDate);
    } else {
      if (normalizedValue === this.internalEndDate) return;
      this.internalEndDate = normalizedValue;
    }

    this.validateDateRange();
    this.updateInputValue('start', this.internalStartDate);
    this.updateInputValue('end', this.internalEndDate);
    this.checkPreselections();
    this.syncFormValue();
  }

  private updateInputValue(slotName: 'start' | 'end', newValue: string): void {
    const slot = this.host.shadowRoot?.querySelector(`slot[name="${slotName}"]`) as HTMLSlotElement;
    const input = slot?.assignedElements()[0] as HTMLMdsInputDateElement;
    if (input != null) {
      this.syncingInputSlots.add(slotName);
      input.setValue(newValue).finally(() => {
        requestAnimationFrame(() => {
          this.syncingInputSlots.delete(slotName);
        });
      });
    }
  }

  private updateInputListeners(): void {
    const startSlot = this.host.shadowRoot?.querySelector('slot[name="start"]') as HTMLSlotElement;
    const endSlot = this.host.shadowRoot?.querySelector('slot[name="end"]') as HTMLSlotElement;
    this.hasPreselection = this.host.querySelector('mds-input-date-range-preselection') !== null;

    if (startSlot != null) {
      const input = startSlot.assignedElements()[0] as HTMLMdsInputDateElement;
      input.addEventListener(
        'mdsInputDateSelect',
        this.createFocusoutListener('start') as EventListener,
      );
    }

    if (endSlot != null) {
      const input = endSlot.assignedElements()[0] as HTMLMdsInputDateElement;
      input.addEventListener(
        'mdsInputDateSelect',
        this.createFocusoutListener('end') as EventListener,
      );
    }
  }

  private createFocusoutListener(slotName: 'start' | 'end'): EventListener {
    return (ev: CustomEvent) => {
      if (this.syncingInputSlots.has(slotName)) {
        return;
      }

      const event = ev;
      this.clearHoverPreview();

      if (slotName === 'start') {
        this.internalStartDate = event.detail;
        this.setVisibleCalendarDate(this.internalStartDate);
      } else {
        this.internalEndDate = event.detail;
      }
      this.syncFormValue();
    };
  }

  private validateDateRange(): void {
    if (this.internalStartDate !== '' && this.internalEndDate !== '') {
      const start = DateTime.fromISO(this.internalStartDate);
      const end = DateTime.fromISO(this.internalEndDate);

      if (end < start) {
        this.internalEndDate = this.internalStartDate;
        this.updateInputValue('end', this.internalEndDate);
      }
    }
  }

  private checkPreselections(): void {
    const preselections = Array.from(
      this.host.querySelectorAll('mds-input-date-range-preselection'),
    );

    if (preselections != null) {
      preselections.forEach((element) => {
        const preselection = element;

        const isSameRange =
          preselection.start === this.internalStartDate &&
          preselection.end === this.internalEndDate;

        const isSingleDayMatch =
          preselection.start === this.internalStartDate &&
          this.internalStartDate === this.internalEndDate &&
          preselection.end === undefined;

        if (isSameRange || isSingleDayMatch) {
          preselection.selected = true;
        } else {
          preselection.selected = false;
        }
      });
    }
  }

  private handleCalendarHover = (ev: CustomEvent<{ hoverDate: string | null }>): void => {
    if (this.internalStartDate === '' || this.internalEndDate !== '') {
      this.clearHoverPreview();
      return;
    }

    const nextHoverDate = ev.detail.hoverDate;

    if (this.hoveredCalendarDate === nextHoverDate) return;

    this.hoveredCalendarDate = nextHoverDate;
    this.syncCalendarsHoverAttributes();
  };

  private handleCalendarChange = (ev: CustomEvent<{ startDate: string; endDate?: string }>) => {
    this.clearHoverPreview();
    this.internalStartDate = ev.detail.startDate;
    this.updateInputValue('start', this.internalStartDate);

    if (ev.detail.endDate !== undefined && ev.detail.endDate !== '') {
      this.internalEndDate = ev.detail.endDate;
      this.updateInputValue('end', this.internalEndDate);
    } else {
      this.internalEndDate = '';
      this.updateInputValue('end', this.internalEndDate);
    }

    this.syncFormValue();
    this.syncCalendarsSelectionAttributes();

    if (this.internalStartDate !== '' && this.internalEndDate !== '') {
      this.emitValueChanged();
      this.closeDropdownAfterSelection();
    }
  };

  private handleCalendarNavigate = (ev: CustomEvent<{ currentDate: string }>) => {
    if (!this.dualCalendar) return;

    const calendars = this.getCalendars();
    const calendarIndex = calendars.indexOf(ev.target as HTMLMdsCalendarElement);
    const currentDate = DateTime.fromISO(ev.detail.currentDate);

    if (!currentDate.isValid) return;

    this.visibleCalendarDate = currentDate
      .minus({ months: calendarIndex === 1 ? 1 : 0 })
      .startOf('month')
      .toISODate();
  };

  private renderCalendarPreselectionPanel() {
    if (!this.hasPreselection) return null;

    return (
      <div class="calendar-preselection-panel">
        <div
          class={clsx(
            'date-preselection',
            this.hasPreselection && 'date-preselection--has-preselection',
          )}
        >
          <slot name="calendar-preselection"></slot>
        </div>
      </div>
    );
  }

  private renderSingleCalendar() {
    return (
      <div class="calendar-single">
        {this.renderCalendarPreselectionPanel()}
        <mds-calendar
          lang={this.language}
          key={this.calendarKey}
          rangePicker={true}
          onMdsCalendarChange={this.handleCalendarChange}
          onMdsCalendarPreselect={() => {
            this.checkPreselections();
          }}
          startDate={this.internalStartDate}
          endDate={this.internalEndDate}
          {...(this.min !== null && this.min !== '' ? { min: this.min } : {})}
          {...(this.max !== null && this.max !== '' ? { max: this.max } : {})}
        ></mds-calendar>
      </div>
    );
  }

  private renderDualCalendars() {
    return (
      <div class="calendars">
        {this.renderCalendarPreselectionPanel()}
        <mds-calendar
          lang={this.language}
          key={`${this.calendarKey}-start`}
          rangePicker={true}
          showNextButton={false}
          disableMonthYearSelection={true}
          viewDate={this.getCalendarViewDate()}
          onMdsCalendarNavigate={this.handleCalendarNavigate}
          onMdsCalendarChange={this.handleCalendarChange}
          onMdsCalendarPreselect={() => {
            this.checkPreselections();
          }}
          startDate={this.internalStartDate}
          endDate={this.internalEndDate}
          {...(this.min !== null && this.min !== '' ? { min: this.min } : {})}
          {...(this.max !== null && this.max !== '' ? { max: this.max } : {})}
        ></mds-calendar>
        <mds-calendar
          lang={this.language}
          key={`${this.calendarKey}-end`}
          rangePicker={true}
          showPreviousButton={false}
          disableMonthYearSelection={true}
          viewDate={this.getCalendarViewDate(1)}
          onMdsCalendarNavigate={this.handleCalendarNavigate}
          onMdsCalendarChange={this.handleCalendarChange}
          onMdsCalendarPreselect={() => {
            this.checkPreselections();
          }}
          startDate={this.internalStartDate}
          endDate={this.internalEndDate}
          {...(this.min !== null && this.min !== '' ? { min: this.min } : {})}
          {...(this.max !== null && this.max !== '' ? { max: this.max } : {})}
        ></mds-calendar>
      </div>
    );
  }

  render() {
    return (
      <Host onClick={this.focusDateInput}>
        <div class="inputs">
          <div class="input-element">
            <mds-text class="date-label" typography="detail" onClick={this.focusStartDateInput}>
              {this.t.get('from')}
            </mds-text>
            <div class="input-wrapper">
              <slot name="start"></slot>
            </div>
          </div>
          <div class="input-element">
            <mds-text class="date-label" typography="detail" onClick={this.focusEndDateInput}>
              {this.t.get('to')}
            </mds-text>
            <div class="input-wrapper">
              <slot name="end"></slot>
            </div>
          </div>
        </div>
        <div class="action-open-calendar-wrapper">
          <mds-button
            class="action-open-calendar"
            variant="dark"
            tone="text"
            icon={miBaselineCalendarToday}
            id="calendar-dropdown"
            onClick={() => {
              this.calendarKey += 1;
            }}
          ></mds-button>
        </div>

        <mds-dropdown
          ref={(el) => (this.dropdownRef = el as HTMLMdsDropdownElement)}
          target="#calendar-dropdown"
          auto-placement={false}
          placement="bottom-end"
        >
          {this.dualCalendar ? this.renderDualCalendars() : this.renderSingleCalendar()}
        </mds-dropdown>
      </Host>
    );
  }

  private syncFormValue(): void {
    const startDate = this.internalStartDate?.trim() ?? '';
    const endDate = this.internalEndDate?.trim() ?? '';

    if (startDate === '' && endDate === '') {
      this.internals.setFormValue(null);
      return;
    }

    this.internals.setFormValue(JSON.stringify({ startDate, endDate }));
  }
}

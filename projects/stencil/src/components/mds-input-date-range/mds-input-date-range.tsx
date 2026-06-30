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
import { subscribePreference } from '@common/preference';
import localeEl from './meta/locale.el.json';
import localeEn from './meta/locale.en.json';
import localeEs from './meta/locale.es.json';
import localeIt from './meta/locale.it.json';

export interface EventDate {
  caller: HTMLMdsInputDateRangePreselectionElement;
  start: string;
  end?: string;
}

@Component({
  tag: 'mds-input-date-range',
  styleUrl: 'mds-input-date-range.css',
  formAssociated: true,
  shadow: true,
})
export class MdsInputDateRange {
  @Element() host: HTMLMdsInputDateRangeElement;
  @State() prefAnimation?: string;
  private unsubscribePrefAnimation?: () => void;
  @State() prefContrast?: string;
  private unsubscribePrefContrast?: () => void;
  @State() prefTheme?: string;
  private unsubscribePrefTheme?: () => void;
  @State() prefThemeScheme?: string;
  private unsubscribePrefThemeScheme?: () => void;
  @AttachInternals() internals: ElementInternals;

  @State() calendarKey: number = 0;
  @State() internalStartDate: string = '';
  @State() internalEndDate: string = '';
  @State() dropdownRef?: HTMLMdsDropdownElement;
  @State() hasPreselection: boolean = false;
  private t: Locale = new Locale({
    el: localeEl,
    en: localeEn,
    es: localeEs,
    it: localeIt,
  });
  @State() language: string;
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
   * Is needed to reference the form data after the form is submitted
   */
  @Prop({ reflect: true }) readonly name?: string;

  private togglePreselection: HTMLMdsInputDateRangePreselectionElement[];
  private lastEmittedStartDate: string | null = null;
  private lastEmittedEndDate: string | null = null;
  private initialStartDate: string = '';
  private initialEndDate: string = '';

  @Event({ eventName: 'mdsInputDateRangeSelect' }) dateRangeSelected: EventEmitter<{
    startDate: string;
    endDate: string;
  }>;
  @Event({ eventName: 'mdsInputDateRangeValueChange' }) valueChanged: EventEmitter<{
    startDate: string;
    endDate: string;
  }>;

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

    // Se max è precedente a min, imposto max uguale a min
    if (this.min && this.max) {
      const minDate = DateTime.fromISO(this.min);
      const maxDate = DateTime.fromISO(this.max);
      if (maxDate < minDate) {
        this.max = this.min;
      }
    }
    this.syncFormValue();
  }

  connectedCallback(): void {
    this.unsubscribePrefAnimation = subscribePreference('animation', (value) => {
      this.prefAnimation = value;
    });
    this.unsubscribePrefContrast = subscribePreference('contrast', (value) => {
      this.prefContrast = value;
    });
    this.unsubscribePrefTheme = subscribePreference('theme', (value) => {
      this.prefTheme = value;
    });
    this.unsubscribePrefThemeScheme = subscribePreference('theme-scheme', (value) => {
      this.prefThemeScheme = value;
    });
  }

  disconnectedCallback(): void {
    this.unsubscribePrefAnimation?.();
    this.unsubscribePrefContrast?.();
    this.unsubscribePrefTheme?.();
    this.unsubscribePrefThemeScheme?.();
    this.host.removeEventListener('focusout', this.handleFocusOut);
  }

  @Method() async preselect(event: EventDate): Promise<void> {
    if (!this.togglePreselection) {
      this.togglePreselection = Array.from(
        this.host.querySelectorAll('mds-input-date-range-preselection'),
      );
    }

    this.togglePreselection.forEach((element: HTMLMdsInputDateRangePreselectionElement) => {
      element.selected = false;
    });

    event.caller.selected = true;

    const startDate = DateTime.fromISO(event.start);

    if (startDate.isValid) {
      this.internalStartDate = event.start;
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

    const calendar = this.host?.shadowRoot?.querySelector('mds-calendar');

    if (calendar) {
      await calendar.updateCurrentDate(this.internalStartDate);
      if (this.delay === 0) return;
      const { dropdownRef } = this;
      if (dropdownRef) {
        setTimeout(() => {
          dropdownRef.visible = false;
        }, this.delay);
      }
    }

    this.dateRangeSelected.emit({
      startDate: this.internalStartDate,
      endDate: this.internalEndDate,
    });
    return Promise.resolve();
  }

  private handleFocusOut = (event: FocusEvent) => {
    if (!this.host.contains(event.relatedTarget as Node)) {
      const startValid = DateTime.fromISO(this.internalStartDate).isValid;
      const endValid = DateTime.fromISO(this.internalEndDate).isValid;

      if (startValid && endValid) {
        this.validateDateRange();
        this.syncFormValue();

        this.dateRangeSelected.emit({
          startDate: this.internalStartDate,
          endDate: this.internalEndDate,
        });

        this.checkPreselections();
      }

      if (
        this.internalStartDate !== this.lastEmittedStartDate ||
        this.internalEndDate !== this.lastEmittedEndDate
      ) {
        this.valueChanged.emit({
          startDate: this.internalStartDate,
          endDate: this.internalEndDate,
        });
        this.lastEmittedStartDate = this.internalStartDate;
        this.lastEmittedEndDate = this.internalEndDate;
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
  }

  formResetCallback(): void {
    this.internalStartDate = this.initialStartDate;
    this.internalEndDate = this.initialEndDate;
    this.updateInputValue('start', this.internalStartDate);
    this.updateInputValue('end', this.internalEndDate);
    this.checkPreselections();
    this.syncFormValue();
  }

  private syncExternalDate(slotName: 'start' | 'end', newValue: string): void {
    const normalizedValue = newValue ?? '';

    if (slotName === 'start') {
      if (normalizedValue === this.internalStartDate) return;
      this.internalStartDate = normalizedValue;
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

  private updateInputValue(slotName: string, newValue: string): void {
    const slot = this.host.shadowRoot?.querySelector(`slot[name="${slotName}"]`) as HTMLSlotElement;
    const input = slot?.assignedElements()[0] as HTMLMdsInputDateElement;
    if (input) {
      input.setValue(newValue);
    }
  }

  private updateInputListeners(): void {
    const startSlot = this.host.shadowRoot?.querySelector('slot[name="start"]') as HTMLSlotElement;
    const endSlot = this.host.shadowRoot?.querySelector('slot[name="end"]') as HTMLSlotElement;
    this.hasPreselection = this.host.querySelector('mds-input-date-range-preselection') !== null;

    if (startSlot) {
      const input = startSlot.assignedElements()[0] as HTMLMdsInputDateElement;
      input.addEventListener(
        'mdsInputDateSelect',
        this.createFocusoutListener('start') as EventListener,
      );
    }

    if (endSlot) {
      const input = endSlot.assignedElements()[0] as HTMLMdsInputDateElement;
      input.addEventListener(
        'mdsInputDateSelect',
        this.createFocusoutListener('end') as EventListener,
      );
    }
  }

  private createFocusoutListener(slotName: 'start' | 'end'): EventListener {
    return (ev: CustomEvent) => {
      const event = ev;

      if (slotName === 'start') {
        this.internalStartDate = event.detail;
      } else {
        this.internalEndDate = event.detail;
      }
      this.syncFormValue();
    };
  }

  private validateDateRange(): void {
    if (this.internalStartDate && this.internalEndDate) {
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

    if (preselections) {
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

  render() {
    return (
      <Host
        onClick={this.focusDateInput}
        pref-animation={this.prefAnimation}
        pref-contrast={this.prefContrast}
        pref-theme={this.prefTheme}
        pref-theme-scheme={this.prefThemeScheme}
      >
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
          <mds-calendar
            lang={this.language}
            key={this.calendarKey}
            rangePicker={true}
            onMdsCalendarChange={(ev) => {
              this.internalStartDate = ev.detail.startDate;
              this.updateInputValue('start', this.internalStartDate);
              if (ev.detail.endDate) {
                this.internalEndDate = ev.detail.endDate;
                this.updateInputValue('end', this.internalEndDate);
              }
              this.syncFormValue();

              if (this.internalStartDate && this.internalEndDate) {
                this.dateRangeSelected.emit({
                  startDate: this.internalStartDate,
                  endDate: this.internalEndDate,
                });
                if (this.delay === 0) return;
                const { dropdownRef } = this;
                if (dropdownRef) {
                  setTimeout(() => {
                    dropdownRef.visible = false;
                  }, this.delay);
                }
              }
            }}
            onMdsCalendarPreselect={() => {
              this.checkPreselections();
            }}
            startDate={this.internalStartDate}
            endDate={this.internalEndDate}
            {...(this.min ? { min: this.min } : {})}
            {...(this.max ? { max: this.max } : {})}
          >
            <div
              slot="preselection"
              class={clsx(
                'date-preselection',
                this.hasPreselection && 'date-preselection--has-preselection',
              )}
            >
              <slot name="calendar-preselection"></slot>
            </div>
          </mds-calendar>
        </mds-dropdown>
      </Host>
    );
  }

  private syncFormValue(): void {
    const startDate = this.internalStartDate?.trim() ?? '';
    const endDate = this.internalEndDate?.trim() ?? '';

    if (!startDate && !endDate) {
      this.internals.setFormValue(null);
      return;
    }

    this.internals.setFormValue(JSON.stringify({ startDate, endDate }));
  }
}

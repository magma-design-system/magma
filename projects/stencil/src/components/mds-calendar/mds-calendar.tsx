import { Component, Host, Method, Prop, State, h, Element, Watch, EventEmitter, Event } from '@stencil/core'
import miBaselineForwardIos from '@icon/mi/baseline/arrow-forward-ios.svg'
import miBaselineBackIosNew from '@icon/mi/baseline/arrow-back-ios-new.svg'
import { DateTime } from 'luxon'
import { Locale } from '@common/locale'
import { ISO8601Date } from '@type/date'
import { sanitizeISO8601Date } from '@common/date'
import clsx from 'clsx'

@Component({
  tag: 'mds-calendar',
  styleUrl: 'mds-calendar.css',
  shadow: true,
})
export class MdsCalendar {
  @Element() private host: HTMLMdsCalendarElement

  @State() hasPreselection: boolean = false
  @State() currentDate: DateTime = DateTime.now()
  @State() weekDaysinMonth: DateTime[] = []
  @State() weekdays: string[] = []
  @State() startDateIdentifier: string | null = null
  @State() endDateIdentifier: string | null = null
  @State() isFirstClick: boolean = true
  @State() currentView: 'calendar' | 'years' | 'months' = 'calendar'
  @State() selectedYear: number = this.currentDate.year

  private readonly t: Locale = new Locale({
    it: {},
    en: {},
    es: {},
    el: {},
  })
  @State() language: string
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.host)
  }

  @Prop() readonly rangePicker: boolean = true

  /**
   * Specifies the start date of the selection
   * @description It's in ISO format (YYYY-MM-DD).
   * @example '2023-10-01'
   */
  @Prop({ reflect: true }) readonly startDate: string | null = null

  /**
   * Specifies the end date of the selection
   * @description It's in ISO format (YYYY-MM-DD).
   * @example '2023-10-01'
   */
  @Prop({ reflect: true }) readonly endDate: string | null = null

  /**
   * Specifies the minimum date of the selection
   * @description It's in ISO format (YYYY-MM-DD).
   * @example '2023-10-01'
   */
  @Prop({ reflect: true }) readonly min: string | null = null

  /**
   * Specifies the minimum date of the selection
   * @description It's in ISO format (YYYY-MM-DD).
   * @example '2023-10-01'
   */
  @Prop({ reflect: true }) readonly max: string | null = null

  @State() internalStartDate: string | null = this.startDate
  @State() internalEndDate: string | null = this.endDate

  @Event({ eventName: 'mdsCalendarChange' }) datesEmitter: EventEmitter<{startDate: string, endDate?: string}>
  @Event({ eventName: 'mdsCalendarPreselect' }) checkPreselectionsEmitter: EventEmitter<void>

  @Watch('startDate')
  handleStartDate (newValue: ISO8601Date | null): void {
    if (newValue !== null && newValue !== '') {
      this.internalStartDate = sanitizeISO8601Date(newValue?.toString()) as ISO8601Date
      if (this.internalEndDate) {
        const startDateTime = DateTime.fromISO(this.internalStartDate)
        const endDateTime = DateTime.fromISO(this.internalEndDate)

        if (startDateTime > endDateTime) {
          console.warn('startDate is after endDate, swapping values')
          return
        }
      }

      this.updateDates()
    }
  }

  @Watch('endDate')
  handleEndDate (newValue: ISO8601Date | null): void {
    if (!this.rangePicker) {
      console.warn('rangePicker is disabled, endDate cannot be set')
      this.internalEndDate = null
    } else if (newValue !== null && newValue !== '') {
      this.internalEndDate = sanitizeISO8601Date(newValue?.toString()) as ISO8601Date

      if (this.internalStartDate) {
        const startDateTime = DateTime.fromISO(this.internalStartDate)
        const endDateTime = DateTime.fromISO(this.internalEndDate)

        if (startDateTime > endDateTime) {
          console.warn('startDate is after endDate, swapping values')
          return
        }
      }

      this.updateDates()
    }
  }

  startDateTime: DateTime
  endDateTime: DateTime

  currentMonth: string = ''
  currentMonthNumber!: number
  currentYear: string = ''

  componentWillLoad (): void {
    this.language = this.t.lang(this.host)

    if (this.internalStartDate) {
      this.internalStartDate = sanitizeISO8601Date(this.internalStartDate?.toString()) as ISO8601Date
      this.startDateTime = DateTime.fromISO(this.internalStartDate)
      if (this.startDateTime.isValid) {
        this.currentDate = this.startDateTime
      }
    }

    if (this.internalEndDate) {
      this.internalEndDate = sanitizeISO8601Date(this.internalEndDate?.toString()) as ISO8601Date
      this.endDateTime = DateTime.fromISO(this.internalEndDate)
    }

    this.updateCalendar()
  }

  componentDidLoad (): void {

    this.hasPreselection = this.host?.querySelector('.date-preselection--has-preselection') !== null

    this.host?.shadowRoot?.addEventListener('mouseover', event => {
      const target = event.target as HTMLElement
      if (target.matches('mds-calendar-cell') && this.startDateIdentifier && this.rangePicker) {
        this.handleHover(target)
      }
    })

    this.setDates()
  }

  componentWillUnload (): void {
    this.host?.shadowRoot?.removeEventListener('mouseover', event => {
      const target = event.target as HTMLElement
      if (target.matches('mds-calendar-cell') && this.startDateIdentifier && this.rangePicker) {
        this.handleHover(target)
      }
    })
  }

  @Method() async updateCurrentDate (date: string): Promise<void> {
    this.currentDate = DateTime.fromISO(date)
    return Promise.resolve()
  }

  private updateDates (): void {
    if (this.internalStartDate && this.internalEndDate && this.rangePicker) {
      this.updateCalendar().then(() => {
        requestAnimationFrame(() => this.setDates())
      })
    }

    else if (this.internalStartDate && !this.rangePicker) {
      this.updateCalendar().then(() => {
        requestAnimationFrame(() => this.setDates())
      })
    }
  }

  async updateCalendar (): Promise<void> {
    try {
      const startOfWeek = this.currentDate.startOf('week')
      this.weekdays = Array.from( { length: 7 } ).map((_, index) =>
        startOfWeek.setLocale(this.language).plus({ days: index }).toFormat('ccc'),
      )
      this.calculateWeekDaysInMonth()
      this.currentMonth = this.currentDate.setLocale(this.language).toFormat('MMMM')
      this.currentMonthNumber = this.currentDate.month
      this.currentYear = this.currentDate.toFormat('yyyy')
    }
    catch (error) {
      console.error('Error while updating the calendar:', error)
    }
  }

  setDates (): void {
    const calendar: HTMLMdsCalendarElement = this.host
    if (!calendar) return

    const { shadowRoot } = calendar

    if (!shadowRoot) return

    const calendarCells = shadowRoot.querySelectorAll('mds-calendar-cell[selection]')

    if (this.isFirstClick) {
      if (this.rangePicker) {
        this.setRangeSelection(calendarCells, shadowRoot)
      } else {
        this.setSingleSelection(calendarCells, shadowRoot)
      }
    }
  }
  private setRangeSelection (calendarCells: NodeListOf<Element>, shadowRoot: ShadowRoot): void {
    calendarCells.forEach(day => {
      day.removeAttribute('selection')
      day.removeAttribute('preview')
    })

    if (!this.internalStartDate || !this.internalEndDate) return

    this.startDateTime = DateTime.fromISO(this.internalStartDate.toString())
    this.endDateTime = DateTime.fromISO(this.internalEndDate.toString())

    const cells = shadowRoot.querySelectorAll('mds-calendar-cell')
    if (cells) {
      let isBetweenDates: boolean

      for (let i = 0; i < cells.length; i++) {
        const cellDate = cells[i].getAttribute('date')

        if (cellDate) {
          const currentDate = DateTime.fromISO(cellDate)

          if (currentDate.toFormat('yyyy-MM-dd') === this.startDateTime.toFormat('yyyy-MM-dd')) {
            cells[i].setAttribute('selection', 'start')
          }

          if (currentDate.toFormat('yyyy-MM-dd') === this.endDateTime.toFormat('yyyy-MM-dd')) {
            if (this.startDateTime.equals(this.endDateTime)) {
              cells[i].setAttribute('selection', 'single')
            } else {
              cells[i].setAttribute('selection', 'end')
            }
          }

          isBetweenDates = currentDate > this.startDateTime && currentDate < this.endDateTime
          if (isBetweenDates) {
            cells[i].setAttribute('selection', 'middle')
          }
        }
      }
    }
  }

  private setSingleSelection (calendarCells: NodeListOf<Element>, shadowRoot: ShadowRoot) {

    calendarCells.forEach(cell => {
      cell.removeAttribute('selection')
    })

    if (!this.internalStartDate) return

    this.startDateTime = DateTime.fromISO(this.internalStartDate.toString())
    const cells = shadowRoot.querySelectorAll('mds-calendar-cell')

    if (cells) {
      for (let i = 0; i < cells.length; i++) {
        const cellDate = cells[i].getAttribute('date')

        if (cellDate) {
          const currentDate = DateTime.fromISO(cellDate)

          if (currentDate.toFormat('yyyy-MM-dd') === this.startDateTime.toFormat('yyyy-MM-dd')) {
            cells[i].setAttribute('selection', 'single')
          }
        }
      }
    }
  }


  changeMonth (delta: number): void {
    this.currentDate = this.currentDate.plus({ months: delta })
    this.updateCalendar().then(() => {
      requestAnimationFrame(() => this.setDates())
    })
  }

  calculateWeekDaysInMonth (): void {
    const startOfMonth = this.currentDate.startOf('month')
    const endOfMonth = this.currentDate.endOf('month')
    const allDays: { date: DateTime, isCurrentMonth: boolean }[] = []

    const startWeekday = startOfMonth.weekday
    const daysFromPrevMonth = startWeekday - 1
    const startOfPrevMonth = startOfMonth.minus({ days: daysFromPrevMonth })

    for (let day = startOfPrevMonth; day < startOfMonth; day = day.plus({ days: 1 })) {
      allDays.push({ date: day, isCurrentMonth: false })
    }

    for (let day = startOfMonth; day <= endOfMonth; day = day.plus({ days: 1 })) {
      allDays.push({ date: day, isCurrentMonth: true })
    }

    const endWeekday = endOfMonth.weekday
    const daysFromNextMonth = 7 - endWeekday
    const startOfNextMonth = endOfMonth.plus({ days: 1 })

    for (let day = startOfNextMonth; day < startOfNextMonth.plus({ days: daysFromNextMonth }); day = day.plus({ days: 1 })) {
      allDays.push({ date: day, isCurrentMonth: false })
    }

    this.weekDaysinMonth = allDays
  }

  private handleRange (element: HTMLElement, dayInfo: DateTime): void {
    const resetSelection = (): void => {
      this.internalStartDate = null
      this.internalEndDate = null
      this.startDateIdentifier = null
      this.startDateTime = null
      this.endDateIdentifier = null
      this.endDateTime = null
      this.isFirstClick = true

      const calendar: HTMLMdsCalendarElement = this.host
      requestAnimationFrame(() => {
        calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell[selection]').forEach(day => {
          day.removeAttribute('selection')
          day.removeAttribute('preview')
        })
      })
    }

    if (this.startDateIdentifier && this.endDateIdentifier) {
      resetSelection()
    }

    if (this.isFirstClick) {
      this.startDateIdentifier = dayInfo.toISODate()
      this.startDateTime = dayInfo
      this.internalStartDate = this.startDateTime.toISO().split('T')[0]
      this.isFirstClick = false
      const calendar: HTMLMdsCalendarElement = this.host

      requestAnimationFrame(() => {
        calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell[selection]').forEach(day => {
          day.removeAttribute('selection')
        })
      })

      requestAnimationFrame(() => {
        element.setAttribute('selection', 'single')
        element.setAttribute('preview', 'true')
      })

      return
    }

    const calendar: HTMLMdsCalendarElement = this.host
    const mdsCalendarCellElements = calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell')
    const startDateElementIndex = Array.from(mdsCalendarCellElements ?? [])
      .findIndex((cell: HTMLMdsCalendarCellElement) => cell.getAttribute('date') === this.startDateIdentifier)
    const elementIndex = Array.from(mdsCalendarCellElements ?? []).indexOf(element as HTMLMdsCalendarCellElement)

    if ( this.startDateIdentifier && DateTime.fromISO(this.startDateIdentifier) < DateTime.fromISO(element.getAttribute('date') as string)) {
      this.endDateIdentifier = element.getAttribute('date')
      this.endDateTime = dayInfo
      this.internalEndDate = this.endDateTime.toISO().split('T')[0]
    } else {
      this.endDateIdentifier = this.startDateIdentifier
      this.endDateTime = this.startDateTime
      this.internalEndDate = this.internalStartDate
      this.startDateIdentifier = element.getAttribute('date')
      this.startDateTime = dayInfo
      this.internalStartDate = this.startDateTime.toISO().split('T')[0]
    }

    calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell[preview]').forEach(day => {
      day.removeAttribute('preview')
    })

    if (mdsCalendarCellElements && startDateElementIndex !== -1) {
      for (let i = startDateElementIndex + 1; i < elementIndex; i++) {
        mdsCalendarCellElements[i].setAttribute('selection', 'middle')
      }
    }

    if (this.internalStartDate && this.internalEndDate) {
      this.datesEmitter.emit({ startDate: this.internalStartDate, endDate: this.internalEndDate })
      this.checkPreselectionsEmitter.emit()
    }
  }

  private handleHover (element: HTMLElement): void {
    const typedElement = element as HTMLMdsCalendarCellElement
    const startDate = DateTime.fromISO(this.internalStartDate)

    if (!startDate.isValid || this.endDateIdentifier !== null) return

    const calendar = this.host as HTMLMdsCalendarElement
    const mdsCalendarCellElements = Array.from(calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell') ?? [])
    const hoveredDateStr = typedElement.getAttribute('date')

    if (!hoveredDateStr) return
    const hoveredDate = DateTime.fromISO(hoveredDateStr)
    if (!hoveredDate.isValid) return

    const startTypedElement = mdsCalendarCellElements.find(cell => cell.getAttribute('date') === this.internalStartDate)

    mdsCalendarCellElements.forEach(cell => {
      cell.removeAttribute('preview')
      cell.removeAttribute('selection')
    })

    typedElement.setAttribute('preview', 'true')

    const typedDateStr = typedElement.getAttribute('date')
    if (typedDateStr) {
      const typedDate = DateTime.fromISO(typedDateStr)
      if (typedDate.isValid && startTypedElement) {
        if (startDate < typedDate) {
          startTypedElement.setAttribute('selection', 'start')
        } else if (startDate > typedDate) {
          startTypedElement.setAttribute('selection', 'end')
          typedElement.setAttribute('selection', 'start')
        } else {
          typedElement.setAttribute('selection', 'single')
        }
      }
    }
    if (startDate.equals(hoveredDate)) {
      typedElement.setAttribute('selection', 'single')
    } else {

      const [start, end] = startDate < hoveredDate ? [startDate, hoveredDate] : [hoveredDate, startDate]

      mdsCalendarCellElements.forEach(cell => {
        const cellDateStr = cell.getAttribute('date')
        if (!cellDateStr) return

        const cellDate = DateTime.fromISO(cellDateStr)
        if (!cellDate.isValid) return

        if (cellDate >= start && cellDate <= end) {
          cell.setAttribute('preview', 'true')

          let selectionType = 'middle'
          if (cellDate.equals(start)) selectionType = 'start'
          if (cellDate.equals(end)) selectionType = 'end'

          cell.setAttribute('selection', selectionType)
        }
      })
    }
  }

  private handleSingleSelection (element: HTMLElement, dayInfo: DateTime): void {
    const calendar: HTMLMdsCalendarElement = this.host

    calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell[selection]').forEach(day => {
      day.removeAttribute('selection')
    })
    this.startDateIdentifier = element.getAttribute('date')
    this.startDateTime = dayInfo
    this.internalStartDate = this.startDateTime.toISO().split('T')[0]
    this.isFirstClick = false
    element.setAttribute('selection', 'single')

    if (this.internalStartDate) {
      this.datesEmitter.emit({ startDate: this.internalStartDate })
    }
  }

  render () {
    return (
      <Host>
        <div class={clsx('calendar-preselection', this.hasPreselection && 'calendar-preselection--has-preselection')}>
          <slot name="preselection"></slot>
        </div>
        <div class="calendar-view">
          <nav>
            <mds-button class="action-back" icon={miBaselineBackIosNew} variant="dark" tone="quiet" onClick={event => {
              if (this.currentView === 'calendar') {
                event.stopPropagation()
                this.changeMonth(-1)
              } else if (this.currentView === 'years') {
                event.stopPropagation()
                this.selectedYear -= 10
              } else {
                event.stopPropagation()
              }
            }}></mds-button>
            <div class="select-month-or-year">
              {(this.currentView === 'calendar' || this.currentView === 'months') && <mds-button class="action-month" variant="dark" tone="quiet" onClick={event => {
                event.stopPropagation()
                this.currentView = this.currentView === 'months' ? 'calendar' : 'months'
                requestAnimationFrame(() => {
                  this.updateCalendar().then(() => this.setDates())
                })

              }}>{this.currentMonth}</mds-button>}
              {(this.currentView === 'calendar' || this.currentView === 'years') && <mds-button class="action-year" variant="dark" tone="quiet" onClick={event => {
                event.stopPropagation()
                this.currentView = this.currentView === 'years' ? 'calendar' : 'years'
                requestAnimationFrame(() => {
                  this.updateCalendar().then(() => this.setDates())
                })
              }}>{this.currentYear}</mds-button>}

            </div>
            <mds-button class="action-forward" icon={miBaselineForwardIos} variant="dark" tone="quiet" onClick={event => {
              if (this.currentView === 'calendar') {
                event.stopPropagation()
                this.changeMonth(1)
              } else if (this.currentView === 'years') {
                event.stopPropagation()
                this.selectedYear += 10
              } else {
                event.stopPropagation()
              }
            }}></mds-button>
          </nav>
          {this.currentView === 'calendar' && (
            <section class="month-view">
              <header class="month-view__days-names">
                {this.weekdays.map(day => (
                  <mds-button class="week-day-name" variant="dark" tone="quiet">{day}</mds-button>
                ))}
              </header>
              <div class="month-view__cells">
                {this.weekDaysinMonth.map(dayInfo => (
                  <mds-calendar-cell
                    today={DateTime.now().toFormat('yyyy-MM-dd') === dayInfo.date.toFormat('yyyy-MM-dd')}
                    date={dayInfo.date.toFormat('yyyy-MM-dd')}
                    month={dayInfo.isCurrentMonth ? 'current' : 'other'}
                    disabled={
                      (() => {
                        if (this.min && this.min !== '' && dayInfo.date < DateTime.fromISO(this.min)) {
                          return true
                        }
                        if (this.max && this.max !== '' && dayInfo.date > DateTime.fromISO(this.max)) {
                          return true
                        }
                        return undefined
                      })()
                    }
                    onClick={event => {
                      event.stopPropagation()
                      const target = event.currentTarget as HTMLElement
                      this.rangePicker
                        ? this.handleRange(target, dayInfo.date)
                        : this.handleSingleSelection(target, dayInfo.date)
                    }}
                  >
                    {dayInfo.date.toFormat('dd')}
                  </mds-calendar-cell>
                ))}
              </div>
            </section>
          )}

          {this.currentView === 'months' && (
            <section class="month-selection">
              <header class="month-view__month-names">
                {Array.from({ length: 12 }).map((_, index) => {
                  const monthName = DateTime.local().set({ month: index + 1 }).setLocale(this.language).toFormat('MMMM')
                  return (
                    <mds-button class='action' variant='dark' tone='quiet' onClick={event => {
                      event.stopPropagation()
                      this.currentDate = this.currentDate.set({ month: index + 1 })
                      this.currentMonth = this.currentDate.toFormat('MMMM')
                      this.currentView = 'calendar'
                      this.updateCalendar().then(() => {
                        requestAnimationFrame(() => this.setDates())
                      })
                    }}>
                      {monthName}
                    </mds-button>
                  )
                })}
              </header>
            </section>
          )}

          {this.currentView === 'years' && (
            <section class="year-selection">
              <header class="month-view__years">

                {Array.from({ length: 12 }).map((_, index) => {
                  const year = this.selectedYear + index
                  return (
                    <mds-button class='action' variant='dark' tone='quiet' onClick={event => {
                      event.stopPropagation()
                      this.currentDate = this.currentDate.set({ year })
                      this.currentYear = year.toString()
                      this.currentView = 'calendar'
                      this.updateCalendar().then(() => {
                        requestAnimationFrame(() => this.setDates())
                      })
                    }}>
                      {year}
                    </mds-button>
                  )
                })}
              </header>
            </section>
          )}
        </div>
      </Host>
    )
  }
}

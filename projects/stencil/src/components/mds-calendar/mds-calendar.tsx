import { Component, Host, Method, Prop, State, h, Element, Watch, EventEmitter, Event } from '@stencil/core'
import miBaselineForwardIos from '@icon/mi/baseline/arrow-forward-ios.svg'
import miBaselineBackIosNew from '@icon/mi/baseline/arrow-back-ios-new.svg'
import { DateTime } from 'luxon'
import { Locale } from '@common/locale'
import { ISO8601Date } from '@type/date'
import { sanitizeISO8601Date } from '@common/date'

@Component({
  tag: 'mds-calendar',
  styleUrl: 'mds-calendar.css',
  shadow: true,
})
export class MdsCalendar {
  @Element() private host: HTMLMdsCalendarElement

  @State() currentDate: DateTime = DateTime.now()
  @State() weekDaysinMonth: DateTime[] = []
  @State() weekdays: string[] = []
  @State() startDateElement: HTMLElement | null = null
  @State() endDateElement: HTMLElement | null = null
  @State() previewElement: HTMLElement | null = null
  @State() isFirstClick: boolean = true
  @State() currentView: 'calendar' | 'years' | 'months' = 'calendar'
  @State() selectedYear: number = this.currentDate.year

  @Prop() rangePicker: boolean = true
  @Prop({ reflect: true, mutable: true }) startDate: string | null = null
  @Prop({ reflect: true, mutable: true }) endDate: string | null = null

  @Event() datesEmitter: EventEmitter<{startDate: string, endDate?: string}>

  @Watch('startDate')
  handleStartDate (newValue: ISO8601Date | null): void {
    if (newValue !== null && newValue !== '') {
      this.startDate = sanitizeISO8601Date(newValue?.toString()) as ISO8601Date
      if (this.endDate) {
        const startDateTime = DateTime.fromISO(this.startDate)
        const endDateTime = DateTime.fromISO(this.endDate)

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
      this.endDate = null
    } else if (newValue !== null && newValue !== '') {
      this.endDate = sanitizeISO8601Date(newValue?.toString()) as ISO8601Date

      if (this.startDate) {
        const startDateTime = DateTime.fromISO(this.startDate)
        const endDateTime = DateTime.fromISO(this.endDate)

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

    if (this.startDate) {
      this.startDate = sanitizeISO8601Date(this.startDate?.toString()) as ISO8601Date
      this.startDateTime = DateTime.fromISO(this.startDate)
      this.currentDate = this.startDateTime
    }

    if (this.endDate) {
      this.endDate = sanitizeISO8601Date(this.endDate?.toString()) as ISO8601Date
      this.endDateTime = DateTime.fromISO(this.endDate)
    }

    this.updateCalendar()
  }

  componentDidLoad (): void {
    this.host?.shadowRoot?.addEventListener('mouseover', event => {
      const target = event.target as HTMLElement
      if (target.matches('mds-calendar-cell') && this.startDateElement && this.rangePicker) {
        this.handleHover(target)
      }
    })

    this.setDates()
  }

  componentWillUnload (): void {
    this.host?.shadowRoot?.removeEventListener('mouseover', event => {
      const target = event.target as HTMLElement
      if (target.matches('mds-calendar-cell') && this.startDateElement && this.rangePicker) {
        this.handleHover(target)
      }
    })
  }

  private readonly t: Locale = new Locale()
  @State() language: string
  @Method()
  async updateLang (): Promise<void> {
    this.language = this.t.lang(this.host)
  }

  private updateDates (): void {
    if (this.startDate && this.endDate && this.rangePicker) {
      this.updateCalendar().then(() => {
        requestAnimationFrame(() => this.setDates())
      })
    }

    else if (this.startDate && !this.rangePicker) {
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

    if (this.rangePicker) {
      this.setRangeSelection(calendarCells, shadowRoot)
    } else {
      this.setSingleSelection(calendarCells, shadowRoot)
    }
  }

  private setRangeSelection (calendarCells: NodeListOf<Element>, shadowRoot: ShadowRoot): void {
    calendarCells.forEach(day => {
      day.removeAttribute('selection')
      day.removeAttribute('preview')
    })

    if (!this.startDate || !this.endDate) return

    this.startDateTime = DateTime.fromISO(this.startDate.toString())
    this.endDateTime = DateTime.fromISO(this.endDate.toString())

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

    if (!this.startDate) return

    this.startDateTime = DateTime.fromISO(this.startDate.toString())
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
      this.startDate = null
      this.endDate = null
      this.startDateElement = null
      this.startDateTime = null
      this.endDateElement = null
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

    if (this.startDateElement && this.endDateElement) {
      resetSelection()
    }

    if (this.isFirstClick) {
      this.startDateElement = element
      this.startDateTime = dayInfo
      this.startDate = this.startDateTime.toISO().split('T')[0]
      this.isFirstClick = false
      requestAnimationFrame(() => {
        element.setAttribute('selection', 'single')
        element.setAttribute('preview', 'true')
      })

      return
    }

    const calendar: HTMLMdsCalendarElement = this.host
    const mdsCalendarCellElements = calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell')
    const startDateElementIndex = Array.from(mdsCalendarCellElements ?? []).indexOf(this.startDateElement as HTMLMdsCalendarCellElement)
    const elementIndex = Array.from(mdsCalendarCellElements ?? []).indexOf(element as HTMLMdsCalendarCellElement)


    element.setAttribute('selection', 'end')
    if ( this.startDateElement && DateTime.fromISO(this.startDateElement.getAttribute('date') as string) < DateTime.fromISO(element.getAttribute('date') as string)) {
      this.endDateElement = element
      this.endDateTime = dayInfo
      this.endDate = this.endDateTime.toISO().split('T')[0]
    } else {
      this.endDateElement = this.startDateElement
      this.endDateTime = this.startDateTime
      this.endDate = this.startDate

      this.startDateElement = element
      this.startDateTime = dayInfo
      this.startDate = this.startDateTime.toISO().split('T')[0]
    }


    calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell[preview]').forEach(day => {
      day.removeAttribute('preview')
    })

    if (mdsCalendarCellElements) {
      for (let i = startDateElementIndex + 1; i < elementIndex; i++) {
        mdsCalendarCellElements[i].setAttribute('selection', 'middle')
      }
    }

    if (this.startDate && this.endDate) {
      this.datesEmitter.emit({ startDate: this.startDate, endDate: this.endDate })
    }

  }

  private handleHover (element: HTMLElement): void {
    const typedElement = element as HTMLMdsCalendarCellElement
    const startDate = DateTime.fromISO(this.startDate)

    if (!startDate.isValid || this.endDateElement !== null) return

    const calendar = this.host as HTMLMdsCalendarElement
    const mdsCalendarCellElements = Array.from(calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell') ?? [])
    const hoveredDateStr = typedElement.getAttribute('date')

    if (!hoveredDateStr) return
    const hoveredDate = DateTime.fromISO(hoveredDateStr)
    if (!hoveredDate.isValid) return

    const startTypedElement = mdsCalendarCellElements.find(cell => cell.getAttribute('date') === this.startDate)

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
          typedElement.setAttribute('selection', 'end')
        }
      }
    }

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

  private handleSingleSelection (element: HTMLElement, dayInfo: DateTime): void {
    const calendar: HTMLMdsCalendarElement = this.host

    calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell[selection]').forEach(day => {
      day.removeAttribute('selection')
    })
    this.startDateElement = element
    this.startDateTime = dayInfo
    this.startDate = this.startDateTime.toISO().split('T')[0]
    this.isFirstClick = false
    element.setAttribute('selection', 'single')

    if (this.startDate) {
      this.datesEmitter.emit({ startDate: this.startDate })
    }

  }

  render () {
    return (
      <Host>
        <nav>
          <mds-button class="action-back" icon={miBaselineBackIosNew} variant="dark" tone="quiet" onClick={event => {
            if (this.currentView == 'calendar') {
              event.stopPropagation()
              this.changeMonth(-1)
            } else if (this.currentView == 'years') {
              event.stopPropagation()
              this.selectedYear -= 10
            } else {
              event.stopPropagation()
            }
          }}></mds-button>
          <div class="select-month-or-year">
            {(this.currentView  === 'calendar' || this.currentView === 'months') && <mds-button class="action-month" variant="dark" tone="quiet" onClick={event => {
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
            if (this.currentView == 'calendar') {
              event.stopPropagation()
              this.changeMonth(1)
            } else if (this.currentView == 'years') {
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
                  date={dayInfo.date.toFormat('yyyy-MM-dd')}
                  month={dayInfo.isCurrentMonth ? 'current' : 'other'}
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

              {Array.from({ length: 10 }).map((_, index) => {
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

      </Host>
    )
  }
}
